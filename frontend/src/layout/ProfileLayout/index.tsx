import { ProfileContextProvider } from '@/context/profileContext';
import { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps): JSX.Element => {
  return <ProfileContextProvider>{children}</ProfileContextProvider>;
};

export default ProfileLayout;

