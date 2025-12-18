import * as actionTypes from './types';

interface SettingsState {
  crm_settings: Record<string, any>;
  finance_settings: Record<string, any>;
  company_settings: Record<string, any>;
  app_settings: Record<string, any>;
  money_format_settings: Record<string, any>;
}

interface SettingsReducerState {
  result: SettingsState;
  isLoading: boolean;
  isSuccess: boolean;
}

const INITIAL_SETTINGS_STATE: SettingsState = {
  crm_settings: {},
  finance_settings: {},
  company_settings: {},
  app_settings: {},
  money_format_settings: {},
};

const INITIAL_STATE: SettingsReducerState = {
  result: INITIAL_SETTINGS_STATE,
  isLoading: false,
  isSuccess: false,
};

interface SettingsAction {
  type: string;
  payload?: any;
}

const settingsReducer = (state: SettingsReducerState = INITIAL_STATE, action: SettingsAction): SettingsReducerState => {
  const { payload = null } = action;
  switch (action.type) {
    case actionTypes.RESET_STATE:
      return INITIAL_STATE;
    case actionTypes.REQUEST_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case actionTypes.REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
      };

    case actionTypes.UPDATE_CURRENCY:
      return {
        result: {
          ...state.result,
          money_format_settings: payload,
        },
        isLoading: false,
        isSuccess: true,
      };

    case actionTypes.REQUEST_SUCCESS:
      return {
        result: payload || INITIAL_SETTINGS_STATE,
        isLoading: false,
        isSuccess: true,
      };
    default:
      return state;
  }
};

export default settingsReducer;

