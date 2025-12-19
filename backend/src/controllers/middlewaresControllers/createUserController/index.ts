import { Request, Response } from 'express';
import read from './read';
import updateProfile from './updateProfile';
import updatePassword from './updatePassword';
import updateProfilePassword from './updateProfilePassword';

export interface UserController {
  updateProfile: (req: Request, res: Response) => Promise<Response>;
  updatePassword: (req: Request, res: Response) => Promise<Response>;
  updateProfilePassword: (req: Request, res: Response) => Promise<Response>;
  read: (req: Request, res: Response) => Promise<Response>;
}

export const createUserController = (userModel: string): UserController => {
  const userController: UserController = {
    updateProfile: (req: Request, res: Response) => updateProfile(userModel, req, res),
    updatePassword: (req: Request, res: Response) => updatePassword(userModel, req, res),
    updateProfilePassword: (req: Request, res: Response) =>
      updateProfilePassword(userModel, req, res),
    read: (req: Request, res: Response) => read(userModel, req, res),
  };

  return userController;
};

export default createUserController;
