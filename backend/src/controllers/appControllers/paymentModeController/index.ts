import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import { IPaymentMode } from '@/models/appModels/PaymentMode';
import { ApiResponse } from '@/types';

const PaymentMode: Model<IPaymentMode> = mongoose.model<IPaymentMode>('PaymentMode');
const methods: CRUDController & {
  delete: (req: Request, res: Response) => Promise<Response>;
} = createCRUDController('PaymentMode') as any;

delete (methods as any)['delete'];

methods.create = async (req: Request, res: Response): Promise<Response> => {
  const { isDefault } = req.body;

  if (isDefault) {
    await PaymentMode.updateMany({}, { isDefault: false });
  }

  const countDefault = await PaymentMode.countDocuments({
    isDefault: true,
  });

  const result = await new PaymentMode({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
  }).save();

  const response: ApiResponse<IPaymentMode> = {
    success: true,
    result: result as any,
    message: 'payment mode created successfully',
  };
  return res.status(200).json(response);
};

methods.delete = async (req: Request, res: Response): Promise<Response> => {
  const response: ApiResponse = {
    success: false,
    result: null,
    message: "you can't delete payment mode after it has been created",
  };
  return res.status(403).json(response);
};

methods.update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const paymentMode = await PaymentMode.findOne({
    _id: req.params.id,
    removed: false,
  }).exec();
  if (!paymentMode) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Payment mode not found',
    };
    return res.status(404).json(response);
  }
  const { isDefault = paymentMode.isDefault, enabled = paymentMode.enabled } = req.body;

  // if isDefault:false , we update first - isDefault:true
  // if enabled:false and isDefault:true , we update first - isDefault:true
  if (!isDefault || (!enabled && isDefault)) {
    await PaymentMode.findOneAndUpdate({ _id: { $ne: id }, enabled: true }, { isDefault: true });
  }

  // if isDefault:true and enabled:true, we update other paymentMode and make is isDefault:false
  if (isDefault && enabled) {
    await PaymentMode.updateMany({ _id: { $ne: id } }, { isDefault: false });
  }

  const paymentModeCount = await PaymentMode.countDocuments({});

  // if enabled:false and it's only one exist, we can't disable
  if ((!enabled || !isDefault) && paymentModeCount <= 1) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'You cannot disable the paymentMode because it is the only existing one',
    };
    return res.status(422).json(response);
  }

  const result = await PaymentMode.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  const response: ApiResponse<IPaymentMode> = {
    success: true,
    message: 'paymentMode updated successfully',
    result: result as any,
  };
  return res.status(200).json(response);
};

export default methods;

