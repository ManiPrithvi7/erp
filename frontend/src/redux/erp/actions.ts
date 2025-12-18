import { Dispatch } from 'redux';
import * as actionTypes from './types';
import { request } from '@/request';
import { RequestOptions } from '@/types';

interface ErpAction {
  type: string;
  keyState?: string;
  payload?: unknown;
}

export const erp = {
  resetState:
    () =>
    (dispatch: Dispatch<ErpAction>): void => {
      dispatch({
        type: actionTypes.RESET_STATE,
      });
    },
  resetAction:
    ({ actionType }: { actionType: string }) =>
    (dispatch: Dispatch<ErpAction>): void => {
      dispatch({
        type: actionTypes.RESET_ACTION,
        keyState: actionType,
        payload: null,
      });
    },
  currentItem:
    ({ data }: { data: Record<string, unknown> }) =>
    (dispatch: Dispatch<ErpAction>): void => {
      dispatch({
        type: actionTypes.CURRENT_ITEM,
        payload: { ...data },
      });
    },
  currentAction:
    ({ actionType, data }: { actionType: string; data: Record<string, unknown> }) =>
    (dispatch: Dispatch<ErpAction>): void => {
      dispatch({
        type: actionTypes.CURRENT_ACTION,
        keyState: actionType,
        payload: { ...data },
      });
    },
  list:
    ({ entity, options = { page: 1, items: 10 } }: { entity: string; options?: RequestOptions }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'list',
        payload: null,
      });

      let data = await request.list({ entity, options });

      if (data.success === true) {
        const result = {
          items: data.result,
          pagination: {
            current: parseInt((data as any).pagination?.page || '1', 10),
            pageSize: options?.items || 10,
            total: parseInt((data as any).pagination?.count || '0', 10),
          },
        };
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'list',
          payload: result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'list',
          payload: null,
        });
      }
    },
  create:
    ({ entity, jsonData }: { entity: string; jsonData: Record<string, unknown> }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'create',
        payload: null,
      });

      let data = await request.create({ entity, jsonData });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'create',
          payload: data.result,
        });
        dispatch({
          type: actionTypes.CURRENT_ITEM,
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'create',
          payload: null,
        });
      }
    },
  recordPayment:
    ({ entity, jsonData }: { entity: string; jsonData: Record<string, unknown> }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'recordPayment',
        payload: null,
      });

      let data = await request.create({ entity, jsonData });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'recordPayment',
          payload: data.result,
        });
        dispatch({
          type: actionTypes.CURRENT_ITEM,
          payload: (data.result as any).invoice,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'recordPayment',
          payload: null,
        });
      }
    },
  read:
    ({ entity, id }: { entity: string; id: string }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'read',
        payload: null,
      });

      let data = await request.read({ entity, id });

      if (data.success === true) {
        dispatch({
          type: actionTypes.CURRENT_ITEM,
          payload: data.result,
        });
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'read',
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'read',
          payload: null,
        });
      }
    },
  update:
    ({ entity, id, jsonData }: { entity: string; id: string; jsonData: Record<string, unknown> }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'update',
        payload: null,
      });

      let data = await request.update({ entity, id, jsonData });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'update',
          payload: data.result,
        });
        dispatch({
          type: actionTypes.CURRENT_ITEM,
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'update',
          payload: null,
        });
      }
    },

  delete:
    ({ entity, id }: { entity: string; id: string }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.RESET_ACTION,
        keyState: 'delete',
      });
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'delete',
        payload: null,
      });

      let data = await request.delete({ entity, id });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'delete',
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'delete',
          payload: null,
        });
      }
    },

  search:
    ({ entity, options }: { entity: string; options?: RequestOptions }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'search',
        payload: null,
      });

      let data = await request.search({ entity, options });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'search',
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'search',
          payload: null,
        });
      }
    },

  summary:
    ({ entity, options }: { entity: string; options?: RequestOptions }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'summary',
        payload: null,
      });

      const data = await request.summary({ entity, options });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'summary',
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'summary',
          payload: null,
        });
      }
    },

  mail:
    ({ entity, jsonData }: { entity: string; jsonData: Record<string, unknown> }) =>
    async (dispatch: Dispatch<ErpAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
        keyState: 'mail',
        payload: null,
      });

      const data = await request.mail({ entity, jsonData });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          keyState: 'mail',
          payload: data.result,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
          keyState: 'mail',
          payload: null,
        });
      }
    },

  convert:
    ({ entity, id }: { entity: string; id: string }) =>
    async (): Promise<void> => {
      await request.convert({ entity, id });
    },
};
