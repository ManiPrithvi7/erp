import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const read = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  // Find document by id
  const result = await Model.findOne({
    _id: req.params.id,
    removed: false,
  }).exec();
  // If no results found, return document not found
  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  } else {
    // Return success resposne
    const response: ApiResponse<T> = {
      success: true,
      result: result as any,
      message: 'we found this document ',
    };
    return res.status(200).json(response);
  }
};

export default read;


