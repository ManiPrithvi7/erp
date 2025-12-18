import { ReactNode } from 'react';
import { ErpContextProvider } from '@/context/erp';
import { Layout } from 'antd';

const { Content } = Layout;

interface ErpLayoutProps {
  children: ReactNode;
}

export default function ErpLayout({ children }: ErpLayoutProps): JSX.Element {
  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin: '30px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}

