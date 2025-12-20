import multer from 'multer';
import * as path from 'path';
import { slugify } from 'transliteration';
import fileFilter from './utils/LocalfileFilter';

interface LocalSingleStorageParams {
  entity: string;
  fileType?: string;
  uploadFieldName?: string;
  fieldName?: string;
}

const LocalSingleStorage = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}: LocalSingleStorageParams) => {
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `src/public/uploads/${entity}`);
    },
    filename: function (req, file, cb) {
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
        (req as any).upload = {
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
        cb(error as Error, ''); // pass the error to the callback
      }
    },
  });

  const filterType = fileFilter(fileType);

  const multerStorage = multer({ storage: diskStorage, fileFilter: filterType as any }).single('file');
  return multerStorage;
};

export default LocalSingleStorage;

