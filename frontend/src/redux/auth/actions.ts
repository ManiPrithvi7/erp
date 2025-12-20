import { Dispatch } from 'redux';
import * as actionTypes from './types';
import * as authService from '@/auth';
import { request } from '@/request';
import { User } from '@/types';

interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  country?: string;
  [key: string]: unknown;
}

interface ResetPasswordData {
  password: string;
  confirm_password: string;
  userId?: string;
  emailToken?: string;
  [key: string]: unknown;
}

export const login =
  ({ loginData }: { loginData: LoginData }) =>
  async (dispatch: Dispatch): Promise<void> => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.login({ loginData });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
      window.localStorage.removeItem('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const register =
  ({ registerData }: { registerData: RegisterData }) =>
  async (dispatch: Dispatch): Promise<void> => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.register({ registerData });

    if (data.success === true) {
      // If signup returns user data and token, automatically log them in
      if (data.result && (data.result as User).token) {
        const auth_state = {
          current: data.result,
          isLoggedIn: true,
          isLoading: false,
          isSuccess: true,
        };
        window.localStorage.setItem('auth', JSON.stringify(auth_state));
        window.localStorage.removeItem('isLogout');
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REGISTER_SUCCESS,
        });
      }
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const verify =
  ({ userId, emailToken }: { userId: string; emailToken: string }) =>
  async (dispatch: Dispatch): Promise<void> => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.verify({ userId, emailToken });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
      window.localStorage.removeItem('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const resetPassword =
  ({ resetPasswordData }: { resetPasswordData: ResetPasswordData }) =>
  async (dispatch: Dispatch): Promise<void> => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.resetPassword({ resetPasswordData });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
      window.localStorage.removeItem('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const logout =
  () =>
  async (dispatch: Dispatch): Promise<void> => {
    dispatch({
      type: actionTypes.LOGOUT_SUCCESS,
    });
    const result = window.localStorage.getItem('auth');
    const tmpAuth = result ? JSON.parse(result) : null;
    const settings = window.localStorage.getItem('settings');
    const tmpSettings = settings ? JSON.parse(settings) : null;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('settings');
    window.localStorage.setItem('isLogout', JSON.stringify({ isLogout: true }));
    const data = await authService.logout();
    if (data.success === false) {
      const auth_state = {
        current: tmpAuth,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
      if (tmpSettings) {
        window.localStorage.setItem('settings', JSON.stringify(tmpSettings));
      }
      window.localStorage.removeItem('isLogout');
      dispatch({
        type: actionTypes.LOGOUT_FAILED,
        payload: data.result,
      });
    } else {
      // on logout success
    }
  };

export const updateProfile =
  ({ entity, jsonData }: { entity: string; jsonData: Record<string, unknown> }) =>
  async (dispatch: Dispatch): Promise<void> => {
    let data = await request.updateAndUpload({ entity, id: '', jsonData });

    if (data.success === true) {
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
    }
  };
