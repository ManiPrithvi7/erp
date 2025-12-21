// Re-export all types
export * from './express';
export * from './mongoose';

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  result?: T | null;
  message: string;
  error?: unknown;
  errorMessage?: string;
  controller?: string;
}


