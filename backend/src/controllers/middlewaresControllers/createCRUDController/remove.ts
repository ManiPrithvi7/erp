import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const remove = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  // Find the document by id and delete it
  const updates = {
    removed: true,
  };
  // Find the document by id and delete it
  const result = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();
  // If no results found, return document not found
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
      message: 'Successfully Deleted the document ',
    };
    return res.status(200).json(response);
  }
};

export default remove;


