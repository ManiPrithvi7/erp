import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const updateBySettingKey = async ({
  settingKey,
  settingValue,
}: {
  settingKey: string;
  settingValue: any;
}): Promise<ISetting | null> => {
  try {
    if (!settingKey || settingValue === undefined) {
      return null;
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
    // If no results found, return document not found
    if (!result) {
      return null;
    } else {
      // Return success resposne
      return result;
    }
  } catch {
    return null;
  }
};

export default updateBySettingKey;


