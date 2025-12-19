import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import sendMail from './sendMail';
import create from './create';
import summary from './summary';
import update from './update';
import convertQuoteToInvoice from './convertQuoteToInvoice';
import paginatedList from './paginatedList';
import read from './read';

const methods: CRUDController & {
  mail: (req: any, res: any) => Promise<any>;
  convert: (req: any, res: any) => Promise<any>;
} = createCRUDController('Quote') as any;

methods.list = paginatedList;
methods.read = read;

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.convert = convertQuoteToInvoice;
methods.summary = summary;

export default methods;

