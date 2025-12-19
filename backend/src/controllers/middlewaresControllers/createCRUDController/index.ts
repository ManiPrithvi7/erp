import mongoose, { Document } from 'mongoose';
import { modelsFiles } from '@/models/utils';
import { CRUDController } from '@/types';
import { create } from './create';
import { read } from './read';
import { update } from './update';
import { remove } from './remove';
import { search } from './search';
import { filter } from './filter';
import { summary } from './summary';
import { listAll } from './listAll';
import { paginatedList } from './paginatedList';
import { Request, Response } from 'express';

export const createCRUDController = (modelName: string): CRUDController => {
  if (!modelsFiles.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist`);
  }

  const Model = mongoose.model<Document>(modelName);
  const crudMethods: CRUDController = {
    create: (req: Request, res: Response) => create(Model, req, res),
    read: (req: Request, res: Response) => read(Model, req, res),
    update: (req: Request, res: Response) => update(Model, req, res),
    delete: (req: Request, res: Response) => remove(Model, req, res),
    list: (req: Request, res: Response) => paginatedList(Model, req, res),
    listAll: (req: Request, res: Response) => listAll(Model, req, res),
    search: (req: Request, res: Response) => search(Model, req, res),
    filter: (req: Request, res: Response) => filter(Model, req, res),
    summary: (req: Request, res: Response) => summary(Model, req, res),
  };
  return crudMethods;
};

export default createCRUDController;

