import { Request, Response } from 'express';
import mongoose, { Model, Document } from 'mongoose';
import moment from 'moment';
import { IInvoice } from '@/models/appModels/Invoice';
import { ApiResponse } from '@/types';

const InvoiceModel: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const summary = async <T extends Document>(
  Model: Model<T>,
  req: Request,
  res: Response
): Promise<Response> => {
  let defaultType = 'month';
  const { type } = req.query;

  if (type && ['week', 'month', 'year'].includes(type as string)) {
    defaultType = type as string;
  } else if (type) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invalid type',
    };
    return res.status(400).json(response);
  }

  const currentDate = moment();
  const startDate = currentDate.clone().startOf(defaultType as moment.unitOfTime.StartOf);
  const endDate = currentDate.clone().endOf(defaultType as moment.unitOfTime.StartOf);

  const pipeline = [
    {
      $facet: {
        totalClients: [
          {
            $match: {
              removed: false,
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
        newClients: [
          {
            $match: {
              removed: false,
              created: { $gte: startDate.toDate(), $lte: endDate.toDate() },
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
        activeClients: [
          {
            $lookup: {
              from: InvoiceModel.collection.name,
              localField: '_id',
              foreignField: 'client',
              as: 'invoice',
            },
          },
          {
            $match: {
              'invoice.removed': false,
            },
          },
          {
            $group: {
              _id: '$_id',
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
  ];

  const aggregationResult = await Model.aggregate(pipeline);

  const result = aggregationResult[0];
  const totalClients = result.totalClients[0] ? result.totalClients[0].count : 0;
  const totalNewClients = result.newClients[0] ? result.newClients[0].count : 0;
  const activeClients = result.activeClients[0] ? result.activeClients[0].count : 0;

  const totalActiveClientsPercentage = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  const totalNewClientsPercentage = totalClients > 0 ? (totalNewClients / totalClients) * 100 : 0;

  const response: ApiResponse<{ new: number; active: number }> = {
    success: true,
    result: {
      new: Math.round(totalNewClientsPercentage),
      active: Math.round(totalActiveClientsPercentage),
    },
    message: 'Successfully get summary of new clients',
  };
  return res.status(200).json(response);
};

export default summary;

