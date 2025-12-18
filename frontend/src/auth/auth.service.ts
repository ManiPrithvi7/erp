import { API_BASE_URL } from '@/config/serverApiConfig';
import axios, { AxiosError } from 'axios';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import { ApiResponse, User } from '@/types';

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

export const login = async ({
  loginData,
}: {
  loginData: LoginData;
}): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.post(
      API_BASE_URL + `login?timestamp=${new Date().getTime()}`,
      loginData
    );

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error as Error | AxiosError) as ApiResponse<User>;
  }
};

export const register = async ({
  registerData,
}: {
  registerData: RegisterData;
}): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.post(
      API_BASE_URL + `signup?timestamp=${new Date().getTime()}`,
      registerData
    );

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error as Error | AxiosError) as ApiResponse<User>;
  }
};

export const verify = async ({
  userId,
  emailToken,
}: {
  userId: string;
  emailToken: string;
}): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.get(API_BASE_URL + `verify/${userId}/${emailToken}`);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error as Error | AxiosError) as ApiResponse<User>;
  }
};

export const resetPassword = async ({
  resetPasswordData,
}: {
  resetPasswordData: ResetPasswordData;
}): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.post(API_BASE_URL + `resetpassword`, resetPasswordData);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error as Error | AxiosError) as ApiResponse<User>;
  }
};

export const logout = async (): Promise<ApiResponse> => {
  axios.defaults.withCredentials = true;
  try {
    // window.localStorage.clear();
    const response = await axios.post(API_BASE_URL + `logout?timestamp=${new Date().getTime()}`);
    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error as Error | AxiosError) as ApiResponse<User>;
  }
};
