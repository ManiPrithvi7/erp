import { Request, Response, NextFunction } from 'express';

declare const adminAuth: {
  isValidAuthToken: (req: Request, res: Response, next: NextFunction) => void;
  login: (req: Request, res: Response) => Promise<any>;
  logout: (req: Request, res: Response) => Promise<any>;
  forgetPassword: (req: Request, res: Response) => Promise<any>;
  resetPassword: (req: Request, res: Response) => Promise<any>;
  signUp: (req: Request, res: Response) => Promise<any>;
};

export default adminAuth;


