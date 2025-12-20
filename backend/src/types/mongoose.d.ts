import { Document, Model, Schema } from 'mongoose';

// Base document interface
export interface BaseDocument extends Document {
  removed?: boolean;
  created?: Date;
  updated?: Date;
  createdBy?: string | Schema.Types.ObjectId;
}

// Generic model type
export type ModelType<T extends BaseDocument> = Model<T>;


