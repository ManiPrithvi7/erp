import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';
import { ApiResponse } from '@/types';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const updateBySettingKey = async (req: Request, res: Response): Promise<Response> => {
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No settingKey provided ',
    };
    return res.status(202).json(response);
  }
  const { settingValue } = req.body;

  if (settingValue === undefined) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No settingValue provided ',
    };
    return res.status(202).json(response);
  }
  const result = await Setting.findOneAndUpdate(
    { settingKey },
    {
      settingValue,
    },
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();
  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    };
    return res.status(404).json(response);
  } else {
    const response: ApiResponse<ISetting> = {
      success: true,
      result: result as any,
      message: 'we update this document by this settingKey: ' + settingKey,
    };
    return res.status(200).json(response);
  }
};

export default updateBySettingKey;


