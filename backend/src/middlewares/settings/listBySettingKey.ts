import mongoose from 'mongoose';

const Model = mongoose.model('Setting');

interface ListBySettingKeyParams {
  settingKeyArray?: string[];
}

const listBySettingKey = async ({ settingKeyArray = [] }: ListBySettingKeyParams) => {
  try {
    // Find document by id

    const settingsToShow: any = { $or: [] };

    if (settingKeyArray.length === 0) {
      return [];
    }

    for (const settingKey of settingKeyArray) {
      settingsToShow.$or.push({ settingKey });
    }
    const results = await Model.find({ ...settingsToShow }).where('removed', false);

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


