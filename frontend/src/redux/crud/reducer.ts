import * as actionTypes from './types';
import { ListResult, Pagination } from '@/types';

interface KeyState {
  result: any;
  current: any;
  isLoading: boolean;
  isSuccess: boolean;
}

interface CrudState {
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
  search: KeyState & { result: any[] };
}

const INITIAL_KEY_STATE: KeyState = {
  result: null,
  current: null,
  isLoading: false,
  isSuccess: false,
};

const INITIAL_STATE: CrudState = {
  current: {
    result: null,
  },
  list: {
    result: {
      items: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 1,
        showSizeChanger: false,
      } as Pagination & { showSizeChanger: boolean },
    },
    isLoading: false,
    isSuccess: false,
  },
  create: INITIAL_KEY_STATE,
  update: INITIAL_KEY_STATE,
  delete: INITIAL_KEY_STATE,
  read: INITIAL_KEY_STATE,
  search: { ...INITIAL_KEY_STATE, result: [] },
};

interface CrudAction {
  type: string;
  payload?: any;
  keyState?: keyof CrudState;
}

const crudReducer = (state: CrudState = INITIAL_STATE, action: CrudAction): CrudState => {
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
          ...INITIAL_KEY_STATE,
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

export default crudReducer;

