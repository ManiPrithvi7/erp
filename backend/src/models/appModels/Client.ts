import mongoose, { Schema, Document } from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';

export interface IClient extends Document {
  removed?: boolean;
  enabled?: boolean;
  name: string;
  phone?: string;
  country?: string;
  address?: string;
  email?: string;
  createdBy?: Schema.Types.ObjectId;
  assigned?: Schema.Types.ObjectId;
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  assigned: { type: Schema.Types.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(mongooseAutopopulate);

export default mongoose.model<IClient>('Client', schema);


