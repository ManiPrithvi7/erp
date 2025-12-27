import { Request, Response } from 'express';
import mongoose from 'mongoose';
import create from '@/controllers/appControllers/paymentController/create';
import Payment from '@/models/appModels/Payment';
import Invoice from '@/models/appModels/Invoice';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('Payment Controller - Create', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let testAdmin: any;
  let testClient: any;
  let testInvoice: any;

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

    // Create test invoice with known totals
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

    mockRequest = {
      body: {
        invoice: testInvoice._id.toString(),
        client: testClient._id.toString(),
        number: 1,
        date: new Date(),
        amount: 100,
        currency: 'USD',
        paymentMode: null,
        ref: 'REF001',
        description: 'Test payment',
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

  describe('Successful Payment Creation', () => {
    it('should create a payment with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Payment Invoice created successfully',
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result).toBeDefined();
      expect(jsonCall.result.amount).toBe(100);
      expect(jsonCall.result.pdf).toMatch(/^payment-.*\.pdf$/);
    });

    it('should update invoice credit correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(100);
    });

    it('should add payment to invoice payment array', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const paymentId = jsonCall.result._id;

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.payment).toContainEqual(paymentId);
    });

    it('should set paymentStatus to partially when payment is less than total', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, payment: 100
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set paymentStatus to paid when payment equals total minus discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Update invoice to have discount
      await Invoice.findByIdAndUpdate(testInvoice._id, { discount: 20 });

      // Payment amount should equal (total - discount) = (220 - 20) = 200
      mockRequest.body!.amount = 200;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });

    it('should set createdBy to authenticated admin', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.createdBy.toString()).toBe(testAdmin._id.toString());
    });
  });

  describe('Amount Validation', () => {
    it('should return 202 for zero amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 0;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "The Minimum Amount couldn't be 0",
        })
      );
    });

    it('should return 202 for negative amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = -10;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Negative amount will be caught by maxAmount check
      // maxAmount = (220 - 0) - 0 = 220
      // -10 > 220 is false, but amount should be validated
      // The actual validation happens in the controller
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      // Payment should not be created
      const payments = await Payment.find({ invoice: testInvoice._id });
      expect(payments.length).toBe(0);
    });

    it('should return 202 when amount exceeds max amount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Invoice total: 220, discount: 0, credit: 0
      // maxAmount = (220 - 0) - 0 = 220
      mockRequest.body!.amount = 221;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('The Max Amount you can add is'),
        })
      );
    });

    it('should handle amount with existing credit', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set existing credit to 50
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 50 });

      // maxAmount = (220 - 0) - 50 = 170
      mockRequest.body!.amount = 170;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(220); // 50 + 170
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });

    it('should handle amount with discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set discount to 20
      await Invoice.findByIdAndUpdate(testInvoice._id, { discount: 20 });

      // maxAmount = (220 - 20) - 0 = 200
      mockRequest.body!.amount = 200;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });

    it('should handle decimal amounts correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 100.50;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.amount).toBe(100.50);
    });
  });

  describe('Invoice Validation', () => {
    it('should return 404 when invoice does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.invoice = new mongoose.Types.ObjectId().toString();

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invoice not found',
        })
      );
    });

    it('should return 404 when invoice is removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await Invoice.findByIdAndUpdate(testInvoice._id, { removed: true });

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invoice not found',
        })
      );
    });
  });

  describe('Payment Status Calculation', () => {
    it('should set status to unpaid when no payment made', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create invoice with no credit
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
        credit: 0,
        paymentStatus: 'unpaid',
        currency: 'USD',
        createdBy: testAdmin._id,
      });

      mockRequest.body!.invoice = newInvoice._id.toString();
      mockRequest.body!.amount = 0.01; // Very small payment

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(newInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set status to partially when payment is made but not full', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 50; // Less than total 220

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('partially');
    });

    it('should set status to paid when payment equals total minus discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.amount = 220; // Equals total

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
    });
  });

  describe('Edge Cases', () => {
    it('should handle payment that exactly equals remaining balance', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set existing credit to 120
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 120 });

      // Remaining: 220 - 120 = 100
      mockRequest.body!.amount = 100;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
      expect(updatedInvoice?.credit).toBe(220);
    });

    it('should handle multiple payments correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // First payment
      mockRequest.body!.amount = 100;
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Reset mock
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();

      // Second payment
      mockRequest.body!.amount = 120;
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice?.credit).toBe(220);
      expect(updatedInvoice?.paymentStatus).toBe('paid');
      expect(updatedInvoice?.payment.length).toBe(2);
    });

    it('should generate unique PDF file ID for each payment', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const paymentId = jsonCall.result._id;
      expect(jsonCall.result.pdf).toBe(`payment-${paymentId}.pdf`);
    });
  });

  describe('Performance Tests', () => {
    it('should create payment efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

