import multer from 'multer';
import path from 'path';
import { slugify } from 'transliteration';
import fileFilter from './utils/LocalfileFilter';
import { Request } from 'express';

interface SingleStorageUploadOptions {
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
      upload?: UploadInfo;
    }
  }
}

export const LocalSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}: SingleStorageUploadOptions) => {
  const diskStorage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, `src/public/uploads/${entity}`);
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
      try {
        // fetching the file extension of the uploaded file
        const fileExtension = path.extname(file.originalname);
        const uniqueFileID = Math.random().toString(36).slice(2, 7); // generates unique ID of length 5

        let originalname = '';
        if ((req.body as any).seotitle) {
          originalname = slugify((req.body as any).seotitle.toLocaleLowerCase()); // convert any language to English characters
        } else {
          originalname = slugify(file.originalname.split('.')[0].toLocaleLowerCase()); // convert any language to English characters
        }

        const _fileName = `${originalname}-${uniqueFileID}${fileExtension}`;

        const filePath = `public/uploads/${entity}/${_fileName}`;
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

        cb(null, _fileName);
      } catch (error) {
        cb(error as Error); // pass the error to the callback
      }
    },
  });

  const filterType = fileFilter(fileType);

  const multerStorage = multer({ storage: diskStorage, fileFilter: filterType }).single('file');
  return multerStorage;
};

export default LocalSingleStorage;

