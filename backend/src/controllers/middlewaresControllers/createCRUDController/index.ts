import { modelsFiles } from '@/models/utils';
import mongoose, { Model } from 'mongoose';

import create from './create';
import read from './read';
import update from './update';
import remove from './remove';
import search from './search';
import filter from './filter';
import summary from './summary';
import listAll from './listAll';
import paginatedList from './paginatedList';

import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';

export interface CRUDMethods {
  create: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  read: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  update: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  delete: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  list: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  listAll: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  search: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  filter: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  summary: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>;
  [key: string]: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>>> | Promise<void>; // Allow additional methods like mail, convert
}

const createCRUDController = (modelName: string): CRUDMethods => {
  if (!modelsFiles.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist`);
  }

  const Model = mongoose.model(modelName);
  const crudMethods: CRUDMethods = {
    create: (req, res) => create(Model, req, res),
    read: (req, res) => read(Model, req, res),
    update: (req, res) => update(Model, req, res),
    delete: (req, res) => remove(Model, req, res),
    list: (req, res) => paginatedList(Model, req, res),
    listAll: (req, res) => listAll(Model, req, res),
    search: (req, res) => search(Model, req, res),
    filter: (req, res) => filter(Model, req, res),
    summary: (req, res) => summary(Model, req, res),
  };
  return crudMethods;
};

export default createCRUDController;

