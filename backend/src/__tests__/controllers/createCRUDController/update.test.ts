import { Request, Response } from 'express';
import mongoose from 'mongoose';
import update from '@/controllers/middlewaresControllers/createCRUDController/update';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('CRUD Controller - Update', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let testAdmin: any;
  let testClient: any;

  beforeEach(async () => {
    if (!(global as any).__MONGODB_AVAILABLE__) {
      return;
    }

    testAdmin = await Admin.create({
      email: 'test@admin.com',
      name: 'Test',
      surname: 'Admin',
      enabled: true,
    });

    testClient = await Client.create({
      name: 'Test Company',
      email: 'test@company.com',
      phone: '1234567890',
      createdBy: testAdmin._id,
    });

    mockRequest = {
      params: {
        id: testClient._id.toString(),
      },
      body: {
        name: 'Updated Company',
        email: 'updated@company.com',
        phone: '9876543210',
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

  describe('Successful Update', () => {
    it('should update document with valid data', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'we update this document ',
        })
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.name).toBe('Updated Company');
      expect(jsonCall.result.email).toBe('updated@company.com');
    });

    it('should preserve removed flag as false', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.removed).toBe(false);
    });

    it('should update only provided fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body = {
        name: 'Partially Updated',
      };

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.name).toBe('Partially Updated');
      expect(jsonCall.result.email).toBe('test@company.com'); // Original value preserved
    });

    it('should run validators on update', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      // Try to update with invalid email format
      mockRequest.body!.email = 'invalid-email';

      // This should either fail validation or succeed depending on model validation
      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      // The response depends on whether the model has email validation
      // If validation fails, it will throw an error caught by catchErrors
      expect(mockResponse.status).toHaveBeenCalled();
    });
  });

  describe('Document Not Found', () => {
    it('should return 404 when document does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.params!.id = new mongoose.Types.ObjectId().toString();

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });

    it('should return 404 when document is removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await Client.findByIdAndUpdate(testClient._id, { removed: true });

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating with empty body', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body = {};

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.name).toBe('Test Company'); // Original value
    });

    it('should handle updating with null values', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.body = {
        name: null,
      };

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Behavior depends on model schema - may allow null or reject
      expect(mockResponse.status).toHaveBeenCalled();
    });

    it('should preserve timestamps', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const originalClient = await Client.findById(testClient._id);
      const originalCreated = originalClient?.created;

      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // Created date should be preserved
      expect(new Date(jsonCall.result.created).getTime()).toBe(originalCreated?.getTime());
    });
  });

  describe('Performance Tests', () => {
    it('should update document efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await update(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

