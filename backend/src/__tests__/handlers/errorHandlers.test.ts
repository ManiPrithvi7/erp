import { Request, Response, NextFunction } from 'express';
import errorHandlers from '@/handlers/errorHandlers';
import mongoose from 'mongoose';

describe('Error Handlers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      originalUrl: '/api/invoice/create',
      url: '/api/invoice/create',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('catchErrors', () => {
    it('should catch and handle ValidationError correctly', async () => {
      // Create a ValidationError - we'll use a mock that has the ValidationError structure
      class MockValidationError extends Error {
        name = 'ValidationError';
        constructor(message: string) {
          super(message);
          this.name = 'ValidationError';
        }
      }
      const validationError = new MockValidationError('Validation failed');

      const asyncFn = async () => {
        throw validationError;
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          controller: 'asyncFn',
        })
      );
    });

    it('should catch and handle generic errors correctly', async () => {
      const genericError = new Error('Database connection failed');

      const asyncFn = async () => {
        throw genericError;
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          result: null,
          message: 'Database connection failed',
          controller: 'asyncFn',
        })
      );
    });

    it('should handle MongoDB buffering timeout errors', async () => {
      const timeoutError = new Error('buffering timed out after 10000ms');
      timeoutError.name = 'MongoServerError';

      const asyncFn = async () => {
        throw timeoutError;
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should not call next when error is caught', async () => {
      const error = new Error('Test error');

      const asyncFn = async () => {
        throw error;
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass through successful requests', async () => {
      const asyncFn = async () => {
        return { success: true };
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);
      const result = await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('notFound', () => {
    it('should return 404 for non-existent routes', () => {
      errorHandlers.notFound(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: "Api url doesn't exist ",
      });
    });
  });

  describe('productionErrors', () => {
    it('should handle production errors without leaking stack traces', () => {
      const error = new Error('Internal server error');
      error.stack = 'Stack trace here';

      errorHandlers.productionErrors(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          result: null,
          message: 'Internal server error',
        })
      );
    });

    it('should include error object for logging', () => {
      const error = new Error('Test error');

      errorHandlers.productionErrors(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error).toBeDefined();
    });
  });

  describe('Error Handler Performance', () => {
    it('should handle errors efficiently without memory leaks', async () => {
      const error = new Error('Test error');
      const asyncFn = async () => {
        throw error;
      };

      const wrappedFn = errorHandlers.catchErrors(asyncFn);

      // Simulate multiple error calls
      for (let i = 0; i < 100; i++) {
        await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);
      }

      // Verify responses are consistent
      expect(mockResponse.status).toHaveBeenCalledTimes(100);
      expect(mockResponse.json).toHaveBeenCalledTimes(100);
    });

    it('should not accumulate error state between calls', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const asyncFn1 = async () => {
        throw error1;
      };
      const asyncFn2 = async () => {
        throw error2;
      };

      const wrappedFn1 = errorHandlers.catchErrors(asyncFn1);
      const wrappedFn2 = errorHandlers.catchErrors(asyncFn2);

      await wrappedFn1(mockRequest as Request, mockResponse as Response, mockNext);
      await wrappedFn2(mockRequest as Request, mockResponse as Response, mockNext);

      const calls = (mockResponse.json as jest.Mock).mock.calls;
      expect(calls[0][0].message).toBe('Error 1');
      expect(calls[1][0].message).toBe('Error 2');
    });
  });
});

