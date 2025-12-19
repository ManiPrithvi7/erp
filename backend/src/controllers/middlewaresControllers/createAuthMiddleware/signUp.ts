import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose, { Model } from 'mongoose';
import { generate as uniqueId } from 'shortid';
import { ApiResponse } from '@/types';
import authUser from './authUser';

interface SignUpParams {
  userModel: string;
}

export const signUp = async (
  req: Request,
  res: Response,
  { userModel }: SignUpParams
): Promise<Response> => {
  const UserPasswordModel: Model<any> = mongoose.model(userModel + 'Password');
  const UserModel: Model<any> = mongoose.model(userModel);
  const { email, password, name, surname } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    surname: Joi.string().allow('', null),
  });

  const { error } = objectSchema.validate({ email, password, name, surname });
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

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    email: email.toLowerCase().trim(),
    removed: false,
  });
  if (existingUser) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'An account with this email already exists.',
    };
    return res.status(409).json(response);
  }

  // Create new user
  const newUser = await UserModel.create({
    email: email.toLowerCase().trim(),
    name: name,
    surname: surname || '',
    enabled: true,
    role: 'owner',
  });

  // Create password hash
  const newAdminPassword = new UserPasswordModel();
  const salt = uniqueId();
  const passwordHash = (newAdminPassword as any).generateHash(salt, password);

  // Save password
  await UserPasswordModel.create({
    user: (newUser as any)._id,
    password: passwordHash,
    salt: salt,
    emailVerified: true,
  });

  // Get the saved password to authenticate user
  const databasePassword = await UserPasswordModel.findOne({
    user: (newUser as any)._id,
    removed: false,
  });

  // Authenticate user after signup
  return authUser(req, res, {
    user: newUser,
    databasePassword,
    password,
    UserPasswordModel,
  });
};

export default signUp;

