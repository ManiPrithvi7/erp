import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import Joi from 'joi';
import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import * as shortid from 'shortid';

interface ResetPasswordParams {
  userModel: string;
}

const resetPassword = async (req: AuthenticatedRequest, res: Response, { userModel }: ResetPasswordParams) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
  const { password, userId, resetToken } = req.body;

  const databasePassword = await UserPassword.findOne({ user: userId, removed: false });
  const user = await User.findOne({ _id: userId, removed: false }).exec();

  if (!user) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });
  }

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  if (!databasePassword)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const isMatch = resetToken === databasePassword.resetToken;
  if (!isMatch || databasePassword.resetToken === undefined || databasePassword.resetToken === null)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid reset token',
    });

  // validate
  const objectSchema = Joi.object({
    password: Joi.string().required(),
    userId: Joi.string().required(),
    resetToken: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ password, userId, resetToken });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset password object',
      errorMessage: error.message,
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'JWT_SECRET is not configured',
    });
  }

  const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);
  const emailToken = shortid.generate();

  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
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
    resetToken === databasePassword.resetToken &&
    databasePassword.resetToken !== undefined &&
    databasePassword.resetToken !== null
  )
    return res.status(200).json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: (req.body as any).remember ? 365 : null,
      },
      message: 'Successfully resetPassword user',
    });
  return;
};

export default resetPassword;

