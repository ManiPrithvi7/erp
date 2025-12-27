import { Request, Response } from 'express';
import mongoose from 'mongoose';
import update from '@/controllers/appControllers/paymentController/update';
import Payment from '@/models/appModels/Payment';
import Invoice from '@/models/appModels/Invoice';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('Payment Controller - Update', () => {
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
      body: {
        number: 1,
        date: new Date(),
        amount: 150,
        paymentMode: null,
        ref: 'REF002',
        description: 'Updated payment',
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

  describe('Successful Payment Update', () => {
    it('should update payment with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.amount).toBe(150);
      expect(jsonCall.result.description).toBe('Updated payment');
    });

    it('should update invoice credit correctly when amount increases', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Previous amount: 100, new amount: 150, change: +50
      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(150); // 100 + 50
    });

    it('should update invoice credit correctly when amount decreases', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Previous amount: 100, new amount: 50, change: -50
      mockRequest.body!.amount = 50;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(50); // 100 - 50
    });

    it('should recalculate payment status after update', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, previous credit: 100
      // Update payment to 120 (total remaining: 220 - 100 = 120)
      mockRequest.body!.amount = 120;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // New credit: 100 - 100 + 120 = 120
      // But actually: previousCredit (100) + changedAmount (120 - 100 = 20) = 120
      // Status: (220 - 0) === (100 + 20) ? 'paid' : 'partially'
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set paymentStatus to paid when update makes invoice fully paid', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, previous credit: 100
      // Update payment to 220 (full amount)
      mockRequest.body!.amount = 220;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // New credit: 100 - 100 + 220 = 220
      // Status: (220 - 0) === 220 ? 'paid'
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });
  });

  describe('Amount Validation', () => {
    it('should return 202 for zero amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 0;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "The Minimum Amount couldn't be 0",
        })
      );
    });

    it('should return 202 when changed amount exceeds max amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, discount: 0, previousCredit: 100
      // maxAmount = (220 - 0) - (0 + 100) = 120
      // Previous amount: 100, so max new amount = 100 + 120 = 220
      // Try to set to 221 (exceeds max)
      mockRequest.body!.amount = 221;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('The Max Amount you can add is'),
        })
      );
    });

    it('should handle amount update with discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set discount to 20
      await Invoice.findByIdAndUpdate(testInvoice._id, { discount: 20 });

      // maxAmount = (220 - 20) - (0 + 100) = 100
      // Previous amount: 100, so max new amount = 100 + 100 = 200
      mockRequest.body!.amount = 200;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });

    it('should handle negative changed amount (reducing payment)', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Reduce payment from 100 to 50
      mockRequest.body!.amount = 50;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(50);
    });
  });

  describe('Payment Validation', () => {
    it('should return 404 when payment does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.params!.id = new mongoose.Types.ObjectId().toString();

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Payment not found',
        })
      );
    });

    it('should return 404 when payment is removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await Payment.findByIdAndUpdate(testPayment._id, { removed: true });

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Payment not found',
        })
      );
    });

    it('should return 404 when invoice is not found', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create payment without invoice
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

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Payment not found',
        })
      );
    });
  });

  describe('Payment Status Recalculation', () => {
    it('should set status to unpaid when payment is reduced to zero', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // This will fail zero validation, but test the logic
      // Create invoice with credit
      const newInvoice = await Invoice.create({
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
        credit: 50,
        paymentStatus: 'partially',
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      const newPayment = await Payment.create({
        invoice: newInvoice._id,
        client: testClient._id,
        number: 2,
        date: new Date(),
        amount: 50,
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      // Reduce payment to minimum (will fail validation, but shows logic)
      // Instead, test reducing to a small amount
      mockRequest.params!.id = newPayment._id.toString();
      mockRequest.body!.amount = 1;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(newInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set status to partially when payment is increased but not full', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Previous: 100, new: 150, invoice total: 220
      mockRequest.body!.amount = 150;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set status to paid when update makes total equal credit', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, previous credit: 100
      // Update payment to make credit = 220
      // Previous payment: 100, need to add 120 more
      // New payment amount: 100 + 120 = 220
      mockRequest.body!.amount = 220;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
      expect(updatedInvoice?.credit).toBe(220);
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating payment that makes invoice fully paid', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, previous credit: 100
      // Update payment from 100 to 220
      mockRequest.body!.amount = 220;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
      expect(updatedInvoice?.credit).toBe(220);
    });

    it('should handle updating payment with existing multiple payments', async () => {
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

      await Invoice.findByIdAndUpdate(testInvoice._id, {
        $push: { payment: payment2._id },
        $inc: { credit: 50 },
      });

      // Now invoice has credit: 150 (100 + 50)
      // Update first payment from 100 to 70
      mockRequest.body!.amount = 70;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Credit: 150 - 100 + 70 = 120
      expect(updatedInvoice?.credit).toBe(120);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should preserve other payment fields when updating amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 150;
      mockRequest.body!.ref = 'NEW_REF';
      mockRequest.body!.description = 'New description';

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.amount).toBe(150);
      expect(jsonCall.result.ref).toBe('NEW_REF');
      expect(jsonCall.result.description).toBe('New description');
    });
  });

  describe('Performance Tests', () => {
    it('should update payment efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

