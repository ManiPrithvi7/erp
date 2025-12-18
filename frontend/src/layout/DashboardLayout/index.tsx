import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  return (
    <div
      style={{
        marginLeft: 140,
      }}
    >
      {children}
    </div>
  );
}

