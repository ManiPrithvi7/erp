import { Dispatch } from 'react';
import * as actionTypes from './types';

interface AppAction {
  type: string;
  playload?: string;
}

interface ContextActions {
  navMenu: {
    open: () => void;
    close: () => void;
    collapse: () => void;
  };
  app: {
    open: (appName: string) => void;
    default: () => void;
  };
}

const contextActions = (dispatch: Dispatch<AppAction>): ContextActions => {
  return {
    navMenu: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_NAV_MENU });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_NAV_MENU });
      },
      collapse: () => {
        dispatch({ type: actionTypes.COLLAPSE_NAV_MENU });
      },
    },
    app: {
      open: (appName: string) => {
        dispatch({ type: actionTypes.CHANGE_APP, playload: appName });
      },
      default: () => {
        dispatch({ type: actionTypes.DEFAULT_APP });
      },
    },
  };
};

export default contextActions;

