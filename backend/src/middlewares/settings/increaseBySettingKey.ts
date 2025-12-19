import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const increaseBySettingKey = async ({ settingKey }: { settingKey: string }): Promise<ISetting | null> => {
  try {
    if (!settingKey) {
      return null;
    }

    const result = await Setting.findOneAndUpdate(
      { settingKey },
      {
        $inc: { settingValue: 1 },
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

export default increaseBySettingKey;


