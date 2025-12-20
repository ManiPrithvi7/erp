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

export interface CRUDMethods {
  create: (req: any, res: any) => Promise<any>;
  read: (req: any, res: any) => Promise<any>;
  update: (req: any, res: any) => Promise<any>;
  delete: (req: any, res: any) => Promise<any>;
  list: (req: any, res: any) => Promise<any>;
  listAll: (req: any, res: any) => Promise<any>;
  search: (req: any, res: any) => Promise<any>;
  filter: (req: any, res: any) => Promise<any>;
  summary: (req: any, res: any) => Promise<any>;
  [key: string]: any; // Allow additional methods like mail, convert
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

