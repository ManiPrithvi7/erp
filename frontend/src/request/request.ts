import axios, { CancelTokenSource } from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { RequestOptions, ApiResponse } from '@/types';

import errorHandler from './errorHandler';
import successHandler from './successHandler';
import storePersist from '@/redux/storePersist';

function includeToken(): void {
  axios.defaults.baseURL = API_BASE_URL;

  axios.defaults.withCredentials = true;
  const auth = storePersist.get('auth');

  if (auth) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${(auth as any).current.token}`;
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
      const response = await axios.post(entity + '/create', jsonData);
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
      const response = await axios.post(entity + '/create', jsonData, {
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
      const response = await axios.get(entity + '/read/' + id);
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
      const response = await axios.patch(entity + '/update/' + id, jsonData);
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
      const response = await axios.patch(entity + '/update/' + id, jsonData, {
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
      const response = await axios.delete(entity + '/delete/' + id);
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

      const response = await axios.get(entity + '/filter' + query);
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
      const response = await axios.get(entity + '/search' + query);

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

      const response = await axios.get(entity + '/list' + query);

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

      const response = await axios.get(entity + '/listAll' + query);

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
      const response = await axios.post(entity, jsonData);

      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  get: async ({ entity }: { entity: string }): Promise<ApiResponse> => {
    try {
      includeToken();
      const response = await axios.get(entity);
      return response.data;
    } catch (error) {
      return errorHandler(error as any);
    }
  },
  patch: async ({ entity, jsonData }: { entity: string; jsonData: any }): Promise<ApiResponse> => {
    try {
      includeToken();
      const response = await axios.patch(entity, jsonData);
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
      const response = await axios.patch(entity + '/upload/' + id, jsonData, {
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
      const response = await axios.get(entity + '/summary' + query);

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
      const response = await axios.post(entity + '/mail/', jsonData);
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
      const response = await axios.get(`${entity}/convert/${id}`);
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
