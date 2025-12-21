// Determine API base URL
const getApiBaseUrl = (): string => {
  if (import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote') {
    const backendServer = import.meta.env.VITE_BACKEND_SERVER as string;
    if (!backendServer) {
      console.error('⚠️ VITE_BACKEND_SERVER is not set in production/remote mode!');
      return 'http://localhost:8888/api/';
    }
    return backendServer.endsWith('/') ? `${backendServer}api/` : `${backendServer}/api/`;
  }
  // Development mode - use localhost
  return 'http://localhost:8888/api/';
};

export const API_BASE_URL: string = getApiBaseUrl();

// Determine base URL
const getBaseUrl = (): string => {
  if (import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote') {
    const backendServer = import.meta.env.VITE_BACKEND_SERVER as string;
    if (!backendServer) {
      console.error('⚠️ VITE_BACKEND_SERVER is not set in production/remote mode!');
      return 'http://localhost:8888/';
    }
    return backendServer.endsWith('/') ? backendServer : `${backendServer}/`;
  }
  // Development mode - use localhost
  return 'http://localhost:8888/';
};

export const BASE_URL: string = getBaseUrl();

export const WEBSITE_URL: string = import.meta.env.PROD
  ? 'http://cloud.idurarapp.com/'
  : 'http://localhost:3000/';

// Determine download base URL
const getDownloadBaseUrl = (): string => {
  if (import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote') {
    const backendServer = import.meta.env.VITE_BACKEND_SERVER as string;
    if (!backendServer) {
      console.error('⚠️ VITE_BACKEND_SERVER is not set in production/remote mode!');
      return 'http://localhost:8888/download/';
    }
    return backendServer.endsWith('/') ? `${backendServer}download/` : `${backendServer}/download/`;
  }
  // Development mode - use localhost
  return 'http://localhost:8888/download/';
};

export const DOWNLOAD_BASE_URL: string = getDownloadBaseUrl();

export const ACCESS_TOKEN_NAME: string = 'x-auth-token';

export const FILE_BASE_URL: string | undefined = import.meta.env.VITE_FILE_BASE_URL as string | undefined;

