import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import create from './create';
import summary from './summary';
import update from './update';
import remove from './remove';
import sendMail from './sendMail';

const methods: CRUDController & { mail: (req: any, res: any) => Promise<any> } = createCRUDController(
  'Payment'
) as any;

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.delete = remove;
methods.summary = summary;

export default methods;

