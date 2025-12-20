import { Dispatch } from 'react';
import * as actionTypes from './types';

interface CrudAction {
  type: string;
}

interface ContextActions {
  modal: {
    open: () => void;
    close: () => void;
  };
  advancedBox: {
    open: () => void;
    close: () => void;
  };
  editBox: {
    open: () => void;
    close: () => void;
  };
  panel: {
    open: () => void;
    close: () => void;
    collapse: () => void;
  };
  collapsedBox: {
    open: () => void;
    close: () => void;
    collapse: () => void;
  };
  readBox: {
    open: () => void;
    close: () => void;
    collapse: () => void;
  };
}

const contextActions = (dispatch: Dispatch<CrudAction>): ContextActions => {
  return {
    modal: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_MODAL });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_MODAL });
      },
    },
    advancedBox: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_ADVANCED_BOX });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_ADVANCED_BOX });
      },
    },
    editBox: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_EDIT_BOX });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_EDIT_BOX });
      },
    },
    panel: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_PANEL });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_PANEL });
      },
      collapse: () => {
        dispatch({ type: actionTypes.COLLAPSE_PANEL });
      },
    },
    collapsedBox: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_BOX });
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_BOX });
      },
      collapse: () => {
        dispatch({ type: actionTypes.COLLAPSE_BOX });
      },
    },
    readBox: {
      open: () => {
        dispatch({ type: actionTypes.OPEN_READ_BOX });
        console.log('readBox open');
      },
      close: () => {
        dispatch({ type: actionTypes.CLOSE_READ_BOX });
        console.log('readBox close');
      },
      collapse: () => {
        dispatch({ type: actionTypes.COLLAPSE_READ_BOX });
      },
    },
  };
};

export default contextActions;

