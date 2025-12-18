import { ReactNode } from 'react';
import { CrudContextProvider } from '@/context/crud';

interface DefaultLayoutProps {
  children: ReactNode;
}

function DefaultLayout({ children }: DefaultLayoutProps): JSX.Element {
  return <CrudContextProvider>{children}</CrudContextProvider>;
}

export default DefaultLayout;

