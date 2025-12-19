import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IClient extends Document {
  removed: boolean;
  enabled: boolean;
  name: string;
  phone?: string;
  country?: string;
  address?: string;
  email?: string;
  createdBy?: Types.ObjectId;
  assigned?: Types.ObjectId;
  created: Date;
  updated: Date;
}

const schema = new Schema<IClient>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: String,
  country: String,
  address: String,
  email: String,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

const Client: Model<IClient> = mongoose.model<IClient>('Client', schema);

export default Client;


