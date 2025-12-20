import { Response } from 'express';
import mongoose from 'mongoose';
import moment from 'moment';
import { AuthenticatedRequest } from '@/types';
import { loadSettings } from '@/middlewares/settings';

const Model = mongoose.model('Quote');

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

  const statuses = ['draft', 'pending', 'sent', 'expired', 'declined', 'accepted'];

  const result = await Model.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: {
          $sum: 1,
        },
        total_amount: {
          $sum: '$total',
        },
      },
    },
    {
      $group: {
        _id: null,
        total_count: {
          $sum: '$count',
        },
        results: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $unwind: '$results',
    },
    {
      $project: {
        _id: 0,
        status: '$results._id',
        count: '$results.count',
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$results.count', '$total_count'] }, 100] }, 0],
        },
        total_amount: '$results.total_amount',
      },
    },
    {
      $sort: {
        status: 1,
      },
    },
  ]);

  statuses.forEach((status) => {
    const found = result.find((item: any) => item.status === status);
    if (!found) {
      result.push({
        status,
        count: 0,
        percentage: 0,
        total_amount: 0,
      });
    }
  });

  const total = result.reduce((acc: number, item: any) => acc + item.total_amount, 0);

  const finalResult = {
    total,
    type: defaultType,
    performance: result,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all Quotations for the last ${defaultType}`,
  });
};

export default summary;


