import { Request, Response } from 'express';
import mongoose from 'mongoose';
import create from '@/controllers/appControllers/quoteController/create';
import Quote from '@/models/appModels/Quote';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('Quote Controller - Create', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let testAdmin: any;
  let testClient: any;

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

    mockRequest = {
      body: {
        client: testClient._id.toString(),
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
        currency: 'USD',
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
      await Quote.deleteMany({});
      await Client.deleteMany({});
      await Admin.deleteMany({});
    }
  }, 5000);

  describe('Successful Quote Creation', () => {
    it('should create a quote with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quote created successfully',
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result).toBeDefined();
      expect(jsonCall.result.client).toBeDefined();
      expect(jsonCall.result.items).toHaveLength(2);
    });

    it('should calculate totals correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const quote = jsonCall.result;

      // subTotal = (2 * 100) + (3 * 50) = 200 + 150 = 350
      expect(quote.subTotal).toBe(350);
      // taxTotal = 350 * 10% = 35
      expect(quote.taxTotal).toBe(35);
      // total = 350 + 35 = 385
      expect(quote.total).toBe(385);
    });

    it('should generate PDF file ID', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.pdf).toMatch(/^quote-.*\.pdf$/);
    });

    it('should set createdBy to authenticated admin', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.createdBy.toString()).toBe(testAdmin._id.toString());
    });

    it('should calculate item totals correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.items[0].total).toBe(200); // 2 * 100
      expect(jsonCall.result.items[1].total).toBe(150); // 3 * 50
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing required fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      delete mockRequest.body!.client;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

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

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for empty items array', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.items = [];

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
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

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero tax rate', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.taxRate = 0;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.taxTotal).toBe(0);
      expect(jsonCall.result.total).toBe(jsonCall.result.subTotal);
    });

    it('should handle high tax rate', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.taxRate = 25;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.taxTotal).toBe(87.5); // 350 * 0.25
      expect(jsonCall.result.total).toBe(437.5);
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

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.subTotal).toBeCloseTo(27.475, 2);
    });

    it('should handle large numbers', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body!.items = [
        {
          itemName: 'Expensive Item',
          quantity: 1,
          price: 1000000,
          total: 1000000,
        },
      ];

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.total).toBe(1100000); // 1,000,000 + 10% tax
    });

    it('should handle missing taxRate (defaults to 0)', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      delete mockRequest.body!.taxRate;

      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.taxTotal).toBe(0);
      expect(jsonCall.result.total).toBe(jsonCall.result.subTotal);
    });
  });

  describe('Performance Tests', () => {
    it('should create quote efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle multiple items efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Create quote with many items
      mockRequest.body!.items = Array.from({ length: 100 }, (_, i) => ({
        itemName: `Item ${i + 1}`,
        quantity: 1,
        price: 10,
        total: 10,
      }));

      const startTime = Date.now();
      await create(mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.items).toHaveLength(100);
    });
  });
});

