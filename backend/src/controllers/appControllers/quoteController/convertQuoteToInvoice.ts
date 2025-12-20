import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';

const convertQuoteToInvoice = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    result: null,
    message: 'Please Upgrade to Premium  Version to have full features',
  });
};

export default convertQuoteToInvoice;


