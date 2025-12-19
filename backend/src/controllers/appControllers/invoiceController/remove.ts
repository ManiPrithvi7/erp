import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IInvoice } from '@/models/appModels/Invoice';
import { IPayment } from '@/models/appModels/Payment';
import { ApiResponse } from '@/types';

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');
const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment');

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const deletedInvoice = await Invoice.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    {
      $set: {
        removed: true,
      },
    }
  ).exec();

  if (!deletedInvoice) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invoice not found',
    };
    return res.status(404).json(response);
  }
  await Payment.updateMany({ invoice: deletedInvoice._id }, { $set: { removed: true } });
  const response: ApiResponse<IInvoice> = {
    success: true,
    result: deletedInvoice as any,
    message: 'Invoice deleted successfully',
  };
  return res.status(200).json(response);
};

export default remove;

