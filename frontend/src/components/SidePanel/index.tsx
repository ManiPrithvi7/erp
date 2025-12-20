import { useState, useEffect, ReactNode } from 'react';
import { useCrudContext } from '@/context/crud';
import { Drawer } from 'antd';
import CollapseBox from '../CollapseBox';

import { ModuleConfig } from '@/types';

interface SidePanelProps {
  config: ModuleConfig;
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  fixHeaderPanel?: ReactNode;
}

export default function SidePanel({
  config,
  topContent,
  bottomContent,
  fixHeaderPanel,
}: SidePanelProps): JSX.Element {
  const { ADD_NEW_ENTITY } = config;
  const { state, crudContextAction } = useCrudContext();
  const { isPanelClose, isBoxCollapsed } = state;
  const { panel, collapsedBox } = crudContextAction;
  const [, setSidePanel] = useState(isPanelClose);
  const [opacitySider, setOpacitySider] = useState(0);
  const [paddingTopSider, setPaddingTopSider] = useState('20px');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPanelClose) {
      setOpacitySider(0);
      setPaddingTopSider('20px');

      timer = setTimeout(() => {
        setSidePanel(isPanelClose);
      }, 200);
    } else {
      setSidePanel(isPanelClose);
      timer = setTimeout(() => {
        setOpacitySider(1);
        setPaddingTopSider('0');
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [isPanelClose]);

  const collapsePanel = () => {
    panel.collapse();
  };

  const collapsePanelBox = () => {
    collapsedBox.collapse();
  };

  return (
    <Drawer
      title={config.PANEL_TITLE}
      placement="right"
      onClose={collapsePanel}
      open={!isPanelClose}
      width={450}
    >
      <div
        className="sidePanelContent"
        style={{
          opacity: opacitySider,
          paddingTop: paddingTopSider,
        }}
      >
        {fixHeaderPanel}
        <CollapseBox
          buttonTitle={ADD_NEW_ENTITY}
          isCollapsed={isBoxCollapsed}
          onCollapse={collapsePanelBox}
          topContent={topContent}
          bottomContent={bottomContent}
        ></CollapseBox>
      </div>
    </Drawer>
  );
}
