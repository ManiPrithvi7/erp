import mongoose from 'mongoose';
import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { AuthenticatedRequest } from '@/types';
import { Response } from 'express';
import { ApiResponse } from '@/types';

import summary from './summary';

function modelController() {
  const Model = mongoose.model('Client') as mongoose.Model<unknown>;
  const methods = createCRUDController('Client');

  methods.summary = (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => summary(Model, req, res);
  return methods;
}

export default modelController();


