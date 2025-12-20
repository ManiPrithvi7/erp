import { Response } from 'express';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { generate as uniqueId } from 'shortid';
import { AuthenticatedRequest } from '@/types';

const updateProfilePassword = async (userModel: string, req: AuthenticatedRequest, res: Response) => {
  const UserPassword = mongoose.model(userModel + 'Password');

  const reqUserName = userModel.toLowerCase();
  const userProfile = (req as any)[reqUserName] || req.admin;

  if (!userProfile) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'User profile not found',
    });
  }

  let { password, passwordCheck } = req.body;

  if (!password || !passwordCheck)
    return res.status(400).json({ msg: 'Not all fields have been entered.' });

  if (password.length < 8)
    return res.status(400).json({
      msg: 'The password needs to be at least 8 characters long.',
    });

  if (password !== passwordCheck)
    return res.status(400).json({ msg: 'Enter the same password twice for verification.' });

  // Find document by id and updates with the required fields

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  const UserPasswordData = {
    password: passwordHash,
    salt: salt,
  };

  if (userProfile.email === 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  }
  const resultPassword = await UserPassword.findOneAndUpdate(
    { user: userProfile._id, removed: false },
    { $set: UserPasswordData },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  if (!resultPassword) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "User Password couldn't save correctly",
    });
  }

  return res.status(200).json({
    success: true,
    result: {},
    message: 'we update the password by this id: ' + userProfile._id,
  });
};

export default updateProfilePassword;


