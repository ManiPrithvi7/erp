import { Request, Response } from 'express';
import mongoose, { Model, Document } from 'mongoose';
import { ApiResponse } from '@/types';

export const read = async <T extends Document>(
  userModel: string,
  req: Request,
  res: Response
): Promise<Response> => {
  const User: Model<T> = mongoose.model<T>(userModel);

  // Find document by id
  const tmpResult = await User.findOne({
    _id: req.params.id,
    removed: false,
  }).exec();
  // If no results found, return document not found
  if (!tmpResult) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'No document found ',
    };
    return res.status(404).json(response);
  } else {
    // Return success resposne
    const result = {
      _id: tmpResult._id,
      enabled: (tmpResult as any).enabled,
      email: (tmpResult as any).email,
      name: (tmpResult as any).name,
      surname: (tmpResult as any).surname,
      photo: (tmpResult as any).photo,
      role: (tmpResult as any).role,
    };

    const response: ApiResponse<typeof result> = {
      success: true,
      result,
      message: 'we found this document ',
    };
    return res.status(200).json(response);
  }
};

export default read;


