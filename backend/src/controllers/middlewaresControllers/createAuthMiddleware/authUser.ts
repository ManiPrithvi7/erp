import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

interface AuthUserParams {
  user: any;
  databasePassword: any;
  password: string;
  UserPasswordModel: Model<Document>;
}

export const authUser = async (
  req: Request,
  res: Response,
  { user, databasePassword, password, UserPasswordModel }: AuthUserParams
): Promise<Response> => {
  const isMatch = await bcrypt.compare(databasePassword.salt + password, databasePassword.password);

  if (!isMatch) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invalid credentials.',
    };
    return res.status(403).json(response);
  }

  if (isMatch === true) {
    const expiresIn = req.body.remember ? (365 * 24).toString() + 'h' : '24h';
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    await UserPasswordModel.findOneAndUpdate(
      { user: user._id },
      { $push: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();

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
        _id: user._id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: req.body.remember ? 365 : null,
      },
      message: 'Successfully login user',
    };
    return res.status(200).json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Invalid credentials.',
    };
    return res.status(403).json(response);
  }
};

export default authUser;

