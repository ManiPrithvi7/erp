import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import isValidAuthToken from './isValidAuthToken';
import login from './login';
import logout from './logout';
import forgetPassword from './forgetPassword';
import resetPassword from './resetPassword';
import signUp from './signUp';

export interface AuthMethods {
  isValidAuthToken: (req: Request, res: Response, next: NextFunction) => Promise<Response | void> | Response | void;
  login: (req: Request, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>> | void>;
  forgetPassword: (req: Request, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>> | void>;
  resetPassword: (req: Request, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>> | void>;
  logout: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>> | void>;
  signUp: (req: Request, res: Response<ApiResponse<unknown>>) => Promise<Response<ApiResponse<unknown>> | void>;
}

const createAuthMiddleware = (userModel: string): AuthMethods => {
  const authMethods: AuthMethods = {
    isValidAuthToken: (req: Request, res: Response, next: NextFunction) =>
      isValidAuthToken(req, res, next, {
        userModel,
      }),

    login: (req: Request, res: Response<ApiResponse<unknown>>) =>
      login(req, res, {
        userModel,
      }),

    forgetPassword: (req: Request, res: Response<ApiResponse<unknown>>) =>
      forgetPassword(req, res, {
        userModel,
      }),

    resetPassword: (req: Request, res: Response<ApiResponse<unknown>>) =>
      resetPassword(req, res, {
        userModel,
      }),

    logout: (req: AuthenticatedRequest, res: Response<ApiResponse<unknown>>) =>
      logout(req, res, {
        userModel,
      }),

    signUp: (req: Request, res: Response<ApiResponse<unknown>>) => signUp(req, res, { userModel }),
  };

  return authMethods;
};

export default createAuthMiddleware;


