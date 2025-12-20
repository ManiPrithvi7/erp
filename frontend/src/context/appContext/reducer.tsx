import * as actionTypes from './types';

export interface AppState {
  isNavMenuClose: boolean;
  currentApp: string;
}

export const initialState: AppState = {
  isNavMenuClose: false,
  currentApp: 'default',
};

interface AppAction {
  type: string;
  playload?: string;
}

export function contextReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case actionTypes.OPEN_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: false,
      };
    case actionTypes.CLOSE_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: true,
      };
    case actionTypes.COLLAPSE_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: !state.isNavMenuClose,
      };
    case actionTypes.CHANGE_APP:
      return {
        ...state,
        currentApp: action.playload || 'default',
      };
    case actionTypes.DEFAULT_APP:
      return {
        ...state,
        currentApp: 'default',
      };

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

