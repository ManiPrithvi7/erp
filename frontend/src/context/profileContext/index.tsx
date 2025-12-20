import { useMemo, useReducer, createContext, useContext, ReactNode } from 'react';
import { initialState, contextReducer, ProfileContextState } from './reducer';
import contextActions from './actions';
import contextSelectors from './selectors';

type ProfileContextValue = [ProfileContextState, React.Dispatch<any>];

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileContextProviderProps {
  children: ReactNode;
}

function ProfileContextProvider({ children }: ProfileContextProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const value = useMemo<ProfileContextValue>(() => [state, dispatch], [state, dispatch]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileContextProvider');
  }
  const [state, dispatch] = context;
  const profileContextAction = contextActions(dispatch);
  const profileContextSelector = contextSelectors(state);
  return { state, profileContextAction, profileContextSelector };
}

export { ProfileContextProvider, useProfileContext };

