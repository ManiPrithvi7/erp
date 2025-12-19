import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const update = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  // Find document by id and updates with the required fields
  req.body.removed = false;
  const result = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    req.body,
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();
  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  } else {
    const response: ApiResponse<T> = {
      success: true,
      result: result as any,
      message: 'we update this document ',
    };
    return res.status(200).json(response);
  }
};

export default update;


