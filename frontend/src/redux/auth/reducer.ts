import { AuthState } from '@/types';
import * as actionTypes from './types';

const INITIAL_STATE: AuthState = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

interface AuthAction {
  type: string;
  payload?: any;
}

const authReducer = (state: AuthState = INITIAL_STATE, action: AuthAction): AuthState => {
  switch (action.type) {
    case actionTypes.REQUEST_LOADING:
      return {
        ...state,
        isLoggedIn: false,
        isLoading: true,
      };
    case actionTypes.REQUEST_FAILED:
      return INITIAL_STATE;

    case actionTypes.REQUEST_SUCCESS:
      return {
        current: action.payload || {},
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };

    case actionTypes.REGISTER_SUCCESS:
      return {
        current: {},
        isLoggedIn: false,
        isLoading: false,
        isSuccess: true,
      };
    case actionTypes.LOGOUT_SUCCESS:
      return INITIAL_STATE;

    case actionTypes.LOGOUT_FAILED:
      return {
        current: action.payload || {},
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };

    default:
      return state;
  }
};

export default authReducer;

