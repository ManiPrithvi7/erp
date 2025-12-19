import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminPassword extends Document {
  removed: boolean;
  user: Types.ObjectId;
  password: string;
  salt: string;
  emailToken?: string;
  resetToken?: string;
  emailVerified: boolean;
  authType: string;
  loggedSessions: string[];
  generateHash(salt: string, password: string): string;
  validPassword(salt: string, userpassword: string): boolean;
}

const AdminPasswordSchema = new Schema<IAdminPassword>({
  removed: {
    type: Boolean,
    default: false,
  },
  user: { type: mongoose.Schema.ObjectId, ref: 'Admin', required: true, unique: true },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  emailToken: String,
  resetToken: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  authType: {
    type: String,
    default: 'email',
  },
  loggedSessions: {
    type: [String],
    default: [],
  },
});

// generating a hash
AdminPasswordSchema.methods.generateHash = function (salt: string, password: string): string {
  return bcrypt.hashSync(salt + password);
};

// checking if password is valid
AdminPasswordSchema.methods.validPassword = function (salt: string, userpassword: string): boolean {
  return bcrypt.compareSync(salt + userpassword, this.password);
};

const AdminPassword: Model<IAdminPassword> = mongoose.model<IAdminPassword>(
  'AdminPassword',
  AdminPasswordSchema
);

export default AdminPassword;


