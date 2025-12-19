import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { IInvoice } from '@/models/appModels/Invoice';
import { ApiResponse } from '@/types';

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice');

export const read = async (req: Request, res: Response): Promise<Response> => {
  // Find document by id
  const result = await Invoice.findOne({
    _id: req.params.id,
    removed: false,
  })
    .populate('createdBy', 'name')
    .exec();
  // If no results found, return document not found
  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  } else {
    // Return success resposne
    const response: ApiResponse<IInvoice> = {
      success: true,
      result: result as any,
      message: 'we found this document ',
    };
    return res.status(200).json(response);
  }
};

export default read;

