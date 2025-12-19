import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';
import { ApiResponse } from '@/types';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const listBySettingKey = async (req: Request, res: Response): Promise<Response> => {
  // Find document by id

  const settingKeyArray = req.query.settingKeyArray
    ? (req.query.settingKeyArray as string).split(',')
    : [];

  const settingsToShow: { $or: Array<{ settingKey: string }> } = { $or: [] };

  if (settingKeyArray.length === 0) {
    const response: ApiResponse<ISetting[]> = {
      success: false,
      result: [],
      message: 'Please provide settings you need',
    };
    return res.status(202).json(response).end();
  }

  for (const settingKey of settingKeyArray) {
    settingsToShow.$or.push({ settingKey });
  }

  const results = await Setting.find({
    ...settingsToShow,
  }).where('removed', false);

  // If no results found, return document not found
  if (results.length >= 1) {
    const response: ApiResponse<ISetting[]> = {
      success: true,
      result: results as any,
      message: 'Successfully found all documents',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse<ISetting[]> = {
      success: false,
      result: [],
      message: 'No document found by this request',
    };
    return res.status(202).json(response).end();
  }
};

export default listBySettingKey;


