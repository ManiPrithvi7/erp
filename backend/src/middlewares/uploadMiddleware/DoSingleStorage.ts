import * as dotenv from 'dotenv';
import * as path from 'path';
import { slugify } from 'transliteration';
import fileFilterMiddleware from './utils/fileFilterMiddleware';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction } from 'express';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const secretAccessKey = process.env.DO_SPACES_SECRET;
const accessKeyId = process.env.DO_SPACES_KEY;
const endpoint = 'https://' + (process.env.DO_SPACES_URL || '');
const region = process.env.REGION || 'us-east-1';

const clientParams: any = {
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
};

interface DoSingleStorageParams {
  entity: string;
  fileType?: string;
  uploadFieldName?: string;
  fieldName?: string;
}

const DoSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}: DoSingleStorageParams) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!(req as any).files || Object.keys((req as any).files)?.length === 0 || !(req as any).files?.file) {
      (req.body as any)[fieldName] = null;
      next();
    } else {
      const s3Client = new S3Client(clientParams);

      try {
        if (!fileFilterMiddleware({ type: fileType, mimetype: (req as any).files.file.mimetype })) {
          // skip upload if File type not supported
          throw new Error('Uploaded file type not supported');
        }
        const fileExtension = path.extname((req as any).files.file.name);
        const fileNameWithoutExt = path.parse((req as any).files.file.name).name;

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
          Bucket: process.env.DO_SPACES_NAME!,
          ACL: 'public-read' as const,
          Body: (req as any).files.file.data,
        };
        const command = new PutObjectCommand(uploadParams);
        const s3response = await s3Client.send(command);

        if (s3response.$metadata.httpStatusCode === 200) {
          // saving file name and extension in request upload object
          (req as any).upload = {
            fileName: _fileName,
            fieldExt: fileExtension,
            entity: entity,
            fieldName: fieldName,
            fileType: fileType,
            filePath: filePath,
          };

          (req.body as any)[fieldName] = filePath;
          return next();
        }
        return;
      } catch (error: any) {
        return res.status(403).json({
          success: false,
          result: null,
          controller: 'DoSingleStorage.js',
          message: 'Error on uploading file',
        });
      }
    }
  };
};

export default DoSingleStorage;

