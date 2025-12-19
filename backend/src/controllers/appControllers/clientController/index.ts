import mongoose, { Model } from 'mongoose';
import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import { Request, Response } from 'express';
import summary from './summary';
import { IClient } from '@/models/appModels/Client';

function modelController(): CRUDController {
  const Model: Model<IClient> = mongoose.model<IClient>('Client');
  const methods: CRUDController = createCRUDController('Client');

  methods.summary = (req: Request, res: Response) => summary(Model, req, res);
  return methods;
}

export default modelController();

