import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IPayment } from '@/models/appModels/Payment';
import { IInvoice } from '@/models/appModels/Invoice';
import { ApiResponse } from '@/types';

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment');
const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const remove = async (req: Request, res: Response): Promise<Response> => {
  // Find document by id and updates with the required fields
  const previousPayment = await Payment.findOne({
    _id: req.params.id,
    removed: false,
  });

  if (!previousPayment) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  }

  const { _id: paymentId, amount: previousAmount } = previousPayment;
  const invoice = previousPayment.invoice as any;
  const { id: invoiceId, total, discount, credit: previousCredit } = invoice;

  // Find the document by id and delete it
  const updates = {
    removed: true,
  };
  // Find the document by id and delete it
  const result = await Payment.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();
  // If no results found, return document not found

  const paymentStatus =
    total - discount === previousCredit - previousAmount
      ? 'paid'
      : previousCredit - previousAmount > 0
      ? 'partially'
      : 'unpaid';

  await Invoice.findOneAndUpdate(
    { _id: invoiceId },
    {
      $pull: {
        payment: paymentId,
      },
      $inc: { credit: -previousAmount },
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
    message: 'Successfully Deleted the document ',
  };
  return res.status(200).json(response);
};

export default remove;

