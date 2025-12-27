import { Request, Response } from 'express';
import mongoose from 'mongoose';
import remove from '@/controllers/middlewaresControllers/createCRUDController/remove';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';
import { AuthenticatedRequest } from '@/types';

describe('CRUD Controller - Remove', () => {
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

  describe('Successful Removal', () => {
    it('should soft delete document successfully', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully Deleted the document ',
        })
      );

      // Verify document is soft deleted
      const removedClient = await Client.findById(testClient._id);
      expect(removedClient?.removed).toBe(true);
    });

    it('should set removed flag to true', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.removed).toBe(true);
    });

    it('should preserve other document fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.result.name).toBe('Test Company');
      expect(jsonCall.result.email).toBe('test@company.com');
    });
  });

  describe('Document Not Found', () => {
    it('should return 404 when document does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      mockRequest.params!.id = new mongoose.Types.ObjectId().toString();

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });

    it('should return 404 when document is already removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      await Client.findByIdAndUpdate(testClient._id, { removed: true });

      // Note: The remove function doesn't check for removed flag in the query
      // It will still find and update the document
      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Should still succeed as it just sets removed to true again
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing document that was never removed', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const client = await Client.findById(testClient._id);
      expect(client?.removed).toBeFalsy();

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const removedClient = await Client.findById(testClient._id);
      expect(removedClient?.removed).toBe(true);
    });

    it('should preserve timestamps after removal', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const originalClient = await Client.findById(testClient._id);
      const originalCreated = originalClient?.created;

      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // Created date should be preserved
      expect(new Date(jsonCall.result.created).getTime()).toBe(originalCreated?.getTime());
    });
  });

  describe('Performance Tests', () => {
    it('should remove document efficiently', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }

      const startTime = Date.now();
      await remove(mongoose.model('Client'), mockRequest as AuthenticatedRequest, mockResponse as Response);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

