import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const create = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  // Creating a new document in the collection
  req.body.removed = false;
  const result = await new Model({
    ...req.body,
  }).save();

  // Returning successfull response
  const response: ApiResponse<T> = {
    success: true,
    result: result as any,
    message: 'Successfully Created the document in Model ',
  };
  return res.status(200).json(response);
};

export default create;


