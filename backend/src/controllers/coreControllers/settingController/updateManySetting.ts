import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';
import { ApiResponse } from '@/types';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

interface SettingUpdate {
  settingKey: string;
  settingValue: any;
}

export const updateManySetting = async (req: Request, res: Response): Promise<Response> => {
  // req/body = [{settingKey:"",settingValue}]
  let settingsHasError = false;
  const updateDataArray: any[] = [];
  const { settings } = req.body as { settings: SettingUpdate[] };

  for (const setting of settings) {
    if (!setting.hasOwnProperty('settingKey') || !setting.hasOwnProperty('settingValue')) {
      settingsHasError = true;
      break;
    }

    const { settingKey, settingValue } = setting;

    updateDataArray.push({
      updateOne: {
        filter: { settingKey: settingKey },
        update: { settingValue: settingValue },
      },
    });
  }

  if (updateDataArray.length === 0) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No settings provided ',
    };
    return res.status(202).json(response);
  }
  if (settingsHasError) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Settings provided has Error',
    };
    return res.status(202).json(response);
  }
  const result = await Setting.bulkWrite(updateDataArray);

  if (!result || (result as any).nMatched < 1) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No settings found by to update',
    };
    return res.status(404).json(response);
  } else {
    const response: ApiResponse<[]> = {
      success: true,
      result: [],
      message: 'we update all settings',
    };
    return res.status(200).json(response);
  }
};

export default updateManySetting;


