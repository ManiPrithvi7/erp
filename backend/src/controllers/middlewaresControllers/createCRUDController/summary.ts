import { Response } from 'express';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const summary = async (Model: Model<any>, req: AuthenticatedRequest, res: Response) => {
  //  Query the database for a list of all results
  const countPromise = Model.countDocuments({
    removed: false,
  });

  const resultsPromise = Model.countDocuments({
    removed: false,
  })
    .where(req.query.filter as string)
    .equals(req.query.equal)
    .exec();
  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

export default summary;


