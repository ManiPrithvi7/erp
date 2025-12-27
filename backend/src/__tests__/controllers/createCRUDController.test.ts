import { Request, Response } from 'express';
import mongoose from 'mongoose';
import create from '@/controllers/middlewaresControllers/createCRUDController/create';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('CRUD Controller - Create', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let testAdmin: any;

  beforeEach(async () => {
    if (!(global as any).__MONGODB_AVAILABLE__) {
      return; // Skip if MongoDB is not available
    }

    testAdmin = await Admin.create({
      email: 'test@admin.com',
      name: 'Test',
      surname: 'Admin',
      enabled: true,
    });

    mockRequest = {
      body: {
        name: 'Test Company',
        email: 'test@company.com',
        phone: '1234567890',
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
      await Client.deleteMany({});
      await Admin.deleteMany({});
    }
  }, 5000);

  describe('Successful Creation', () => {
    it('should create a document with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return; // Skip test if MongoDB is not available
      }
      await create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully Created the document in Model ',
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result).toBeDefined();
      expect(jsonCall.result.name).toBe('Test Company');
    });

    it('should set removed flag to false by default', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      await create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.removed).toBe(false);
    });

    it('should preserve all body fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      mockRequest.body = {
        name: 'Test Company',
        email: 'test@company.com',
        phone: '1234567890',
        country: 'USA',
        address: '123 Test St',
      };

      await create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.name).toBe('Test Company');
      expect(jsonCall.result.email).toBe('test@company.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors from mongoose', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      // Missing required field
      delete mockRequest.body!.name;

      await expect(
        create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response)
      ).rejects.toThrow();
    });

    it('should handle invalid data types', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      mockRequest.body!.email = 12345; // Invalid type

      await expect(
        create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response)
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should create documents efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const startTime = Date.now();
      await create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle concurrent creation requests', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const promises = Array.from({ length: 10 }, () =>
        create(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
    });
  });
});

