import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import moment from 'moment';
import { IInvoice } from '@/models/appModels/Invoice';
import { loadSettings } from '@/middlewares/settings';
import { ApiResponse } from '@/types';

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const summary = async (req: Request, res: Response): Promise<Response> => {
  let defaultType = 'month';

  const { type } = req.query;

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

  const statuses = ['draft', 'pending', 'overdue', 'paid', 'unpaid', 'partially'];

  const response = await Invoice.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $facet: {
        totalInvoice: [
          {
            $group: {
              _id: null,
              total: {
                $sum: '$total',
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              total: '$total',
              count: '$count',
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
        paymentStatusCounts: [
          {
            $group: {
              _id: '$paymentStatus',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
        overdueCounts: [
          {
            $match: {
              expiredDate: {
                $lt: new Date(),
              },
            },
          },
          {
            $group: {
              _id: '$status',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
      },
    },
  ]);

  const result: any[] = [];

  const totalInvoices = response[0].totalInvoice ? response[0].totalInvoice[0] : { total: 0, count: 0 };
  const statusResult = response[0].statusCounts || [];
  const paymentStatusResult = response[0].paymentStatusCounts || [];
  const overdueResult = response[0].overdueCounts || [];

  const statusResultMap = statusResult.map((item: any) => {
    return {
      ...item,
      percentage: Math.round((item.count / (totalInvoices as any).count) * 100),
    };
  });

  const paymentStatusResultMap = paymentStatusResult.map((item: any) => {
    return {
      ...item,
      percentage: Math.round((item.count / (totalInvoices as any).count) * 100),
    };
  });

  const overdueResultMap = overdueResult.map((item: any) => {
    return {
      ...item,
      status: 'overdue',
      percentage: Math.round((item.count / (totalInvoices as any).count) * 100),
    };
  });

  statuses.forEach((status) => {
    const found = [...paymentStatusResultMap, ...statusResultMap, ...overdueResultMap].find(
      (item: any) => item.status === status
    );
    if (found) {
      result.push(found);
    }
  });

  const unpaid = await Invoice.aggregate([
    {
      $match: {
        removed: false,
        paymentStatus: {
          $in: ['unpaid', 'partially'],
        },
      },
    },
    {
      $group: {
        _id: null,
        total_amount: {
          $sum: {
            $subtract: ['$total', '$credit'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total_amount: '$total_amount',
      },
    },
  ]);

  const finalResult = {
    total: (totalInvoices as any)?.total,
    total_undue: unpaid.length > 0 ? unpaid[0].total_amount : 0,
    type,
    performance: result,
  };

  const apiResponse: ApiResponse<typeof finalResult> = {
    success: true,
    result: finalResult,
    message: `Successfully found all invoices for the last ${defaultType}`,
  };
  return res.status(200).json(apiResponse);
};

export default summary;

