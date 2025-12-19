import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

export const mail = async (req: Request, res: Response): Promise<Response> => {
  const response: ApiResponse = {
    success: true,
    result: null,
    message: 'Please Upgrade to Premium  Version to have full features',
  };
  return res.status(200).json(response);
};

export default mail;

