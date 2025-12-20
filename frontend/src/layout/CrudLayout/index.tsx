import { useEffect, useState, ReactNode } from 'react';
import DefaultLayout from '../DefaultLayout';
import SidePanel from '@/components/SidePanel';
import { Layout } from 'antd';
import { useCrudContext } from '@/context/crud';

const { Content } = Layout;

interface ContentBoxProps {
  children: ReactNode;
}

const ContentBox = ({ children }: ContentBoxProps): JSX.Element => {
  const { state: stateCrud } = useCrudContext();
  const { isPanelClose } = stateCrud;

  const [, setSidePanel] = useState(isPanelClose);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPanelClose) {
      timer = setTimeout(() => {
        setSidePanel(isPanelClose);
      }, 200);
    } else {
      setSidePanel(isPanelClose);
    }

    return () => clearTimeout(timer);
  }, [isPanelClose]);

  // useEffect(() => {
  //   if (!isNavMenuClose) {
  //     panel.close();
  //   }
  // }, [isNavMenuClose]);
  return (
    <Content
      className="whiteBox shadow layoutPadding"
      style={{
        margin: '30px auto',
        width: '100%',
        maxWidth: '100%',
        flex: 'none',
      }}
    >
      {children}
    </Content>
  );
};

import { ModuleConfig } from '@/types';

interface CrudLayoutProps {
  children: ReactNode;
  config?: ModuleConfig;
  sidePanelTopContent?: ReactNode;
  sidePanelBottomContent?: ReactNode;
  fixHeaderPanel?: ReactNode;
}

export default function CrudLayout({
  children,
  config,
  sidePanelTopContent,
  sidePanelBottomContent,
  fixHeaderPanel,
}: CrudLayoutProps): JSX.Element {
  return (
    <>
      <DefaultLayout>
        <SidePanel
          config={config || { entity: '' }}
          topContent={sidePanelTopContent}
          bottomContent={sidePanelBottomContent}
          fixHeaderPanel={fixHeaderPanel}
        ></SidePanel>

        <ContentBox> {children}</ContentBox>
      </DefaultLayout>
    </>
  );
}

