import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IInvoice } from '@/models/appModels/Invoice';
import { calculate } from '@/helpers';
import { increaseBySettingKey } from '@/middlewares/settings';
import { ApiResponse } from '@/types';
import schema from './schemaValidate';

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const create = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    const response: ApiResponse = {
      success: false,
      result: null,
      message: details[0]?.message || 'Validation error',
    };
    return res.status(400).json(response);
  }

  const { items = [], taxRate = 0, discount = 0 } = value;

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

  const paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin?._id;

  // Creating a new document in the collection
  const result = await new Invoice(body).save();
  const fileId = 'invoice-' + result._id + '.pdf';
  const updateResult = await Invoice.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  // Returning successfull response
  const response: ApiResponse<IInvoice> = {
    success: true,
    result: updateResult as any,
    message: 'Invoice created successfully',
  };
  return res.status(200).json(response);
};

export default create;


