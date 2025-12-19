import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IPayment } from '@/models/appModels/Payment';
import { IInvoice } from '@/models/appModels/Invoice';
import { calculate } from '@/helpers';
import { ApiResponse } from '@/types';

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment');
const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const update = async (req: Request, res: Response): Promise<Response> => {
  if (req.body.amount === 0) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    };
    return res.status(202).json(response);
  }
  // Find document by id and updates with the required fields
  const previousPayment = await Payment.findOne({
    _id: req.params.id,
    removed: false,
  });

  if (!previousPayment) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Payment not found',
    };
    return res.status(404).json(response);
  }

  const { amount: previousAmount } = previousPayment;
  const invoice = previousPayment.invoice as any;
  const { id: invoiceId, total, discount, credit: previousCredit } = invoice;

  const { amount: currentAmount } = req.body;

  const changedAmount = calculate.sub(currentAmount, previousAmount);
  const maxAmount = calculate.sub(total, calculate.add(discount, previousCredit));

  if (changedAmount > maxAmount) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount + previousAmount}`,
      error: `The Max Amount you can add is ${maxAmount + previousAmount}`,
    };
    return res.status(202).json(response);
  }

  const paymentStatus =
    calculate.sub(total, discount) === calculate.add(previousCredit, changedAmount)
      ? 'paid'
      : calculate.add(previousCredit, changedAmount) > 0
      ? 'partially'
      : 'unpaid';

  const updatedDate = new Date();
  const updates = {
    number: req.body.number,
    date: req.body.date,
    amount: req.body.amount,
    paymentMode: req.body.paymentMode,
    ref: req.body.ref,
    description: req.body.description,
    updated: updatedDate,
  };

  const result = await Payment.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  await Invoice.findOneAndUpdate(
    { _id: invoiceId },
    {
      $inc: { credit: changedAmount },
      $set: {
        paymentStatus: paymentStatus,
      },
    },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  const response: ApiResponse<IPayment> = {
    success: true,
    result: result as any,
    message: 'Successfully updated the Payment ',
  };
  return res.status(200).json(response);
};

export default update;

