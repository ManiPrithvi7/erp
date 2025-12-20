import Joi from 'joi';
import mongoose, { Model } from 'mongoose';
import { Response } from 'express';
import { generate as uniqueId } from 'shortid';
import { AuthenticatedRequest } from '@/types';
import authUser from './authUser';

interface SignUpParams {
  userModel: string;
}

const signUp = async (req: AuthenticatedRequest, res: Response, { userModel }: SignUpParams) => {
  const UserPasswordModel = mongoose.model(userModel + 'Password');
  const UserModel = mongoose.model(userModel);
  let { email, password, name, surname } = req.body;

  // Trim and normalize email before validation
  if (email) {
    email = email.trim().toLowerCase();
  }
  if (name) {
    name = name.trim();
  }
  if (surname) {
    surname = surname.trim();
  }

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().trim().min(1).required(),
    surname: Joi.string().allow('', null),
  });

  const { error, value } = objectSchema.validate({ email, password, name, surname });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email: email, removed: false });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'An account with this email already exists.',
    });
  }

  // Create new user
  const newUser = await UserModel.create({
    email: email,
    name: name,
    surname: surname || '',
    enabled: true,
    role: 'owner',
  });

  // Create password hash
  const newAdminPassword = new UserPasswordModel();
  const salt = uniqueId();
  const passwordHash = newAdminPassword.generateHash(salt, password);

  // Save password
  await UserPasswordModel.create({
    user: newUser._id,
    password: passwordHash,
    salt: salt,
    emailVerified: true,
  });

  // Get the saved password to authenticate user
  const databasePassword = await UserPasswordModel.findOne({ user: newUser._id, removed: false });

  // Authenticate user after signup
  return authUser(req, res, {
    user: newUser,
    databasePassword,
    password,
    UserPasswordModel,
  });
};

export default signUp;

