import mongoose, { Model } from 'mongoose';

interface GetDataParams {
  model: string;
}

interface GetOneParams {
  model: string;
  id: string;
}

export const getData = ({ model }: GetDataParams) => {
  const Model = mongoose.model(model);
  const result = Model.find({ removed: false, enabled: true });
  return result;
};

export const getOne = ({ model, id }: GetOneParams) => {
  const Model = mongoose.model(model);
  const result = Model.findOne({ _id: id, removed: false });
  return result;
};


