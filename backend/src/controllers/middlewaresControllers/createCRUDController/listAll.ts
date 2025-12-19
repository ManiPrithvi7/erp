import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const listAll = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  const sort = (req.query.sort as string) || 'desc';
  const sortOrder = sort === 'desc' ? -1 : 1;
  const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined;

  //  Query the database for a list of all results

  let result;
  if (enabled === undefined) {
    result = await Model.find({
      removed: false,
    })
      .sort({ created: sortOrder })
      .populate([])
      .exec();
  } else {
    result = await Model.find({
      removed: false,
      enabled: enabled,
    })
      .sort({ created: sortOrder })
      .populate([])
      .exec();
  }

  if (result.length > 0) {
    const response: ApiResponse<T[]> = {
      success: true,
      result: result as any,
      message: 'Successfully found all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<T[]> = {
      success: false,
      result: [],
      message: 'Collection is Empty',
    };
    return res.status(203).json(response);
  }
};

export default listAll;

