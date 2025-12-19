import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const filter = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'filter not provided correctly',
    };
    return res.status(403).json(response);
  }
  const result = await Model.find({
    removed: false,
  })
    .where(req.query.filter as string)
    .equals(req.query.equal)
    .exec();
  if (!result || result.length === 0) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  } else {
    // Return success resposne
    const response: ApiResponse<T[]> = {
      success: true,
      result: result as any,
      message: 'Successfully found all documents  ',
    };
    return res.status(200).json(response);
  }
};

export default filter;


