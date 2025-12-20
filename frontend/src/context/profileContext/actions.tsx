import { Dispatch } from 'react';
import * as actionTypes from './types';
import { ProfileContextState } from './reducer';

interface ProfileAction {
  type: string;
  keyState?: keyof ProfileContextState;
}

interface ContextActions {
  modal: {
    open: () => void;
    close: () => void;
  };
  updatePanel: {
    open: () => void;
    close: () => void;
  };
}

const contextActions = (dispatch: Dispatch<ProfileAction>): ContextActions => {
  return {
    modal: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_MODAL });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_MODAL });
      },
    },
    updatePanel: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_PANEL, keyState: 'update' });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_PANEL });
      },
    },
  };
};

export default contextActions;

