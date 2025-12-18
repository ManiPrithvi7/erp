import { useMemo, useReducer, createContext, useContext, ReactNode } from 'react';
import { initialState, contextReducer, AdvancedCrudContextState } from './reducer';
import contextActions from './actions';
import contextSelectors from './selectors';

type AdvancedCrudContextValue = [AdvancedCrudContextState, React.Dispatch<any>];

const AdavancedCrudContext = createContext<AdvancedCrudContextValue | undefined>(undefined);

interface AdavancedCrudContextProviderProps {
  children: ReactNode;
}

function AdavancedCrudContextProvider({ children }: AdavancedCrudContextProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const value = useMemo<AdvancedCrudContextValue>(() => [state, dispatch], [state, dispatch]);

  return <AdavancedCrudContext.Provider value={value}>{children}</AdavancedCrudContext.Provider>;
}

function useAdavancedCrudContext() {
  const context = useContext(AdavancedCrudContext);
  if (context === undefined) {
    throw new Error('useAdavancedCrudContext must be used within a AdavancedCrudContextProvider');
  }
  const [state, dispatch] = context;
  const adavancedCrudContextAction = contextActions(dispatch);
  const adavancedCrudContextSelector = contextSelectors(state);
  return { state, adavancedCrudContextAction, adavancedCrudContextSelector };
}

export { AdavancedCrudContextProvider, useAdavancedCrudContext };

