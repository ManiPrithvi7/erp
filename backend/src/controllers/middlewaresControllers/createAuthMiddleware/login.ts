import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose, { Model } from 'mongoose';
import { ApiResponse } from '@/types';
import authUser from './authUser';

interface LoginParams {
  userModel: string;
}

export const login = async (
  req: Request,
  res: Response,
  { userModel }: LoginParams
): Promise<Response> => {
  const UserPasswordModel: Model<any> = mongoose.model(userModel + 'Password');
  const UserModel: Model<any> = mongoose.model(userModel);
  const { email, password } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, password });
  if (error) {
    const response: ApiResponse & { errorMessage: string } = {
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    };
    return res.status(409).json(response);
  }

  const user = await UserModel.findOne({ email: email, removed: false });

  // console.log(user);
  if (!user) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    };
    return res.status(404).json(response);
  }

  const databasePassword = await UserPasswordModel.findOne({ user: (user as any)._id, removed: false });

  if (!(user as any).enabled) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    };
    return res.status(409).json(response);
  }

  //  authUser if your has correct password
  return authUser(req, res, {
    user,
    databasePassword,
    password,
    UserPasswordModel,
  });
};

export default login;

