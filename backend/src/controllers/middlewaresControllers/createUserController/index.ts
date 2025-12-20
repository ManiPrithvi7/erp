import read from './read';
import updateProfile from './updateProfile';
import updatePassword from './updatePassword';
import updateProfilePassword from './updateProfilePassword';

const createUserController = (userModel: string) => {
  const userController: any = {};

  userController.updateProfile = (req: any, res: any) => updateProfile(userModel, req, res);
  userController.updatePassword = (req: any, res: any) => updatePassword(userModel, req, res);
  userController.updateProfilePassword = (req: any, res: any) => updateProfilePassword(userModel, req, res);

  userController.read = (req: any, res: any) => read(userModel, req, res);

  return userController;
};

export default createUserController;


