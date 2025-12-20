import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '@/types';
import { calculate } from '@/helpers';

const Model = mongoose.model('Payment');
const Invoice = mongoose.model('Invoice');

const remove = async (req: AuthenticatedRequest, res: Response) => {
  // Find document by id and updates with the required fields
  const previousPayment = await Model.findOne({
    _id: req.params.id,
    removed: false,
  }).populate('invoice');

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const { _id: paymentId, amount: previousAmount } = previousPayment;
  const invoice = previousPayment.invoice as any;
  if (!invoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }

  const { id: invoiceId, total, discount, credit: previousCredit } = invoice;

  // Find the document by id and delete it
  const updates = {
    removed: true,
  };
  // Find the document by id and delete it
  const result = await Model.findOneAndUpdate(
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

  const updateInvoice = await Invoice.findOneAndUpdate(
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

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully Deleted the document ',
  });
};

export default remove;


