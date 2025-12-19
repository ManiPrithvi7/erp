import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const summary = async <T extends Document>(Model: Model<T>, req: Request, res: Response): Promise<Response> => {
  //  Query the database for a list of all results
  const countPromise = Model.countDocuments({
    removed: false,
  });

  let resultsPromise;
  if (req.query.filter && req.query.equal !== undefined) {
    resultsPromise = Model.countDocuments({
      removed: false,
    })
      .where(req.query.filter as string)
      .equals(req.query.equal)
      .exec();
  } else {
    resultsPromise = Promise.resolve(0);
  }

  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs > 0) {
    const response: ApiResponse<{ countFilter: number; countAllDocs: number }> = {
      success: true,
      result: { countFilter: countFilter as number, countAllDocs },
      message: 'Successfully count all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<[]> = {
      success: false,
      result: [],
      message: 'Collection is Empty',
    };
    return res.status(203).json(response);
  }
};

export default summary;


