import { ErpContextState } from './reducer';

const contextSelectors = (state: ErpContextState) => {
  return {
    isModalOpen: () => {
      return state.deleteModal.isOpen;
    },
    isPanelOpen: () => {
      return state.read.isOpen || state.update.isOpen || state.create.isOpen || state.recordPayment.isOpen;
    },
    isBoxOpen: () => {
      return state.dataTableList.isOpen;
    },
  };
};

export default contextSelectors;

