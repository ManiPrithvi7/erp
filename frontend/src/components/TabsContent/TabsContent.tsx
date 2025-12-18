import { Tabs, Row, Col } from 'antd';
import { ReactNode } from 'react';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps): JSX.Element => {
  return (
    <Col className="gutter-row" order={0}>
      <div className="whiteBox shadow" style={{ minHeight: '480px' }}>
        <div className="pad40">{children}</div>
      </div>
    </Col>
  );
};

interface TopCardProps {
  pageTitle?: string;
}

const TopCard = ({ pageTitle }: TopCardProps): JSX.Element => {
  return (
    <div
      className="whiteBox shadow"
      style={{
        color: '#595959',
        fontSize: 13,
        height: '70px',
        minHeight: 'auto',
        marginBottom: '24px',
      }}
    >
      <div className="pad20 strong" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#22075e', marginBottom: 0, marginTop: 0 }}>{pageTitle}</h2>
      </div>
    </div>
  );
};

interface RightMenuProps {
  children: ReactNode;
  pageTitle?: string;
}

const RightMenu = ({ children, pageTitle }: RightMenuProps): JSX.Element => {
  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 24 }}
      md={{ span: 7 }}
      lg={{ span: 6 }}
      order={1}
    >
      <TopCard pageTitle={pageTitle} />
      <div className="whiteBox shadow">
        <div className="pad25" style={{ width: '100%', paddingBottom: 0 }}>
          {children}
        </div>
      </div>
    </Col>
  );
};

interface TabContentItem {
  key?: string;
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

interface TabsContentProps {
  content: TabContentItem[];
  defaultActiveKey?: string;
  pageTitle?: string;
}

export default function TabsContent({ content, defaultActiveKey, pageTitle }: TabsContentProps): JSX.Element {
  const items = content.map((item, index) => {
    return {
      key: item.key ? item.key : index + '_' + item.label.replace(/ /g, '_'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {item.icon} <span style={{ paddingRight: 30 }}>{item.label}</span>
        </div>
      ),
      children: <SettingsLayout>{item.children}</SettingsLayout>,
    };
  });

  const renderTabBar = (props: any, DefaultTabBar: React.ComponentType<any>) => (
    <RightMenu pageTitle={pageTitle}>
      <DefaultTabBar {...props} />
    </RightMenu>
  );

  return (
    <Row gutter={[24, 24]} className="tabContent">
      <Tabs
        tabPosition="right"
        defaultActiveKey={defaultActiveKey}
        hideAdd={true}
        items={items}
        renderTabBar={renderTabBar}
      />
    </Row>
  );
}

