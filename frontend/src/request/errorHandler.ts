import { notification } from 'antd';
import { AxiosError } from 'axios';
import codeMessage from './codeMessage';
import { ApiResponse } from '@/types';

const errorHandler = (error: AxiosError | Error): ApiResponse => {
  // Log error details for debugging
  console.error('\n❌ ===== FRONTEND API ERROR =====');
  console.error(`⏰ Time: ${new Date().toISOString()}`);
  console.error(`🔹 Error Type: ${error.constructor.name}`);
  console.error(`🔹 Error Message: ${error.message}`);

  if (!navigator.onLine) {
    console.error('🔴 No internet connection detected');
    notification.config({
      duration: 15,
      maxCount: 1,
    });
    // Code to execute when there is internet connection
    notification.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
    });
    console.error('================================\n');
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const axiosError = error as AxiosError;
  const { response, request, config } = axiosError;

  // Log request details
  if (config) {
    console.error(`🔹 Request URL: ${config.baseURL || ''}${config.url || ''}`);
    console.error(`🔹 Request Method: ${config.method?.toUpperCase() || 'UNKNOWN'}`);
  }

  if (!response) {
    console.error('🔴 No response received from server');
    if (request) {
      console.error(`🔹 Request Status: ${request.status || 'UNKNOWN'}`);
      console.error(`🔹 Request Ready State: ${request.readyState || 'UNKNOWN'}`);
    }
    console.error('💡 Possible causes:');
    console.error('   - Backend server is not running');
    console.error('   - CORS configuration issue');
    console.error('   - Network connectivity problem');
    console.error('   - Wrong API base URL configured');
    notification.config({
      duration: 20,
      maxCount: 1,
    });
    // Code to execute when there is no internet connection
    // notification.error({
    //   message: 'Problem connecting to server',
    //   description: 'Cannot connect to the server, Try again later',
    // });
    console.error('================================\n');
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  // Log response details
  console.error(`🔹 Response Status: ${response.status}`);
  console.error(`🔹 Response Status Text: ${response.statusText}`);
  
  // Special handling for redirect status codes (3xx)
  if (response.status >= 300 && response.status < 400) {
    console.error('🔴 REDIRECT DETECTED - This should not happen for API calls');
    console.error(`🔹 Redirect Location: ${response.headers?.location || 'Not specified'}`);
    console.error('💡 Possible causes:');
    console.error('   - URL has trailing slash issue');
    console.error('   - Backend is redirecting incorrectly');
    console.error('   - API base URL configuration issue');
  }
  
  if (response.data) {
    console.error(`🔹 Response Data:`, response.data);
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

    const { status } = response;
    
    // Special handling for 300 status code (Multiple Choices - redirect)
    if (status === 300) {
      const location = response.headers?.location || 'Not specified';
      console.error('🔴 HTTP 300 Multiple Choices - Redirect detected');
      console.error(`🔹 Redirect Location: ${location}`);
      console.error('💡 This usually indicates:');
      console.error('   - URL has trailing slash mismatch');
      console.error('   - Backend is redirecting incorrectly');
      console.error('   - API endpoint path is incorrect');
    }
    
    const errorText = message || codeMessage[status] || `HTTP ${status} error`;
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
