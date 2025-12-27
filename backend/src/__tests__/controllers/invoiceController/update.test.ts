import { Request, Response } from 'express';
import mongoose from 'mongoose';
import update from '@/controllers/appControllers/invoiceController/update';
import Invoice from '@/models/appModels/Invoice';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('Invoice Controller - Update', () => {
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
          itemName: 'Test Item 1',
          description: 'Test Description',
          quantity: 2,
          price: 100,
          total: 200,
        },
        {
          itemName: 'Test Item 2',
          description: 'Test Description 2',
          quantity: 3,
          price: 50,
          total: 150,
        },
      ],
      taxRate: 10,
      subTotal: 350,
      taxTotal: 35,
      total: 385,
      discount: 0,
      credit: 0,
      paymentStatus: 'unpaid',
      currency: 'USD',
      createdBy: testAdmin._id,
    });

    mockRequest = {
      params: {
        id: testInvoice._id.toString(),
      },
      body: {
        client: testClient._id.toString(),
        number: 1,
        year: 2024,
        status: 'sent',
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            itemName: 'Updated Item 1',
            description: 'Updated Description',
            quantity: 3,
            price: 100,
            total: 300,
          },
          {
            itemName: 'Updated Item 2',
            description: 'Updated Description 2',
            quantity: 2,
            price: 75,
            total: 150,
          },
        ],
        taxRate: 15,
        notes: 'Updated notes',
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
      await Invoice.deleteMany({});
      await Client.deleteMany({});
      await Admin.deleteMany({});
    }
  }, 5000);

  describe('Successful Invoice Update', () => {
    it('should update invoice with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'we update this document ',
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.status).toBe('sent');
      expect(jsonCall.result.items).toHaveLength(2);
    });

    it('should recalculate totals correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const invoice = jsonCall.result;

      // subTotal = (3 * 100) + (2 * 75) = 300 + 150 = 450
      expect(invoice.subTotal).toBe(450);
      // taxTotal = 450 * 15% = 67.5
      expect(invoice.taxTotal).toBe(67.5);
      // total = 450 + 67.5 = 517.5
      expect(invoice.total).toBe(517.5);
    });

    it('should preserve credit when updating invoice', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set existing credit
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 100 });

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.credit).toBe(100);
    });

    it('should recalculate payment status based on credit', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set credit to match new total (517.5)
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 517.5 });

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // paymentStatus = (517.5 - 0) === 517.5 ? 'paid' : 517.5 > 0 ? 'partially' : 'unpaid'
      expect(jsonCall.result.paymentStatus).toBe('paid');
    });

    it('should set paymentStatus to partially when credit is less than total', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set credit to less than new total
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 200 });

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // paymentStatus = (517.5 - 0) === 200 ? 'paid' : 200 > 0 ? 'partially' : 'unpaid'
      expect(jsonCall.result.paymentStatus).toBe('partially');
    });

    it('should set paymentStatus to unpaid when credit is zero', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // paymentStatus = (517.5 - 0) === 0 ? 'paid' : 0 > 0 ? 'partially' : 'unpaid'
      expect(jsonCall.result.paymentStatus).toBe('unpaid');
    });

    it('should update PDF file name', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.pdf).toBe(`invoice-${testInvoice._id}.pdf`);
    });

    it('should update all invoice fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.status).toBe('sent');
      expect(jsonCall.result.notes).toBe('Updated notes');
      expect(jsonCall.result.taxRate).toBe(15);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing required fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      delete mockRequest.body!.client;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          result: null,
        })
      );
    });

    it('should return 400 for invalid date', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.date = 'invalid-date';

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for empty items array', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.items = [];

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Items cannot be empty',
        })
      );
    });

    it('should return 400 for invalid item structure', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.items = [
        {
          itemName: 'Test Item',
          // Missing required fields: quantity, price
        },
      ];

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Invoice Not Found', () => {
    it('should return 404 when invoice does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.params!.id = new mongoose.Types.ObjectId().toString();

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

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

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invoice not found',
        })
      );
    });
  });

  describe('Payment Status Calculation with Discount', () => {
    it('should calculate payment status correctly with discount', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // New total: 517.5, discount: 17.5, credit: 500
      mockRequest.body!.discount = 17.5;
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 500 });

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // paymentStatus = (517.5 - 17.5) === 500 ? 'paid' : 500 > 0 ? 'partially' : 'unpaid'
      expect(jsonCall.result.paymentStatus).toBe('paid');
    });

    it('should handle payment status when new total is less than credit', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Set high credit
      await Invoice.findByIdAndUpdate(testInvoice._id, { credit: 1000 });

      // Update with lower total
      mockRequest.body!.items = [
        {
          itemName: 'Cheap Item',
          quantity: 1,
          price: 10,
          total: 10,
        },
      ];

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // New total: 11 (10 + 10% tax), credit: 1000
      // paymentStatus = (11 - 0) === 1000 ? 'paid' : 1000 > 0 ? 'partially' : 'unpaid'
      expect(jsonCall.result.paymentStatus).toBe('partially');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero tax rate', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.taxRate = 0;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.taxTotal).toBe(0);
      expect(jsonCall.result.total).toBe(jsonCall.result.subTotal);
    });

    it('should handle high tax rate', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.taxRate = 25;

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // subTotal: 450, taxTotal: 450 * 0.25 = 112.5
      expect(jsonCall.result.taxTotal).toBe(112.5);
      expect(jsonCall.result.total).toBe(562.5);
    });

    it('should handle decimal quantities and prices', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.items = [
        {
          itemName: 'Test Item',
          quantity: 2.5,
          price: 10.99,
          total: 27.475,
        },
      ];

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.subTotal).toBeCloseTo(27.475, 2);
    });

    it('should remove currency field if provided', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.currency = 'EUR';

      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // Currency should remain as original (USD) or be removed from update
      // Based on code: if (body.hasOwnProperty('currency')) { delete body.currency; }
      expect(jsonCall.result.currency).toBe('USD'); // Original value preserved
    });
  });

  describe('Performance Tests', () => {
    it('should update invoice efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle multiple items efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create invoice with many items
      mockRequest.body!.items = Array.from({ length: 100 }, (_, i) => ({
        itemName: `Item ${i + 1}`,
        quantity: 1,
        price: 10,
        total: 10,
      }));

      const startTime = Date.now();
      await update(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.items).toHaveLength(100);
    });
  });
});

