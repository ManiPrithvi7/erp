import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';
import { ApiResponse } from '@/types';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const readBySettingKey = async (req: Request, res: Response): Promise<Response> => {
  // Find document by id
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No settingKey provided ',
    };
    return res.status(202).json(response);
  }

  const result = await Setting.findOne({
    settingKey,
  });

  // If no results found, return document not found
  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    };
    return res.status(404).json(response);
  } else {
    // Return success resposne
    const response: ApiResponse<ISetting> = {
      success: true,
      result: result as any,
      message: 'we found this document by this settingKey: ' + settingKey,
    };
    return res.status(200).json(response);
  }
};

export default readBySettingKey;


