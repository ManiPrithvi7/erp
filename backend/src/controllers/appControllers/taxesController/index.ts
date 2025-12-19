import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { CRUDController } from '@/types';
import { ITaxes } from '@/models/appModels/Taxes';
import { ApiResponse } from '@/types';

const Taxes: Model<ITaxes> = mongoose.model<ITaxes>('Taxes');
const methods: CRUDController & { delete: (req: Request, res: Response) => Promise<Response> } =
  createCRUDController('Taxes') as any;

delete (methods as any)['delete'];

methods.create = async (req: Request, res: Response): Promise<Response> => {
  const { isDefault } = req.body;

  if (isDefault) {
    await Taxes.updateMany({}, { isDefault: false });
  }

  const countDefault = await Taxes.countDocuments({
    isDefault: true,
  });

  const result = await new Taxes({
    ...req.body,
    isDefault: countDefault < 1 ? true : false,
  }).save();

  const response: ApiResponse<ITaxes> = {
    success: true,
    result: result as any,
    message: 'Tax created successfully',
  };
  return res.status(200).json(response);
};

methods.delete = async (req: Request, res: Response): Promise<Response> => {
  const response: ApiResponse = {
    success: false,
    result: null,
    message: "you can't delete tax after it has been created",
  };
  return res.status(403).json(response);
};

methods.update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const tax = await Taxes.findOne({
    _id: req.params.id,
    removed: false,
  }).exec();
  if (!tax) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'Tax not found',
    };
    return res.status(404).json(response);
  }
  const { isDefault = tax.isDefault, enabled = tax.enabled } = req.body;

  // if isDefault:false , we update first - isDefault:true
  // if enabled:false and isDefault:true , we update first - isDefault:true
  if (!isDefault || (!enabled && isDefault)) {
    await Taxes.findOneAndUpdate({ _id: { $ne: id }, enabled: true }, { isDefault: true });
  }

  // if isDefault:true and enabled:true, we update other taxes and make is isDefault:false
  if (isDefault && enabled) {
    await Taxes.updateMany({ _id: { $ne: id } }, { isDefault: false });
  }

  const taxesCount = await Taxes.countDocuments({});

  // if enabled:false and it's only one exist, we can't disable
  if ((!enabled || !isDefault) && taxesCount <= 1) {
    const response: ApiResponse = {
      success: false,
      result: null,
      message: 'You cannot disable the tax because it is the only existing one',
    };
    return res.status(422).json(response);
  }

  const result = await Taxes.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  const response: ApiResponse<ITaxes> = {
    success: true,
    message: 'Tax updated successfully',
    result: result as any,
  };
  return res.status(200).json(response);
};

export default methods;

