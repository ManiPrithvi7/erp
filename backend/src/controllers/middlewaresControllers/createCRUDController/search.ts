import { Response } from 'express';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const search = async (Model: Model<any>, req: AuthenticatedRequest, res: Response) => {
  const fieldsArray = req.query.fields ? (req.query.fields as string).split(',') : ['name'];

  const fields: any = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q as string, 'i') } });
  }

  const results = await Model.find({
    ...fields,
  })
    .where('removed', false)
    .limit(20)
    .exec();

  if (results.length >= 1) {
    return res.status(200).json({
      success: true,
      result: results,
      message: 'Successfully found all documents',
    });
  } else {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }
};

export default search;


