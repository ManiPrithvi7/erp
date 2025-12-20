import mongoose from 'mongoose';

const Model = mongoose.model('Setting');

interface UpdateBySettingKeyParams {
  settingKey: string;
  settingValue: any;
}

const updateBySettingKey = async ({ settingKey, settingValue }: UpdateBySettingKeyParams) => {
  try {
    if (!settingKey || !settingValue) {
      return null;
    }

    const result = await Model.findOneAndUpdate(
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


