/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

export const catchErrors = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch((error: Error) => {
      // Log error details for debugging
      console.log('\n❌ ===== CONTROLLER ERROR =====');
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      console.log(`🔹 Controller: ${fn.name}`);
      console.log(`🔹 Route: ${req.method} ${req.originalUrl || req.url}`);
      console.log(`🔹 Error Name: ${error.name}`);
      console.log(`🔹 Error Message: ${error.message}`);
      if (error.message.includes('buffering timed out')) {
        console.log(`🔴 MONGODB BUFFERING TIMEOUT - Check database connection!`);
        console.log(`   - Verify DATABASE URL in .env file`);
        console.log(`   - Check if MongoDB server is running`);
        console.log(`   - Check network connectivity`);
      }
      if (error.stack) {
        console.log(`🔹 Stack Trace:`, error.stack);
      }
      console.log('================================\n');

      if (error.name == 'ValidationError') {
        const response: ApiResponse<null> = {
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          controller: fn.name,
          error: error,
        };
        return res.status(400).json(response);
      } else {
        // Server Error
        const response: ApiResponse<null> = {
          success: false,
          result: null,
          message: error.message,
          controller: fn.name,
          error: error,
        };
        return res.status(500).json(response);
      }
    });
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
export const notFound = (req: Request, res: Response, next: NextFunction): Response => {
  const response: ApiResponse<null> = {
    success: false,
    result: null,
    message: "Api url doesn't exist ",
  };
  return res.status(404).json(response);
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
interface ErrorWithStatus extends Error {
  status?: number;
}

export const developmentErrors = (error: Error, req: Request, res: Response, next: NextFunction): Response => {
  error.stack = error.stack || '';
  const errorWithStatus = error as ErrorWithStatus;
  const errorDetails = {
    message: error.message,
    status: errorWithStatus.status,
    stackHighlighted: error.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };

  const response: ApiResponse<null> = {
    success: false,
    result: null,
    message: error.message,
    error: error,
  };
  return res.status(500).json(response);
};

/*
  Production Error Handler

  No stacktraces are leaked to admin
*/
export const productionErrors = (error: Error, req: Request, res: Response, next: NextFunction): Response => {
  const response: ApiResponse<null> = {
    success: false,
    result: null,
    message: error.message,
    error: error,
  };
  return res.status(500).json(response);
};

export default {
  catchErrors,
  notFound,
  developmentErrors,
  productionErrors,
};

