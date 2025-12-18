import { useMemo, useReducer, createContext, useContext, ReactNode } from 'react';
import { initialState, contextReducer, ErpContextState } from './reducer';
import contextActions from './actions';
import contextSelectors from './selectors';

type ErpContextValue = [ErpContextState, React.Dispatch<any>];

const ErpContext = createContext<ErpContextValue | undefined>(undefined);

interface ErpContextProviderProps {
  children: ReactNode;
}

function ErpContextProvider({ children }: ErpContextProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const value = useMemo<ErpContextValue>(() => [state, dispatch], [state, dispatch]);

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

function useErpContext() {
  const context = useContext(ErpContext);
  if (context === undefined) {
    throw new Error('useErpContext must be used within a ErpContextProvider');
  }
  const [state, dispatch] = context;
  const erpContextAction = contextActions(dispatch);
  const erpContextSelector = contextSelectors(state);
  return { state, erpContextAction, erpContextSelector };
}

export { ErpContextProvider, useErpContext };

