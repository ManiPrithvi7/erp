import mongoose, { Schema, Document } from 'mongoose';

export type FileType =
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'webp'
  | 'doc'
  | 'txt'
  | 'csv'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'pdf'
  | 'zip'
  | 'rar'
  | 'mp4'
  | 'mov'
  | 'avi'
  | 'mp3'
  | 'm4a'
  | 'webm';

export interface IUpload extends Document {
  removed?: boolean;
  enabled?: boolean;
  modelName?: string;
  fieldId: string;
  fileName: string;
  fileType: FileType;
  isPublic: boolean;
  userID: Schema.Types.ObjectId;
  isSecure: boolean;
  path: string;
  created: Date;
}

const uploadSchema = new Schema<IUpload>({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  modelName: {
    type: String,
    trim: true,
  },
  fieldId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: [
      'jpeg',
      'jpg',
      'png',
      'gif',
      'webp',
      'doc',
      'txt',
      'csv',
      'docx',
      'xls',
      'xlsx',
      'pdf',
      'zip',
      'rar',
      'mp4',
      'mov',
      'avi',
      'mp3',
      'm4a',
      'webm',
    ],
    required: true,
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isSecure: {
    type: Boolean,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUpload>('Upload ', uploadSchema);


