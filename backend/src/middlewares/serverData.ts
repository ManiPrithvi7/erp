import mongoose, { Document } from 'mongoose';

export const getData = <T extends Document>({ model }: { model: string }) => {
  const Model = mongoose.model<T>(model);
  const result = Model.find({ removed: false, enabled: true });
  return result;
};

export const getOne = <T extends Document>({ model, id }: { model: string; id: string }) => {
  const Model = mongoose.model<T>(model);
  const result = Model.findOne({ _id: id, removed: false });
  return result;
};

