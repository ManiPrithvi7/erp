import * as actionTypes from './types';

interface PanelState {
  isOpen: boolean;
}

export interface AdvancedCrudContextState {
  create: PanelState;
  update: PanelState;
  read: PanelState;
  recordPayment: PanelState;
  deleteModal: PanelState;
  dataTableList: PanelState;
  last: any;
}

export const initialState: AdvancedCrudContextState = {
  create: {
    isOpen: false,
  },
  update: {
    isOpen: false,
  },
  read: {
    isOpen: false,
  },
  recordPayment: {
    isOpen: false,
  },
  deleteModal: {
    isOpen: false,
  },
  dataTableList: {
    isOpen: true,
  },
  last: null,
};

interface AdvancedCrudAction {
  type: string;
  keyState?: keyof AdvancedCrudContextState;
}

export function contextReducer(state: AdvancedCrudContextState, action: AdvancedCrudAction): AdvancedCrudContextState {
  const { keyState = null } = action;
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      return {
        ...state,
        deleteModal: { isOpen: true },
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        deleteModal: { isOpen: false },
      };
    case actionTypes.OPEN_PANEL:
      if (!keyState) return state;
      return {
        ...initialState,
        dataTableList: {
          isOpen: false,
        },
        [keyState]: { isOpen: true },
      } as AdvancedCrudContextState;
    case actionTypes.CLOSE_PANEL:
      return {
        ...initialState,
      };

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

