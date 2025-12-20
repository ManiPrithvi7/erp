import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '@/types';

const Model = mongoose.model('Setting');

interface SettingUpdate {
  settingKey: string;
  settingValue: any;
}

const updateManySetting = async (req: AuthenticatedRequest, res: Response) => {
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
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settings provided ',
    });
  }
  if (settingsHasError) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'Settings provided has Error',
    });
  }
  const result = await Model.bulkWrite(updateDataArray);

  if (!result || (result as any).nMatched < 1) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No settings found by to update',
    });
  } else {
    return res.status(200).json({
      success: true,
      result: [],
      message: 'we update all settings',
    });
  }
};

export default updateManySetting;

