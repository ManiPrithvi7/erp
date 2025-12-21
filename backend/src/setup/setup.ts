import * as dotenv from 'dotenv';
import { globSync } from 'glob';
import * as fs from 'fs';
import { generate as uniqueId } from 'shortid';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE);

import Admin from '../models/coreModels/Admin';
import AdminPassword from '../models/coreModels/AdminPassword';

async function setupApp() {
  try {
    const newAdminPassword = new AdminPassword();

    const salt = uniqueId();

    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'IDURAR',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created : Done!');

    const Setting = (await import('../models/coreModels/Setting')).default;

    interface SettingFile {
      settingCategory: string;
      settingKey: string;
      settingValue?: string | number | boolean | object;
      valueType: string;
      isPrivate: boolean;
      isCoreSetting: boolean;
      enabled?: boolean;
    }

    const settingFiles: SettingFile[] = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SettingFile[];
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);

    console.log('👍 Settings created : Done!');

    const PaymentMode = (await import('../models/appModels/PaymentMode')).default;
    const Taxes = (await import('../models/appModels/Taxes')).default;

    await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }]);
    console.log('👍 Taxes created : Done!');

    await PaymentMode.insertMany([
      {
        name: 'Default Payment',
        description: 'Default Payment Mode (Cash , Wire Transfert)',
        isDefault: true,
      },
    ]);
    console.log('👍 PaymentMode created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit(0);
  } catch (e: unknown) {
    console.log('\n🚫 Error! The Error info is below');
    if (e instanceof Error) {
      console.log(e.message);
      console.log(e.stack);
    } else {
      console.log(e);
    }
    process.exit(1);
  }
}

setupApp();


