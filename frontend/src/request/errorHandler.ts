import { notification } from 'antd';
import { AxiosError } from 'axios';
import codeMessage from './codeMessage';
import { ApiResponse } from '@/types';

const errorHandler = (error: AxiosError | Error): ApiResponse => {
  if (!navigator.onLine) {
    notification.config({
      duration: 15,
      maxCount: 1,
    });
    // Code to execute when there is internet connection
    notification.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const axiosError = error as AxiosError;
  const { response } = axiosError;

  if (!response) {
    notification.config({
      duration: 20,
      maxCount: 1,
    });
    // Code to execute when there is no internet connection
    // notification.error({
    //   message: 'Problem connecting to server',
    //   description: 'Cannot connect to the server, Try again later',
    // });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  if (
    response &&
    response.data &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'jwtExpired' in response.data &&
    (response.data as Record<string, unknown>).jwtExpired
  ) {
    const result = window.localStorage.getItem('auth');
    const jsonFile = window.localStorage.getItem('isLogout');
    const { isLogout } = (jsonFile && JSON.parse(jsonFile)) || { isLogout: false };
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('isLogout');
    if (result || isLogout) {
      window.location.href = '/logout';
    }
  }

  if (response && response.status) {
    const responseDataObj = response.data as Record<string, unknown> | null;
    const message =
      responseDataObj && typeof responseDataObj === 'object' && 'message' in responseDataObj
        ? (responseDataObj.message as string)
        : undefined;

    const errorText = message || codeMessage[response.status];
    const { status } = response;
    notification.config({
      duration: 20,
      maxCount: 2,
    });
    notification.error({
      message: `Request error ${status}`,
      description: errorText,
    });

    const errorObj =
      responseDataObj && typeof responseDataObj === 'object' && 'error' in responseDataObj
        ? responseDataObj.error
        : null;
    const isJwtError =
      errorObj &&
      typeof errorObj === 'object' &&
      errorObj !== null &&
      'name' in errorObj &&
      errorObj.name === 'JsonWebTokenError';

    if (isJwtError) {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('isLogout');
      window.location.href = '/logout';
      return {
        success: false,
        result: null,
        message: 'Session expired',
      };
    }
    return (
      (response.data as ApiResponse) || {
        success: false,
        result: null,
        message: errorText || 'Unknown error',
      }
    );
  } else {
    notification.config({
      duration: 15,
      maxCount: 1,
    });

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      // Code to execute when there is internet connection
      notification.error({
        message: 'Problem connecting to server',
        description: 'Cannot connect to the server, Try again later',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Contact your Account administrator',
      };
    } else {
      // Code to execute when there is no internet connection
      notification.error({
        message: 'No internet connection',
        description: 'Cannot connect to the Internet, Check your internet network',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Check your internet network',
      };
    }
  }
};

export default errorHandler;
