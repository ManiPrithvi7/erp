import { Request, Response } from 'express';
import { globSync } from 'glob';
import fs from 'fs';
import { generate as uniqueId } from 'shortid';
import mongoose from 'mongoose';
import Joi from 'joi';
import { ApiResponse } from '@/types';

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

interface SetupRequestBody {
  name: string;
  email: string;
  password: string;
  language?: string;
  timezone?: string;
  country?: string;
  config?: Record<string, any>;
}

const setup = async (req: Request, res: Response): Promise<Response> => {
  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');
  const Setting = mongoose.model('Setting');
  const PaymentMode = mongoose.model('PaymentMode');
  const Taxes = mongoose.model('Taxes');

  const newAdminPassword = new AdminPassword();

  const { name, email, password, language, timezone, country, config = {} }: SetupRequestBody = req.body;

  const objectSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ name, email, password });
  if (error) {
    const response: ApiResponse = {
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
    };
    return res.status(409).json(response);
  }

  const salt = uniqueId();

  const passwordHash = newAdminPassword.generateHash(salt, password);

  const accountOwnner = {
    email,
    name,
    role: 'owner',
  };
  const result = await new Admin(accountOwnner).save();

  const AdminPasswordData = {
    password: passwordHash,
    emailVerified: true,
    salt: salt,
    user: result._id,
  };
  await new AdminPassword(AdminPasswordData).save();

  const settingData: any[] = [];

  const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

  for (const filePath of settingsFiles) {
    const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const settingsToUpdate: Record<string, string> = {
      idurar_app_email: email,
      idurar_app_company_email: email,
      idurar_app_timezone: timezone || '',
      idurar_app_country: country || '',
      idurar_app_language: language || 'en_us',
    };

    const newSettings = file.map((x: any) => {
      const settingValue = settingsToUpdate[x.settingKey];
      return settingValue ? { ...x, settingValue } : { ...x };
    });

    settingData.push(...newSettings);
  }

  await Setting.insertMany(settingData);

  await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }]);

  await PaymentMode.insertMany([
    {
      name: 'Default Payment',
      description: 'Default Payment Mode (Cash , Wire Transfert)',
      isDefault: true,
    },
  ]);

  const response: ApiResponse = {
    success: true,
    result: {},
    message: 'Successfully IDURAR App Setup',
  };
  return res.status(200).json(response);
};

export default setup;
