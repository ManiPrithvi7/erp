import mongoose, { Model } from 'mongoose';
import { ISetting } from '@/models/coreModels/Setting';

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting');

export const listAllSettings = async (): Promise<ISetting[]> => {
  try {
    //  Query the database for a list of all results
    const result = await Setting.find({
      removed: false,
    }).exec();

    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

export default listAllSettings;


