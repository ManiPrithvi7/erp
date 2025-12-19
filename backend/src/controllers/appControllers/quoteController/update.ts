import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IQuote } from '@/models/appModels/Quote';
import { calculate } from '@/helpers';
import { ApiResponse } from '@/types';

const Quote: Model<IQuote> = mongoose.model<IQuote>('Quote');

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { items = [], taxRate = 0, discount = 0 } = req.body;

  if (items.length === 0) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Items cannot be empty',
    };
    return res.status(400).json(response);
  }
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
  body['pdf'] = 'quote-' + req.params.id + '.pdf';

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  // Find document by id and updates with the required fields

  const result = await Quote.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
    new: true, // return the new result instead of the old one
  }).exec();

  // Returning successfull response
  const response: ApiResponse<IQuote> = {
    success: true,
    result: result as any,
    message: 'we update this document ',
  };
  return res.status(200).json(response);
};

export default update;

