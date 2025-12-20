import isValidAuthToken from './isValidAuthToken';
import login from './login';
import logout from './logout';
import forgetPassword from './forgetPassword';
import resetPassword from './resetPassword';
import signUp from './signUp';

const createAuthMiddleware = (userModel: string) => {
  let authMethods: any = {};

  authMethods.isValidAuthToken = (req: any, res: any, next: any) =>
    isValidAuthToken(req, res, next, {
      userModel,
    });

  authMethods.login = (req: any, res: any) =>
    login(req, res, {
      userModel,
    });

  authMethods.forgetPassword = (req: any, res: any) =>
    forgetPassword(req, res, {
      userModel,
    });

  authMethods.resetPassword = (req: any, res: any) =>
    resetPassword(req, res, {
      userModel,
    });

  authMethods.logout = (req: any, res: any) =>
    logout(req, res, {
      userModel,
    });
  authMethods.signUp = (req: any, res: any) => signUp(req, res, { userModel });
  return authMethods;
};

export default createAuthMiddleware;


