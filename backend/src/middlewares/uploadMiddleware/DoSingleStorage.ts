require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

import path from 'path';
import { slugify } from 'transliteration';
import fileFilterMiddleware from './utils/fileFilterMiddleware';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

interface DoSingleStorageOptions {
  entity: string;
  fileType?: 'default' | 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'excel' | 'compressed';
  uploadFieldName?: string;
  fieldName?: string;
}

interface UploadInfo {
  fileName: string;
  fieldExt: string;
  entity: string;
  fieldName: string;
  fileType: string;
  filePath: string;
}

declare global {
  namespace Express {
    interface Request {
      files?: {
        file?: {
          name: string;
          mimetype: string;
          data: Buffer;
        };
      };
      upload?: UploadInfo;
    }
  }
}

const secretAccessKey = process.env.DO_SPACES_SECRET;
const accessKeyId = process.env.DO_SPACES_KEY;
const endpoint = 'https://' + process.env.DO_SPACES_URL;
const region = process.env.REGION;

const clientParams = {
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
};

export const DoSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}: DoSingleStorageOptions) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!req.files || Object.keys(req.files)?.length === 0 || !req.files?.file) {
      (req.body as any)[fieldName] = null;
      next();
    } else {
      const s3Client = new S3Client(clientParams);

      try {
        if (
          !fileFilterMiddleware({ type: fileType, mimetype: req.files.file.mimetype })
        ) {
          // skip upload if File type not supported
          throw new Error('Uploaded file type not supported');
        }
        const fileExtension = path.extname(req.files.file.name);
        const fileNameWithoutExt = path.parse(req.files.file.name).name;

        const uniqueFileID = Math.random().toString(36).slice(2, 7); // generates unique ID of length 5

        let originalname = '';
        if ((req.body as any).seotitle) {
          originalname = slugify((req.body as any).seotitle.toLocaleLowerCase()); // convert any language to English characters
        } else {
          originalname = slugify(fileNameWithoutExt.toLocaleLowerCase()); // convert any language to English characters
        }

        const _fileName = `${originalname}-${uniqueFileID}${fileExtension}`;

        const filePath = `public/uploads/${entity}/${_fileName}`;

        const uploadParams = {
          Key: `${filePath}`,
          Bucket: process.env.DO_SPACES_NAME || '',
          ACL: 'public-read' as const,
          Body: req.files.file.data,
        };
        const command = new PutObjectCommand(uploadParams);
        const s3response = await s3Client.send(command);

        if (s3response.$metadata.httpStatusCode === 200) {
          // saving file name and extension in request upload object
          req.upload = {
            fileName: _fileName,
            fieldExt: fileExtension,
            entity: entity,
            fieldName: fieldName,
            fileType: fileType,
            filePath: filePath,
          };

          (req.body as any)[fieldName] = filePath;
          next();
        }
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          result: null,
          controller: 'DoSingleStorage.js',
          message: 'Error on uploading file',
        };
        return res.status(403).json(response);
      }
    }
  };
};

export default DoSingleStorage;

