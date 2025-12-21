import axios, { CancelTokenSource } from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { RequestOptions, ApiResponse } from '@/types';

import errorHandler from './errorHandler';
import successHandler from './successHandler';
import storePersist from '@/redux/storePersist';

// Cache to prevent excessive logging and re-configuration
let lastToken: string | null = null;
let isConfigured = false;

/**
 * Normalize URL to prevent double slashes and trailing slash issues
 * @param url - URL to normalize
 * @returns Normalized URL
 */
function normalizeUrl(url: string): string {
  // Remove double slashes (except after protocol)
  return url.replace(/([^:]\/)\/+/g, '$1');
}

function includeToken(): void {
  // Only set defaults once
  if (!isConfigured) {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.withCredentials = true;
    // Configure redirect handling - allow redirects but log them
    axios.defaults.maxRedirects = 5; // Allow redirects (default)
    // Validate status - only 2xx are considered success (redirects 3xx will be errors)
    axios.defaults.validateStatus = (status) => {
      return status >= 200 && status < 300; // Only 2xx are success, 3xx will throw
    };
    
    // Add request interceptor for debugging
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      axios.interceptors.request.use(
        (config) => {
          const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
          console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
          if (config.data && Object.keys(config.data).length > 0) {
            console.log(`🔵 Request Data:`, config.data);
          }
          return config;
        },
        (error) => {
          console.error('🔴 Request Interceptor Error:', error);
          return Promise.reject(error);
        }
      );
      
      // Add response interceptor for debugging redirects
      axios.interceptors.response.use(
        (response) => {
          // Log successful responses in dev mode
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
          }
          return response;
        },
        (error) => {
          // Log error responses, especially redirects
          if (error.response) {
            const status = error.response.status;
            if (status >= 300 && status < 400) {
              console.error(`🟡 REDIRECT DETECTED: ${status} ${error.config.method?.toUpperCase()} ${error.config.url}`);
              console.error(`🟡 Redirect Location: ${error.response.headers?.location || 'Not specified'}`);
            }
          }
          return Promise.reject(error);
        }
      );
    }
    
    isConfigured = true;
  }

  const auth = storePersist.get('auth');
  const token = auth ? (auth as any).current?.token : null;

  // Only update if token changed
  if (token !== lastToken) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    lastToken = token;
  }
}

interface RequestInterface {
  create: ({ entity, jsonData }: { entity: string; jsonData: any }) => Promise<ApiResponse>;
  createAndUpload: ({
    entity,
    jsonData,
  }: {
    entity: string;
    jsonData: FormData | any;
  }) => Promise<ApiResponse>;
  read: ({ entity, id }: { entity: string; id: string }) => Promise<ApiResponse>;
  update: ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: any;
  }) => Promise<ApiResponse>;
  updateAndUpload: ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: FormData | any;
  }) => Promise<ApiResponse>;
  delete: ({ entity, id }: { entity: string; id: string }) => Promise<ApiResponse>;
  filter: ({
    entity,
    options,
  }: {
    entity: string;
    options?: RequestOptions;
  }) => Promise<ApiResponse>;
  search: ({
    entity,
    options,
  }: {
    entity: string;
    options?: RequestOptions;
  }) => Promise<ApiResponse>;
  list: ({ entity, options }: { entity: string; options?: RequestOptions }) => Promise<ApiResponse>;
  listAll: ({
    entity,
    options,
  }: {
    entity: string;
    options?: RequestOptions;
  }) => Promise<ApiResponse>;
  post: ({ entity, jsonData }: { entity: string; jsonData: any }) => Promise<ApiResponse>;
  get: ({ entity }: { entity: string }) => Promise<ApiResponse>;
  patch: ({ entity, jsonData }: { entity: string; jsonData: any }) => Promise<ApiResponse>;
  upload: ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: FormData | any;
  }) => Promise<ApiResponse>;
  source: () => CancelTokenSource;
  summary: ({
    entity,
    options,
  }: {
    entity: string;
    options?: RequestOptions;
  }) => Promise<ApiResponse>;
  mail: ({ entity, jsonData }: { entity: string; jsonData: any }) => Promise<ApiResponse>;
  convert: ({ entity, id }: { entity: string; id: string }) => Promise<ApiResponse>;
}

const request: RequestInterface = {
  create: async ({ entity, jsonData }: { entity: string; jsonData: any }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/create`);
      const response = await axios.post(url, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  createAndUpload: async ({
    entity,
    jsonData,
  }: {
    entity: string;
    jsonData: FormData | any;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/create`);
      const response = await axios.post(url, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  read: async ({ entity, id }: { entity: string; id: string }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/read/${id}`);
      const response = await axios.get(url);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  update: async ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: any;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/update/${id}`);
      const response = await axios.patch(url, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  updateAndUpload: async ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: FormData | any;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/update/${id}`);
      const response = await axios.patch(url, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  delete: async ({ entity, id }: { entity: string; id: string }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/delete/${id}`);
      const response = await axios.delete(url);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  filter: async ({
    entity,
    options = {},
  }: {
    entity: string;
    options?: RequestOptions;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      let filter = options.filter ? 'filter=' + options.filter : '';
      let equal = options.equal ? '&equal=' + options.equal : '';
      let query = `?${filter}${equal}`;

      const url = normalizeUrl(`${entity}/filter${query}`);
      const response = await axios.get(url);
      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  search: async ({
    entity,
    options = {},
  }: {
    entity: string;
    options?: RequestOptions;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      // headersInstance.cancelToken = source.token;
      const url = normalizeUrl(`${entity}/search${query}`);
      const response = await axios.get(url);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  list: async ({
    entity,
    options = {},
  }: {
    entity: string;
    options?: RequestOptions;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);

      const url = normalizeUrl(`${entity}/list${query}`);
      const response = await axios.get(url);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  listAll: async ({
    entity,
    options = {},
  }: {
    entity: string;
    options?: RequestOptions;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);

      const url = normalizeUrl(`${entity}/listAll${query}`);
      const response = await axios.get(url);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  post: async ({ entity, jsonData }: { entity: string; jsonData: any }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(entity);
      const response = await axios.post(url, jsonData);

      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  get: async ({ entity }: { entity: string }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(entity);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  patch: async ({ entity, jsonData }: { entity: string; jsonData: any }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(entity);
      const response = await axios.patch(url, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  upload: async ({
    entity,
    id,
    jsonData,
  }: {
    entity: string;
    id: string;
    jsonData: FormData | any;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/upload/${id}`);
      const response = await axios.patch(url, jsonData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  source: (): CancelTokenSource => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return source;
  },

  summary: async ({
    entity,
    options = {},
  }: {
    entity: string;
    options?: RequestOptions;
  }): Promise<ApiResponse> => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      const url = normalizeUrl(`${entity}/summary${query}`);
      const response = await axios.get(url);

      successHandler(response, {
        notifyOnSuccess: false,
        notifyOnFailed: false,
      });

      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  mail: async ({ entity, jsonData }: { entity: string; jsonData: any }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/mail`);
      const response = await axios.post(url, jsonData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },

  convert: async ({ entity, id }: { entity: string; id: string }): Promise<ApiResponse> => {
    try {
      includeToken();
      const url = normalizeUrl(`${entity}/convert/${id}`);
      const response = await axios.get(url);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
};
export default request;
