import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const search = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  const fieldsArray = req.query.fields ? (req.query.fields as string).split(',') : ['name'];

  const fields: { $or: Array<Record<string, any>> } = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q as string, 'i') } });
  }

  let results = await Model.find({
    ...fields,
  })
    .where('removed', false)
    .limit(20)
    .exec();

  if (results.length >= 1) {
    const response: ApiResponse<T[]> = {
      success: true,
      result: results as any,
      message: 'Successfully found all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<T[]> = {
      success: false,
      result: [],
      message: 'No document found by this request',
    };
    return res.status(202).json(response).end();
  }
};

export default search;


