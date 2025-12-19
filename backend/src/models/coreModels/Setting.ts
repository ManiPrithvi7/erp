import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  removed: boolean;
  enabled: boolean;
  settingCategory: string;
  settingKey: string;
  settingValue: any;
  valueType: string;
  isPrivate: boolean;
  isCoreSetting: boolean;
}

const settingSchema = new Schema<ISetting>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  settingCategory: {
    type: String,
    required: true,
    lowercase: true,
  },
  settingKey: {
    type: String,
    lowercase: true,
    required: true,
  },
  settingValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  valueType: {
    type: String,
    default: 'String',
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  isCoreSetting: {
    type: Boolean,
    default: false,
  },
});

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;


