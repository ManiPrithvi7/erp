import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import moment from 'moment';
import { IPayment } from '@/models/appModels/Payment';
import { loadSettings } from '@/middlewares/settings';
import { ApiResponse } from '@/types';

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment');

export const summary = async (req: Request, res: Response): Promise<Response> => {
  let defaultType = 'month';

  const { type } = req.query;

  const settings = await loadSettings();

  if (type) {
    if (['week', 'month', 'year'].includes(type as string)) {
      defaultType = type as string;
    } else {
      const response: ApiResponse = {
        success: false,
        result: null,
        message: 'Invalid type',
      };
      return res.status(400).json(response);
    }
  }

  const currentDate = moment();
  const startDate = currentDate.clone().startOf(defaultType);
  const endDate = currentDate.clone().endOf(defaultType);

  // get total amount of invoices
  const result = await Payment.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $group: {
        _id: null, // Group all documents into a single group
        count: {
          $sum: 1,
        },
        total: {
          $sum: '$amount',
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id from the result
        count: 1,
        total: 1,
      },
    },
  ]);

  const response: ApiResponse<{ count: number; total: number }> = {
    success: true,
    result: result.length > 0 ? result[0] : { count: 0, total: 0 },
    message: `Successfully fetched the summary of payment invoices for the last ${defaultType}`,
  };
  return res.status(200).json(response);
};

export default summary;

