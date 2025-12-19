import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';
import { ApiResponse } from '@/types';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const sort = (req.query.sort as string) || 'desc';
  const sortOrder = sort === 'desc' ? -1 : 1;

  //  Query the database for a list of all results
  const result = await Setting.find({
    removed: false,
    isPrivate: false,
  }).sort({ created: sortOrder });

  if (result.length > 0) {
    const response: ApiResponse<ISetting[]> = {
      success: true,
      result: result as any,
      message: 'Successfully found all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<ISetting[]> = {
      success: false,
      result: [],
      message: 'Collection is Empty',
    };
    return res.status(203).json(response);
  }
};

export default listAll;


