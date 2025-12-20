import { createSelector } from 'reselect';
import { RootState } from '@/redux/store';
import { AuthState, User } from '@/types';

export const selectAuth = (state: RootState): AuthState => state.auth;
export const selectCurrentAdmin = createSelector([selectAuth], (auth): User | Record<string, never> => auth.current as User | Record<string, never>);

export const isLoggedIn = createSelector([selectAuth], (auth) => auth.isLoggedIn);

