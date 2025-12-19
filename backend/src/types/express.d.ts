import { Document } from 'mongoose';

export interface IAdmin extends Document {
  _id: string;
  removed: boolean;
  enabled: boolean;
  email: string;
  name: string;
  surname?: string;
  photo?: string;
  created: Date;
  role: 'owner';
}

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}


