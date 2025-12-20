import { Response } from 'express';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const listAll = async (Model: Model<any>, req: AuthenticatedRequest, res: Response) => {
  const sort = (req.query.sort as string) || 'desc';
  const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined;

  //  Query the database for a list of all results

  let result;
  if (enabled === undefined) {
    result = await Model.find({
      removed: false,
    })
      .sort({ created: sort as any })
      .exec();
  } else {
    result = await Model.find({
      removed: false,
      enabled: enabled,
    })
      .sort({ created: sort as any })
      .exec();
  }

  if (result.length > 0) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

export default listAll;

