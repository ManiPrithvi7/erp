import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IPayment } from '@/models/appModels/Payment';
import { IInvoice } from '@/models/appModels/Invoice';
import { calculate } from '@/helpers';
import { ApiResponse } from '@/types';

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment');
const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const create = async (req: Request, res: Response): Promise<Response> => {
  // Creating a new document in the collection
  if (req.body.amount === 0) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    };
    return res.status(202).json(response);
  }

  const currentInvoice = await Invoice.findOne({
    _id: req.body.invoice,
    removed: false,
  });

  if (!currentInvoice) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invoice not found',
    };
    return res.status(404).json(response);
  }

  const {
    total: previousTotal,
    discount: previousDiscount,
    credit: previousCredit,
  } = currentInvoice;

  const maxAmount = calculate.sub(calculate.sub(previousTotal, previousDiscount), previousCredit);

  if (req.body.amount > maxAmount) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount}`,
    };
    return res.status(202).json(response);
  }
  req.body['createdBy'] = req.admin?._id;

  const result = await Payment.create(req.body);

  const fileId = 'payment-' + result._id + '.pdf';
  const updatePath = await Payment.findOneAndUpdate(
    {
      _id: result._id.toString(),
      removed: false,
    },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  const { _id: paymentId, amount } = result;
  const { total, discount, credit } = currentInvoice;

  const paymentStatus =
    calculate.sub(total, discount) === calculate.add(credit, amount)
      ? 'paid'
      : calculate.add(credit, amount) > 0
      ? 'partially'
      : 'unpaid';

  await Invoice.findOneAndUpdate(
    { _id: req.body.invoice },
    {
      $push: { payment: paymentId.toString() },
      $inc: { credit: amount },
      $set: { paymentStatus: paymentStatus },
    },
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();

  const response: ApiResponse<IPayment> = {
    success: true,
    result: updatePath as any,
    message: 'Payment Invoice created successfully',
  };
  return res.status(200).json(response);
};

export default create;

