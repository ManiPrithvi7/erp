export const API_BASE_URL: string =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote'
    ? (import.meta.env.VITE_BACKEND_SERVER as string) + 'api/'
    : 'http://localhost:8888/api/';

export const BASE_URL: string =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? (import.meta.env.VITE_BACKEND_SERVER as string)
    : 'http://localhost:8888/';

export const WEBSITE_URL: string = import.meta.env.PROD
  ? 'http://cloud.idurarapp.com/'
  : 'http://localhost:3000/';

export const DOWNLOAD_BASE_URL: string =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? (import.meta.env.VITE_BACKEND_SERVER as string) + 'download/'
    : 'http://localhost:8888/download/';

export const ACCESS_TOKEN_NAME: string = 'x-auth-token';

export const FILE_BASE_URL: string | undefined = import.meta.env.VITE_FILE_BASE_URL as string | undefined;

