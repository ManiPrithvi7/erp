import { Response } from 'express';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const paginatedList = async (Model: Model<any>, req: AuthenticatedRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = parseInt(req.query.items as string) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query;

  const fieldsArray = req.query.fields ? (req.query.fields as string).split(',') : [];

  let fields: any;

  fields = fieldsArray.length === 0 ? {} : { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q as string, 'i') } });
  }

  //  Query the database for a list of all results
  const resultsPromise = Model.find({
    removed: false,

    [filter as string]: equal,
    ...fields,
  })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy as string]: Number(sortValue) as any })
    .populate([])
    .exec();

  // Counting the total documents
  const countPromise = Model.countDocuments({
    removed: false,

    [filter as string]: equal,
    ...fields,
  });
  // Resolving both promises
  const [result, count] = await Promise.all([resultsPromise, countPromise]);

  // Calculating total pages
  const pages = Math.ceil(count / limit);

  // Getting Pagination Object
  const pagination = { page, pages, count };
  if (count > 0) {
    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    });
  }
};

export default paginatedList;

