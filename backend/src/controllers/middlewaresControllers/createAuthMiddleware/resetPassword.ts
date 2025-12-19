import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import mongoose, { Model } from 'mongoose';
import shortid from 'shortid';
import { ApiResponse } from '@/types';

interface ResetPasswordParams {
  userModel: string;
}

export const resetPassword = async (
  req: Request,
  res: Response,
  { userModel }: ResetPasswordParams
): Promise<Response> => {
  const UserPassword: Model<any> = mongoose.model(userModel + 'Password');
  const User: Model<any> = mongoose.model(userModel);
  const { password, userId, resetToken } = req.body;

  const databasePassword = await UserPassword.findOne({ user: userId, removed: false });
  const user = await User.findOne({ _id: userId, removed: false }).exec();

  if (!(user as any).enabled) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    };
    return res.status(409).json(response);
  }

  if (!databasePassword || !user) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    };
    return res.status(404).json(response);
  }

  const isMatch = resetToken === (databasePassword as any).resetToken;
  if (
    !isMatch ||
    (databasePassword as any).resetToken === undefined ||
    (databasePassword as any).resetToken === null
  ) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invalid reset token',
    };
    return res.status(403).json(response);
  }

  // validate
  const objectSchema = Joi.object({
    password: Joi.string().required(),
    userId: Joi.string().required(),
    resetToken: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ password, userId, resetToken });
  if (error) {
    const response: ApiResponse & { errorMessage: string } = {
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset password object',
      errorMessage: error.message,
    };
    return res.status(409).json(response);
  }

  const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);
  const emailToken = shortid.generate();

  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET || '',
    { expiresIn: '24h' }
  );

  await UserPassword.findOneAndUpdate(
    { user: userId },
    {
      $push: { loggedSessions: token },
      password: hashedPassword,
      salt: salt,
      emailToken: emailToken,
      resetToken: shortid.generate(),
      emailVerified: true,
    },
    {
      new: true,
    }
  ).exec();

  if (
    resetToken === (databasePassword as any).resetToken &&
    (databasePassword as any).resetToken !== undefined &&
    (databasePassword as any).resetToken !== null
  ) {
    const response: ApiResponse<{
      _id: any;
      name: any;
      surname: any;
      role: any;
      email: any;
      photo: any;
      token: string;
      maxAge: number | null;
    }> = {
      success: true,
      result: {
        _id: (user as any)._id,
        name: (user as any).name,
        surname: (user as any).surname,
        role: (user as any).role,
        email: (user as any).email,
        photo: (user as any).photo,
        token: token,
        maxAge: req.body.remember ? 365 : null,
      },
      message: 'Successfully resetPassword user',
    };
    return res.status(200).json(response);
  }

  const response: ApiResponse = {
    success: false,
    result: null,
    message: 'Invalid reset token',
  };
  return res.status(403).json(response);
};

export default resetPassword;

