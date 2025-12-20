import * as jwt from 'jsonwebtoken';
import mongoose, { Model, Document } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';

interface IsValidAuthTokenParams {
  userModel: string;
  jwtSecret?: string;
}

const isValidAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  { userModel, jwtSecret = 'JWT_SECRET' }: IsValidAuthTokenParams
) => {
  try {
    const UserPassword = mongoose.model(userModel + 'Password');
    const User = mongoose.model(userModel);

    // const token = req.cookies[`token_${cloud._id}`];
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token

    if (!token)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      });

    const jwtSecretValue = process.env[jwtSecret];
    if (!jwtSecretValue) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'JWT_SECRET is not configured',
      });
    }

    const verified = jwt.verify(token, jwtSecretValue) as { id: string };

    if (!verified)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      });

    const userPasswordPromise = UserPassword.findOne({ user: verified.id, removed: false });
    const userPromise = User.findOne({ _id: verified.id, removed: false });

    const [user, userPassword] = await Promise.all([userPromise, userPasswordPromise]);

    if (!user)
      return res.status(401).json({
        success: false,
        result: null,
        message: "User doens't Exist, authorization denied.",
        jwtExpired: true,
      });

    const { loggedSessions } = userPassword;

    if (!loggedSessions.includes(token))
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User is already logout try to login, authorization denied.',
        jwtExpired: true,
      });
    else {
      const reqUserName = userModel.toLowerCase();
      (req as any)[reqUserName] = user;
      (req as AuthenticatedRequest).admin = user;
      return next();
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
      jwtExpired: true,
    });
  }
};

export default isValidAuthToken;

