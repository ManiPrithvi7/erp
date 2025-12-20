import mongoose from 'mongoose';
import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';

import summary from './summary';

function modelController() {
  const Model = mongoose.model('Client');
  const methods = createCRUDController('Client');

  methods.summary = (req: any, res: any) => summary(Model, req, res);
  return methods;
}

export default modelController();


