import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose, { Model } from 'mongoose';
import shortid from 'shortid';
import { ApiResponse } from '@/types';
import checkAndCorrectURL from './checkAndCorrectURL';
import sendMail from './sendMail';
import { useAppSettings } from '@/settings';

interface ForgetPasswordParams {
  userModel: string;
}

export const forgetPassword = async (
  req: Request,
  res: Response,
  { userModel }: ForgetPasswordParams
): Promise<Response> => {
  const UserPassword: Model<any> = mongoose.model(userModel + 'Password');
  const User: Model<any> = mongoose.model(userModel);
  const { email } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });

  const { error } = objectSchema.validate({ email });
  if (error) {
    const response: ApiResponse & { errorMessage: string } = {
      success: false,
      result: null,
      error: error,
      message: 'Invalid email.',
      errorMessage: error.message,
    };
    return res.status(409).json(response);
  }

  const user = await User.findOne({ email: email, removed: false });

  // console.log(user);
  if (!user) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    };
    return res.status(404).json(response);
  }

  const resetToken = shortid.generate();
  await UserPassword.findOneAndUpdate(
    { user: (user as any)._id },
    { resetToken },
    {
      new: true,
    }
  ).exec();

  const settings = useAppSettings();
  const idurar_app_email = settings['idurar_app_email'];
  const idurar_base_url = settings['idurar_base_url'];

  const url = checkAndCorrectURL(idurar_base_url);

  const link = url + '/resetpassword/' + (user as any)._id + '/' + resetToken;

  await sendMail({
    email,
    name: (user as any).name,
    link,
    subject: 'Reset your password | idurar',
    idurar_app_email,
    type: 'passwordVerfication',
  });

  const response: ApiResponse = {
    success: true,
    result: null,
    message: 'Check your email inbox , to reset your password',
  };
  return res.status(200).json(response);
};

export default forgetPassword;

