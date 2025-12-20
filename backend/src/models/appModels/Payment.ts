import mongoose, { Schema, Document } from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';

export interface IPayment extends Document {
  removed?: boolean;
  createdBy: Schema.Types.ObjectId;
  number: number;
  client: Schema.Types.ObjectId;
  invoice: Schema.Types.ObjectId;
  date: Date;
  amount: number;
  currency: string;
  paymentMode?: Schema.Types.ObjectId;
  ref?: string;
  description?: string;
  updated: Date;
  created: Date;
}

const paymentSchema = new Schema<IPayment>({
  removed: {
    type: Boolean,
    default: false,
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', autopopulate: true, required: true },
  number: {
    type: Number,
    required: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    autopopulate: true,
    required: true,
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    autopopulate: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'NA',
    uppercase: true,
    required: true,
  },
  paymentMode: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentMode',
    autopopulate: true,
  },
  ref: {
    type: String,
  },
  description: {
    type: String,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.plugin(mongooseAutopopulate);
export default mongoose.model<IPayment>('Payment', paymentSchema);


