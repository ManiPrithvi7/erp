import mongoose from 'mongoose';

const Model = mongoose.model('Setting');

interface ReadBySettingKeyParams {
  settingKey: string;
}

const readBySettingKey = async ({ settingKey }: ReadBySettingKeyParams) => {
  try {
    // Find document by id

    if (!settingKey) {
      return null;
    }

    const result = await Model.findOne({ settingKey });
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


