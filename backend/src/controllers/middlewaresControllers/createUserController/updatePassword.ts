import { Request, Response } from 'express';
import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { generate as uniqueId } from 'shortid';
import { ApiResponse } from '@/types';

export const updatePassword = async <T extends Document>(
  userModel: string,
  req: Request,
  res: Response
): Promise<Response> => {
  const UserPassword: Model<T> = mongoose.model<T>(userModel + 'Password');

  const reqUserName = userModel.toLowerCase();
  const userProfile = (req as any)[reqUserName];

  const { password } = req.body;

  if (!password || password.length < 8) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'The password needs to be at least 8 characters long.',
    };
    return res.status(400).json(response);
  }

  // Find document by id and updates with the required fields

  if (userProfile.email === 'admin@admin.com') {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: "you couldn't update demo password",
    };
    return res.status(403).json(response);
  }

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  const UserPasswordData = {
    password: passwordHash,
    salt: salt,
  };

  const resultPassword = await UserPassword.findOneAndUpdate(
    { user: req.params.id, removed: false },
    { $set: UserPasswordData },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  // Code to handle the successful response

  if (!resultPassword) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: "User Password couldn't save correctly",
    };
    return res.status(403).json(response);
  }

  const response: ApiResponse<{}> = {
    success: true,
    result: {},
    message: 'we update the password by this id: ' + userProfile._id,
  };
  return res.status(200).json(response);
};

export default updatePassword;
