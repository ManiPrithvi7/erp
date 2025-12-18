import * as actionTypes from './types';
import { ListResult, Pagination } from '@/types';

interface KeyState {
  result: any;
  current: any;
  isLoading: boolean;
  isSuccess: boolean;
}

interface AdvancedCrudState {
  current: {
    result: any;
  };
  list: {
    result: ListResult;
    isLoading: boolean;
    isSuccess: boolean;
  };
  create: KeyState;
  update: KeyState;
  delete: KeyState;
  read: KeyState;
  createInvoice: KeyState;
  search: KeyState & { result: any[] };
  summary: KeyState;
  mail: KeyState;
}

const INITIAL_STATE: AdvancedCrudState = {
  current: {
    result: null,
  },
  list: {
    result: {
      items: [],
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: false,
        total: 1,
      } as Pagination & { showSizeChanger: boolean },
    },
    isLoading: false,
    isSuccess: false,
  },
  create: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  update: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  delete: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  read: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  createInvoice: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  search: {
    result: [],
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  summary: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
  mail: {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
  },
};

interface AdvancedCrudAction {
  type: string;
  payload?: any;
  keyState?: keyof AdvancedCrudState;
}

const advancedCrudReducer = (state: AdvancedCrudState = INITIAL_STATE, action: AdvancedCrudAction): AdvancedCrudState => {
  const { payload, keyState } = action;

  switch (action.type) {
    case actionTypes.RESET_STATE:
      return INITIAL_STATE;
    case actionTypes.CURRENT_ITEM:
      return {
        ...state,
        current: {
          result: payload,
        },
      };
    case actionTypes.REQUEST_LOADING:
      if (!keyState) return state;
      return {
        ...state,
        [keyState]: {
          ...state[keyState],
          isLoading: true,
        },
      };
    case actionTypes.REQUEST_FAILED:
      if (!keyState) return state;
      return {
        ...state,
        [keyState]: {
          ...state[keyState],
          isLoading: false,
          isSuccess: false,
        },
      };
    case actionTypes.REQUEST_SUCCESS:
      if (!keyState) return state;
      return {
        ...state,
        [keyState]: {
          ...state[keyState],
          result: payload,
          isLoading: false,
          isSuccess: true,
        },
      };
    case actionTypes.CURRENT_ACTION:
      if (!keyState) return state;
      return {
        ...state,
        [keyState]: {
          ...state[keyState],
          current: payload,
        },
      };
    case actionTypes.RESET_ACTION:
      if (!keyState) return state;
      return {
        ...state,
        [keyState]: {
          ...INITIAL_STATE[keyState],
        },
      };
    default:
      return state;
  }
};

export default advancedCrudReducer;

