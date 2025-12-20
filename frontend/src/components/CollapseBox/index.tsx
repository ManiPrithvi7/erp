import { ReactNode } from 'react';
import { Row, Col } from 'antd';

interface CollapseBoxButtonProps {
  onChange: () => void;
  title: string;
}

const CollapseBoxButton = ({ onChange, title }: CollapseBoxButtonProps): JSX.Element => {
  return (
    <div className="collapseBoxHeader" onClick={onChange}>
      {title}
    </div>
  );
};

interface TopCollapseBoxProps {
  isOpen: boolean;
  children?: ReactNode;
}

const TopCollapseBox = ({ isOpen, children }: TopCollapseBoxProps): JSX.Element => {
  const show = isOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  return (
    <div className="TopCollapseBox">
      <div style={show}>
        <Row>
          <Col span={24}> {children}</Col>
        </Row>
      </div>
    </div>
  );
};

interface BottomCollapseBoxProps {
  isOpen: boolean;
  children?: ReactNode;
}

const BottomCollapseBox = ({ isOpen, children }: BottomCollapseBoxProps): JSX.Element => {
  const show = isOpen ? { display: 'none', opacity: 0 } : { display: 'block', opacity: 1 };
  return (
    <div className="BottomCollapseBox">
      <div style={show}>
        <Row>
          <Col span={24}> {children}</Col>
        </Row>
      </div>
    </div>
  );
};

interface CollapseBoxProps {
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  buttonTitle?: string;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export default function CollapseBox({
  topContent,
  bottomContent,
  buttonTitle,
  isCollapsed,
  onCollapse,
}: CollapseBoxProps): JSX.Element {
  const collapsed = isCollapsed ? 'collapsed' : '';
  return (
    <>
      <TopCollapseBox isOpen={isCollapsed || false}>{topContent}</TopCollapseBox>
      <div className={'collapseBox ' + collapsed}>
        <CollapseBoxButton title={buttonTitle || ''} onChange={onCollapse || (() => {})} />
        <div className="whiteBg"></div>
        <BottomCollapseBox isOpen={isCollapsed || false}>{bottomContent}</BottomCollapseBox>
      </div>
    </>
  );
}
