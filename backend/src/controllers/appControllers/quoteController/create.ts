import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IQuote } from '@/models/appModels/Quote';
import { increaseBySettingKey } from '@/middlewares/settings';
import { calculate } from '@/helpers';
import { ApiResponse } from '@/types';

const Quote: Model<IQuote> = mongoose.model<IQuote>('Quote');

export const create = async (req: Request, res: Response): Promise<Response> => {
  const { items = [], taxRate = 0, discount = 0 } = req.body;

  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item: any) => {
    const itemTotal = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, itemTotal);
    //item total
    item['total'] = itemTotal;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  const body = req.body;

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['createdBy'] = req.admin?._id;

  // Creating a new document in the collection
  const result = await new Quote(body).save();
  const fileId = 'quote-' + result._id + '.pdf';
  const updateResult = await Quote.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_quote_number',
  });

  // Returning successfull response
  const response: ApiResponse<IQuote> = {
    success: true,
    result: updateResult as any,
    message: 'Quote created successfully',
  };
  return res.status(200).json(response);
};

export default create;

