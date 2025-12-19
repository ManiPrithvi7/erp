import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IInvoice } from '@/models/appModels/Invoice';
import { calculate } from '@/helpers';
import schema from './schemaValidate';
import { ApiResponse } from '@/types';

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const update = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body;

  const { error } = schema.validate(body);
  if (error) {
    const { details } = error;
    const response: ApiResponse = {
      success: false,
      result: null,
      message: details[0]?.message || 'Validation error',
    };
    return res.status(400).json(response);
  }

  const previousInvoice = await Invoice.findOne({
    _id: req.params.id,
    removed: false,
  });

  if (!previousInvoice) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invoice not found',
    };
    return res.status(404).json(response);
  }

  const { credit } = previousInvoice;

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

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['pdf'] = 'invoice-' + req.params.id + '.pdf';
  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  // Find document by id and updates with the required fields

  const paymentStatus =
    calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';
  body['paymentStatus'] = paymentStatus;

  const result = await Invoice.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    body,
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  // Returning successfull response
  const response: ApiResponse<IInvoice> = {
    success: true,
    result: result as any,
    message: 'we update this document ',
  };
  return res.status(200).json(response);
};

export default update;

