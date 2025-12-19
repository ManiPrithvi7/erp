import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const listBySettingKey = async ({ settingKeyArray = [] }: { settingKeyArray?: string[] }): Promise<ISetting[]> => {
  try {
    // Find document by id

    const settingsToShow: { $or: Array<{ settingKey: string }> } = { $or: [] };

    if (settingKeyArray.length === 0) {
      return [];
    }

    for (const settingKey of settingKeyArray) {
      settingsToShow.$or.push({ settingKey });
    }
    const results = await Setting.find({ ...settingsToShow }).where('removed', false).exec();

    // If no results found, return document not found
    if (results.length >= 1) {
      return results;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

export default listBySettingKey;


