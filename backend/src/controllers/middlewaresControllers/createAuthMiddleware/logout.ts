import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';

interface LogoutParams {
  userModel: string;
}

const logout = async (req: AuthenticatedRequest, res: Response, { userModel }: LogoutParams) => {
  const UserPassword = mongoose.model(userModel + 'Password');

  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (token)
    await UserPassword.findOneAndUpdate(
      { user: req.admin!._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  else
    await UserPassword.findOneAndUpdate(
      { user: req.admin!._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

export default logout;


