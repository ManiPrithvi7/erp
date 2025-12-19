import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITaxes extends Document {
  removed: boolean;
  enabled: boolean;
  taxName: string;
  taxValue: number;
  isDefault: boolean;
  created: Date;
}

const schema = new Schema<ITaxes>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  taxName: {
    type: String,
    required: true,
  },
  taxValue: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const Taxes: Model<ITaxes> = mongoose.model<ITaxes>('Taxes', schema);

export default Taxes;


