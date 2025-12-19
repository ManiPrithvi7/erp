import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IQuote } from '@/models/appModels/Quote';
import { ApiResponse } from '@/types';

const Quote: Model<IQuote> = mongoose.model<IQuote>('Quote');

interface PaginationInfo {
  page: number;
  pages: number;
  count: number;
}

export const paginatedList = async (req: Request, res: Response): Promise<Response> => {
  const page = Number(req.query.page) || 1;
  const limit = parseInt(req.query.items as string) || 10;
  const skip = page * limit - limit;

  //  Query the database for a list of all results
  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query;

  const fieldsArray = req.query.fields ? (req.query.fields as string).split(',') : [];

  let fields: any;

  fields = fieldsArray.length === 0 ? {} : { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q as string, 'i') } });
  }

  //  Query the database for a list of all results
  const query: any = {
    removed: false,
    ...fields,
  };

  if (filter && equal !== undefined) {
    query[filter as string] = equal;
  }

  const resultsPromise = Quote.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy as string]: Number(sortValue) } as any)
    .populate('createdBy', 'name')
    .exec();

  // Counting the total documents
  const countPromise = Quote.countDocuments(query);

  // Resolving both promises
  const [result, count] = await Promise.all([resultsPromise, countPromise]);
  // Calculating total pages
  const pages = Math.ceil(count / limit);

  // Getting Pagination Object
  const pagination: PaginationInfo = { page, pages, count };
  if (count > 0) {
    const response: ApiResponse<IQuote[]> & { pagination: PaginationInfo } = {
      success: true,
      result: result as any,
      pagination,
      message: 'Successfully found all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<IQuote[]> & { pagination: PaginationInfo } = {
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    };
    return res.status(203).json(response);
  }
};

export default paginatedList;

