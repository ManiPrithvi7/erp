import { Request } from 'express';
import { Document } from 'mongoose';

// Extend Express Request to include admin user
export interface AuthenticatedRequest extends Request {
  admin?: {
    _id: string;
    email: string;
    name?: string;
    surname?: string;
    role?: string;
    enabled?: boolean;
  };
}

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  result?: T | null;
  message: string;
  error?: any;
  errorMessage?: string;
  controller?: string;
}

