import { Request, Response } from 'express';
import mongoose, { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const updateProfile = async <T extends Document>(
  userModel: string,
  req: Request,
  res: Response
): Promise<Response> => {
  const User: Model<T> = mongoose.model<T>(userModel);

  const reqUserName = userModel.toLowerCase();
  const userProfile = (req as any)[reqUserName];

  if (userProfile.email === 'admin@admin.com') {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: "you couldn't update demo informations",
    };
    return res.status(403).json(response);
  }

  const updates = req.body.photo
    ? {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        photo: req.body.photo,
      }
    : {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
      };
  // Find document by id and updates with the required fields
  const result = await User.findOneAndUpdate(
    { _id: userProfile._id, removed: false },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  if (!result) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No profile found by this id: ' + userProfile._id,
    };
    return res.status(404).json(response);
  }
  const response: ApiResponse<{
    _id: any;
    enabled: any;
    email: any;
    name: any;
    surname: any;
    photo: any;
    role: any;
  }> = {
    success: true,
    result: {
      _id: result._id,
      enabled: (result as any).enabled,
      email: (result as any).email,
      name: (result as any).name,
      surname: (result as any).surname,
      photo: (result as any).photo,
      role: (result as any).role,
    },
    message: 'we update this profile by this id: ' + userProfile._id,
  };
  return res.status(200).json(response);
};

export default updateProfile;


