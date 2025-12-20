import { Response } from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
import { AuthenticatedRequest } from '@/types';
import { loadSettings } from '@/middlewares/settings';

const Model = mongoose.model('Payment');

const summary = async (req: AuthenticatedRequest, res: Response) => {
  let defaultType = 'month';

  const { type } = req.query;

  const settings = await loadSettings();

  if (type) {
    if (['week', 'month', 'year'].includes(type as string)) {
      defaultType = type as string;
    } else {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid type',
      });
    }
  }

  const currentDate = moment();
  const startDate = currentDate.clone().startOf(defaultType as any);
  const endDate = currentDate.clone().endOf(defaultType as any);

  // get total amount of invoices
  const result = await Model.aggregate([
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

  return res.status(200).json({
    success: true,
    result: result.length > 0 ? result[0] : { count: 0, total: 0 },
    message: `Successfully fetched the summary of payment invoices for the last ${defaultType}`,
  });
};

export default summary;


