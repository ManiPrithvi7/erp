import { useMemo, useReducer, createContext, useContext, ReactNode } from 'react';
import { initialState, contextReducer, CrudContextState } from './reducer';
import contextActions from './actions';
import contextSelectors from './selectors';

type CrudContextValue = [CrudContextState, React.Dispatch<any>];

const CrudContext = createContext<CrudContextValue | undefined>(undefined);

interface CrudContextProviderProps {
  children: ReactNode;
}

function CrudContextProvider({ children }: CrudContextProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const value = useMemo<CrudContextValue>(() => [state, dispatch], [state, dispatch]);

  return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>;
}

function useCrudContext() {
  const context = useContext(CrudContext);
  if (context === undefined) {
    throw new Error('useCrudContext must be used within a CrudContextProvider');
  }
  const [state, dispatch] = context;
  const crudContextAction = contextActions(dispatch);
  const crudContextSelector = contextSelectors(state);
  return { state, crudContextAction, crudContextSelector };
}

export { CrudContextProvider, useCrudContext };

