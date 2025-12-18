import { Dispatch } from 'redux';
import * as actionTypes from './types';
import { request } from '@/request';

interface SettingsAction {
  type: string;
  payload?: any;
}

interface SettingData {
  settingCategory: string;
  settingKey: string;
  settingValue: any;
}

const dispatchSettingsData = (datas: SettingData[]): Record<string, Record<string, any>> => {
  const settingsCategory: Record<string, Record<string, any>> = {};

  datas.forEach((data) => {
    if (data.settingCategory && typeof data.settingCategory === 'string') {
      if (!settingsCategory[data.settingCategory]) {
        settingsCategory[data.settingCategory] = {};
      }
      const category = settingsCategory[data.settingCategory];
      if (data.settingKey && category) {
        category[data.settingKey] = data.settingValue;
      }
    }
  });

  return settingsCategory;
};

export const settingsAction = {
  resetState:
    () =>
    (dispatch: Dispatch<SettingsAction>): void => {
      dispatch({
        type: actionTypes.RESET_STATE,
      });
    },
  updateCurrency:
    ({ data }: { data: any }) =>
    async (dispatch: Dispatch<SettingsAction>): Promise<void> => {
      dispatch({
        type: actionTypes.UPDATE_CURRENCY,
        payload: data,
      });
    },
  update:
    ({ entity, settingKey, jsonData }: { entity: string; settingKey: string; jsonData: any }) =>
    async (dispatch: Dispatch<SettingsAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateBySettingKey/' + settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let listData = await request.listAll({ entity });

        if (listData.success === true) {
          const payload = dispatchSettingsData(listData.result as SettingData[]);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(listData.result as SettingData[]))
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  updateMany:
    ({ entity, jsonData }: { entity: string; jsonData: any }) =>
    async (dispatch: Dispatch<SettingsAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateManySetting',
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let listData = await request.listAll({ entity });

        if (listData.success === true) {
          const payload = dispatchSettingsData(listData.result as SettingData[]);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(listData.result as SettingData[]))
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  list:
    ({ entity }: { entity: string }) =>
    async (dispatch: Dispatch<SettingsAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.listAll({ entity });

      if (data.success === true) {
        const payload = dispatchSettingsData(data.result as SettingData[]);
        window.localStorage.setItem(
          'settings',
          JSON.stringify(dispatchSettingsData(data.result as SettingData[]))
        );

        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  upload:
    ({ entity, settingKey, jsonData }: { entity: string; settingKey: string; jsonData: any }) =>
    async (dispatch: Dispatch<SettingsAction>): Promise<void> => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.upload({
        entity: entity,
        id: settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let listData = await request.listAll({ entity });

        if (listData.success === true) {
          const payload = dispatchSettingsData(listData.result as SettingData[]);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(listData.result as SettingData[]))
          );
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
};
