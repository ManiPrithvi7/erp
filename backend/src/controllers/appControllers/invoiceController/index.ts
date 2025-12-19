import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import sendMail from './sendMail';
import create from './create';
import summary from './summary';
import update from './update';
import remove from './remove';
import paginatedList from './paginatedList';
import read from './read';

const methods: CRUDController & { mail: (req: any, res: any) => Promise<any> } = createCRUDController(
  'Invoice'
) as any;

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.delete = remove;
methods.summary = summary;
methods.list = paginatedList;
methods.read = read;

export default methods;

