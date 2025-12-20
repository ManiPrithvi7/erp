import { CrudContextState } from './reducer';

const contextSelectors = (state: CrudContextState) => {
  return {
    isModalOpen: () => {
      return state.isModalOpen;
    },
    isPanelOpen: () => {
      return !state.isPanelClose;
    },
    isBoxOpen: () => {
      return state.isBoxCollapsed;
    },
  };
};

export default contextSelectors;

