import * as actionTypes from './types';

interface PanelState {
  isOpen: boolean;
}

export interface ProfileContextState {
  read: PanelState;
  update: PanelState;
  passwordModal: PanelState;
}

export const initialState: ProfileContextState = {
  read: {
    isOpen: true,
  },
  update: {
    isOpen: false,
  },
  passwordModal: {
    isOpen: false,
  },
};

interface ProfileAction {
  type: string;
  keyState?: keyof ProfileContextState;
}

export function contextReducer(state: ProfileContextState, action: ProfileAction): ProfileContextState {
  const { keyState = null } = action;
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      return {
        ...state,
        passwordModal: { isOpen: true },
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        passwordModal: { isOpen: false },
      };
    case actionTypes.OPEN_PANEL:
      if (!keyState) return state;
      return {
        ...initialState,
        read: {
          isOpen: false,
        },
        [keyState]: { isOpen: true },
      } as ProfileContextState;
    case actionTypes.CLOSE_PANEL:
      return {
        ...initialState,
      };

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

