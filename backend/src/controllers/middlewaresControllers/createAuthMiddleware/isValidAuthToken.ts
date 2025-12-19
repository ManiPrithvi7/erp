import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Model } from 'mongoose';
import { ApiResponse } from '@/types';

interface AuthTokenParams {
  userModel: string;
  jwtSecret?: string;
}

export const isValidAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  { userModel, jwtSecret = 'JWT_SECRET' }: AuthTokenParams
): Promise<Response | void> => {
  try {
    const UserPassword: Model<any> = mongoose.model(userModel + 'Password');
    const User: Model<any> = mongoose.model(userModel);

    // const token = req.cookies[`token_${cloud._id}`];
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token

    if (!token) {
      const response: ApiResponse & { jwtExpired: boolean } = {
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      };
      return res.status(401).json(response);
    }

    const verified = jwt.verify(token, process.env[jwtSecret] || '') as { id: string };

    if (!verified) {
      const response: ApiResponse & { jwtExpired: boolean } = {
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      };
      return res.status(401).json(response);
    }

    const userPasswordPromise = UserPassword.findOne({ user: verified.id, removed: false });
    const userPromise = User.findOne({ _id: verified.id, removed: false });

    const [user, userPassword] = await Promise.all([userPromise, userPasswordPromise]);

    if (!user) {
      const response: ApiResponse & { jwtExpired: boolean } = {
        success: false,
        result: null,
        message: "User doens't Exist, authorization denied.",
        jwtExpired: true,
      };
      return res.status(401).json(response);
    }

    const { loggedSessions } = userPassword as any;

    if (!loggedSessions.includes(token)) {
      const response: ApiResponse & { jwtExpired: boolean } = {
        success: false,
        result: null,
        message: 'User is already logout try to login, authorization denied.',
        jwtExpired: true,
      };
      return res.status(401).json(response);
    } else {
      const reqUserName = userModel.toLowerCase();
      (req as any)[reqUserName] = user;
      next();
    }
  } catch (error: any) {
    const response: ApiResponse & { jwtExpired: boolean; controller: string } = {
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
      jwtExpired: true,
    };
    return res.status(500).json(response);
  }
};

export default isValidAuthToken;

