import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/coreModels/Admin';
import AdminPassword from '../models/coreModels/AdminPassword';
import Setting from '../models/coreModels/Setting';
import PaymentMode from '../models/appModels/PaymentMode';
import Taxes from '../models/appModels/Taxes';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);

async function deleteData() {

  await Admin.deleteMany();
  await AdminPassword.deleteMany();
  await PaymentMode.deleteMany();
  await Taxes.deleteMany();
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');
  await Setting.deleteMany();
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t npm run setup\n\n');

  process.exit(0);
}

deleteData();


