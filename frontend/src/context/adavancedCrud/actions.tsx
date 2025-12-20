import { Dispatch } from 'react';
import * as actionTypes from './types';
import { AdvancedCrudContextState } from './reducer';

interface AdvancedCrudAction {
  type: string;
  keyState?: keyof AdvancedCrudContextState;
}

interface ContextActions {
  modal: {
    open: () => void;
    close: () => void;
  };
  readPanel: {
    open: () => void;
    close: () => void;
  };
  updatePanel: {
    open: () => void;
    close: () => void;
  };
  createPanel: {
    open: () => void;
    close: () => void;
  };
  recordPanel: {
    open: () => void;
    close: () => void;
  };
}

const contextActions = (dispatch: Dispatch<AdvancedCrudAction>): ContextActions => {
  return {
    modal: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_MODAL });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_MODAL });
      },
    },
    readPanel: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_PANEL, keyState: 'read' });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_PANEL });
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
    createPanel: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_PANEL, keyState: 'create' });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_PANEL });
      },
    },
    recordPanel: {
      open: () => {
        dispatch({
          type: actionTypes.OPEN_PANEL,
          keyState: 'recordPayment',
        });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_PANEL });
      },
    },
  };
};

export default contextActions;

