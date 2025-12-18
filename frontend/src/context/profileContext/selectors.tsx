import { ProfileContextState } from './reducer';

const contextSelectors = (state: ProfileContextState) => {
  return {
    isModalOpen: () => {
      return state.passwordModal.isOpen;
    },
    isPanelOpen: () => {
      return state.update.isOpen;
    },
  };
};

export default contextSelectors;

