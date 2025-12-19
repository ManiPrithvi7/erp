import { Document, Model } from 'mongoose';

export interface ApiResponse<T = any> {
  success: boolean;
  result: T | null;
  message: string;
  error?: any;
  controller?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: string | string[];
}

import { Request, Response } from 'express';

export interface CRUDController {
  create: (req: Request, res: Response) => Promise<Response | void>;
  read: (req: Request, res: Response) => Promise<Response | void>;
  update: (req: Request, res: Response) => Promise<Response | void>;
  delete: (req: Request, res: Response) => Promise<Response | void>;
  list: (req: Request, res: Response) => Promise<Response | void>;
  listAll: (req: Request, res: Response) => Promise<Response | void>;
  search: (req: Request, res: Response) => Promise<Response | void>;
  filter: (req: Request, res: Response) => Promise<Response | void>;
  summary: (req: Request, res: Response) => Promise<Response | void>;
  [key: string]: any;
}

export type ModelType<T extends Document> = Model<T>;

