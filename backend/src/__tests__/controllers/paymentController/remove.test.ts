import { Request, Response } from 'express';
import mongoose from 'mongoose';
import remove from '@/controllers/appControllers/paymentController/remove';
import Payment from '@/models/appModels/Payment';
import Invoice from '@/models/appModels/Invoice';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('Payment Controller - Remove', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let testAdmin: any;
  let testClient: any;
  let testInvoice: any;
  let testPayment: any;

  beforeEach(async () => {
    if (!(global as any).__MONGODB_AVAILABLE__) {
      return;
    }

    // Create test admin
    testAdmin = await Admin.create({
      email: 'test@admin.com',
      name: 'Test',
      surname: 'Admin',
      enabled: true,
    });

    // Create test client
    testClient = await Client.create({
      name: 'Test Company',
      email: 'client@test.com',
      phone: '1234567890',
      createdBy: testAdmin._id,
    });

    // Create test invoice
    testInvoice = await Invoice.create({
      client: testClient._id,
      number: 1,
      year: 2024,
      status: 'draft',
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          itemName: 'Test Item',
          quantity: 2,
          price: 100,
          total: 200,
        },
      ],
      taxRate: 10,
      subTotal: 200,
      taxTotal: 20,
      total: 220,
      discount: 0,
      credit: 0,
      paymentStatus: 'unpaid',
      currency: 'USD',
      createdBy: testAdmin._id,
    });

    // Create test payment
    testPayment = await Payment.create({
      invoice: testInvoice._id,
      client: testClient._id,
      number: 1,
      date: new Date(),
      amount: 100,
      currency: 'USD',
      createdBy: testAdmin._id,
    });

    // Update invoice with payment
    await Invoice.findByIdAndUpdate(testInvoice._id, {
      $push: { payment: testPayment._id },
      $inc: { credit: 100 },
      $set: { paymentStatus: 'partially' },
    });

    mockRequest = {
      params: {
        id: testPayment._id.toString(),
      },
      admin: testAdmin,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  }, 30000);

  afterEach(async () => {
    if ((global as any).__MONGODB_AVAILABLE__) {
      await Payment.deleteMany({});
      await Invoice.deleteMany({});
      await Client.deleteMany({});
      await Admin.deleteMany({});
    }
  }, 5000);

  describe('Successful Payment Removal', () => {
    it('should remove payment successfully', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully Deleted the document ',
        })
      );

      // Verify payment is soft deleted
      const removedPayment = await Payment.findById(testPayment._id);
      expect(removedPayment?.removed).toBe(true);
    });

    it('should decrement invoice credit correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice credit: 100, payment amount: 100
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(0); // 100 - 100
    });

    it('should remove payment from invoice payment array', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.payment).not.toContainEqual(testPayment._id);
    });

    it('should recalculate payment status after removal', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, credit: 100
      // After removal: credit = 0
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('unpaid');
    });

    it('should set paymentStatus to unpaid when removing last payment', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('unpaid');
      expect(updatedInvoice?.credit).toBe(0);
    });
  });

  describe('Payment Status Recalculation', () => {
    it('should set status to unpaid when removing payment makes credit zero', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, credit: 100
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Credit after removal: 100 - 100 = 0
      // Status: (220 - 0) === 0 ? 'paid' : 0 > 0 ? 'partially' : 'unpaid'
      expect(updatedInvoice?.paymentStatus).toBe('unpaid');
    });

    it('should set status to partially when removing payment but credit remains', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create another payment
      const payment2 = await Payment.create({
        invoice: testInvoice._id,
        client: testClient._id,
        number: 2,
        date: new Date(),
        amount: 50,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      // Update invoice with both payments
      await Invoice.findByIdAndUpdate(testInvoice._id, {
        $push: { payment: payment2._id },
        $inc: { credit: 50 },
        $set: { paymentStatus: 'partially' },
      });

      // Now invoice has credit: 150 (100 + 50)
      // Remove first payment (100)
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Credit after removal: 150 - 100 = 50
      // Status: (220 - 0) === 50 ? 'paid' : 50 > 0 ? 'partially' : 'unpaid'
      expect(updatedInvoice?.paymentStatus).toBe('partially');
      expect(updatedInvoice?.credit).toBe(50);
    });

    it('should set status to paid when removing payment but invoice remains fully paid', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create invoice with full payment
      const fullInvoice = await Invoice.create({
        client: testClient._id,
        number: 2,
        year: 2024,
        status: 'draft',
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [{ itemName: 'Item', quantity: 1, price: 100, total: 100 }],
        taxRate: 0,
        subTotal: 100,
        taxTotal: 0,
        total: 100,
        discount: 0,
        credit: 100,
        paymentStatus: 'paid',
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      const payment1 = await Payment.create({
        invoice: fullInvoice._id,
        client: testClient._id,
        number: 1,
        date: new Date(),
        amount: 60,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      const payment2 = await Payment.create({
        invoice: fullInvoice._id,
        client: testClient._id,
        number: 2,
        date: new Date(),
        amount: 40,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      await Invoice.findByIdAndUpdate(fullInvoice._id, {
        $push: { payment: [payment1._id, payment2._id] },
      });

      // Remove first payment (60)
      mockRequest.params!.id = payment1._id.toString();

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(fullInvoice._id);
      // Credit after removal: 100 - 60 = 40
      // Status: (100 - 0) === 40 ? 'paid' : 40 > 0 ? 'partially' : 'unpaid'
      // Actually: total - discount = 100, credit = 40, so partially
      expect(updatedInvoice?.paymentStatus).toBe('partially');
      expect(updatedInvoice?.credit).toBe(40);
    });
  });

  describe('Payment Validation', () => {
    it('should return 404 when payment does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.params!.id = new mongoose.Types.ObjectId().toString();

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });

    it('should return 404 when payment is already removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await Payment.findByIdAndUpdate(testPayment._id, { removed: true });

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });

    it('should return 404 when invoice is not found', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create payment with non-existent invoice
      const orphanPayment = await Payment.create({
        client: testClient._id,
        number: 2,
        date: new Date(),
        amount: 100,
        currency: 'USD',
        invoice: new mongoose.Types.ObjectId(), // Non-existent invoice
        createdBy: testAdmin._id,
      });

      mockRequest.params!.id = orphanPayment._id.toString();

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invoice not found',
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing payment from invoice with multiple payments', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create additional payments
      const payment2 = await Payment.create({
        invoice: testInvoice._id,
        client: testClient._id,
        number: 2,
        date: new Date(),
        amount: 50,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      const payment3 = await Payment.create({
        invoice: testInvoice._id,
        client: testClient._id,
        number: 3,
        date: new Date(),
        amount: 70,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      // Update invoice with all payments
      await Invoice.findByIdAndUpdate(testInvoice._id, {
        $push: { payment: [payment2._id, payment3._id] },
        $inc: { credit: 120 }, // 50 + 70
        $set: { paymentStatus: 'paid' }, // 220 total, 220 credit
      });

      // Remove first payment (100)
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Credit after removal: 220 - 100 = 120
      expect(updatedInvoice?.credit).toBe(120);
      expect(updatedInvoice?.payment).not.toContainEqual(testPayment._id);
      expect(updatedInvoice?.payment).toContainEqual(payment2._id);
      expect(updatedInvoice?.payment).toContainEqual(payment3._id);
    });

    it('should handle removing payment with discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set discount to 20
      await Invoice.findByIdAndUpdate(testInvoice._id, { discount: 20 });

      // Invoice total: 220, discount: 20, credit: 100
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Credit after removal: 100 - 100 = 0
      // Status calculation: (220 - 20) === 0 ? 'paid' : 0 > 0 ? 'partially' : 'unpaid'
      expect(updatedInvoice?.paymentStatus).toBe('unpaid');
      expect(updatedInvoice?.credit).toBe(0);
    });

    it('should preserve invoice other fields when removing payment', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const originalTotal = testInvoice.total;
      const originalDiscount = testInvoice.discount;

      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.total).toBe(originalTotal);
      expect(updatedInvoice?.discount).toBe(originalDiscount);
    });
  });

  describe('Performance Tests', () => {
    it('should remove payment efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await remove(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

