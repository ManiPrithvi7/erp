import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { ApiResponse } from '@/types';

interface LogoutParams {
  userModel: string;
}

export const logout = async (
  req: Request,
  res: Response,
  { userModel }: LogoutParams
): Promise<Response> => {
  const UserPassword: Model<any> = mongoose.model(userModel + 'Password');

  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (token) {
    await UserPassword.findOneAndUpdate(
      { user: req.admin?._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  } else {
    await UserPassword.findOneAndUpdate(
      { user: req.admin?._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();
  }

  const response: ApiResponse<{}> = {
    success: true,
    result: {},
    message: 'Successfully logout',
  };
  return res.json(response);
};

export default logout;

