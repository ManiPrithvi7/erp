import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const readBySettingKey = async ({ settingKey }: { settingKey: string }): Promise<ISetting | null> => {
  try {
    // Find document by id

    if (!settingKey) {
      return null;
    }

    const result = await Setting.findOne({ settingKey });
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

export default readBySettingKey;


