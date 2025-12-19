import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  removed: boolean;
  enabled: boolean;
  email: string;
  name: string;
  surname?: string;
  photo?: string;
  created: Date;
  role: 'owner';
}

const adminSchema = new Schema<IAdmin>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  name: { type: String, required: true },
  surname: { type: String },
  photo: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'owner',
    enum: ['owner'],
  },
});

const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;


