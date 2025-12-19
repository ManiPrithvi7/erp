import { Request, Response, NextFunction } from 'express';
import isValidAuthToken from './isValidAuthToken';
import login from './login';
import logout from './logout';
import forgetPassword from './forgetPassword';
import resetPassword from './resetPassword';
import signUp from './signUp';

export interface AuthMethods {
  isValidAuthToken: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
  login: (req: Request, res: Response) => Promise<Response>;
  forgetPassword: (req: Request, res: Response) => Promise<Response>;
  resetPassword: (req: Request, res: Response) => Promise<Response>;
  logout: (req: Request, res: Response) => Promise<Response>;
  signUp: (req: Request, res: Response) => Promise<Response>;
}

export const createAuthMiddleware = (userModel: string): AuthMethods => {
  const authMethods: AuthMethods = {
    isValidAuthToken: (req: Request, res: Response, next: NextFunction) =>
      isValidAuthToken(req, res, next, {
        userModel,
      }),

    login: (req: Request, res: Response) =>
      login(req, res, {
        userModel,
      }),

    forgetPassword: (req: Request, res: Response) =>
      forgetPassword(req, res, {
        userModel,
      }),

    resetPassword: (req: Request, res: Response) =>
      resetPassword(req, res, {
        userModel,
      }),

    logout: (req: Request, res: Response) =>
      logout(req, res, {
        userModel,
      }),
    signUp: (req: Request, res: Response) => signUp(req, res, { userModel }),
  };
  return authMethods;
};

export default createAuthMiddleware;

