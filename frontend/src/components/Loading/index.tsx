import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface LoadingProps {
  isLoading: boolean;
  children?: ReactNode;
}

export default function Loading({ isLoading, children }: LoadingProps): JSX.Element {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Spin indicator={antIcon} spinning={isLoading}>
      {children}
    </Spin>
  );
}
