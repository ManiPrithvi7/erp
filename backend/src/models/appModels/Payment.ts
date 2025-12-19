import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayment extends Document {
  removed: boolean;
  createdBy: Types.ObjectId;
  number: number;
  client: Types.ObjectId;
  invoice: Types.ObjectId;
  date: Date;
  amount: number;
  currency: string;
  paymentMode?: Types.ObjectId;
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
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin', autopopulate: true, required: true },
  number: {
    type: Number,
    required: true,
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    autopopulate: true,
    required: true,
  },
  invoice: {
    type: mongoose.Schema.ObjectId,
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
    type: mongoose.Schema.ObjectId,
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

paymentSchema.plugin(require('mongoose-autopopulate'));

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;


