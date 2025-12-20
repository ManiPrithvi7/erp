import { Response } from 'express';
import { Model, Document } from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const create = async (Model: Model<any>, req: AuthenticatedRequest, res: Response) => {
  // Creating a new document in the collection
  req.body.removed = false;
  const result = await new Model({
    ...req.body,
  }).save();

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully Created the document in Model ',
  });
};

export default create;


