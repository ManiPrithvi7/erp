import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';
import { useAppContext } from '@/context/appContext';
import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.svg';
import logoText from '@/style/images/logo-text.svg';
import useResponsive from '@/hooks/useResponsive';
import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  MenuOutlined,
  ShopOutlined,
  WalletOutlined,
  ReconciliationOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation(): JSX.Element {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

interface SidebarProps {
  collapsible?: boolean;
  isMobile?: boolean;
}

function Sidebar({ collapsible, isMobile = false }: SidebarProps): JSX.Element {
  const location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const translate = useLanguage();
  const navigate = useNavigate();

  // Calculate currentPath from location.pathname
  const currentPath = useMemo(() => {
    const path = location.pathname.slice(1);
    return path === '' ? 'dashboard' : path;
  }, [location.pathname]);

  // Memoize items array to prevent re-creation on every render
  const items = useMemo(
    () => [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to={'/'}>{translate('dashboard')}</Link>,
      },
      {
        key: 'customer',
        icon: <CustomerServiceOutlined />,
        label: <Link to={'/customer'}>{translate('customers')}</Link>,
      },
      {
        key: 'invoice',
        icon: <ContainerOutlined />,
        label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
      },
      {
        key: 'quote',
        icon: <FileSyncOutlined />,
        label: <Link to={'/quote'}>{translate('quote')}</Link>,
      },
      {
        key: 'payment',
        icon: <CreditCardOutlined />,
        label: <Link to={'/payment'}>{translate('payments')}</Link>,
      },
      {
        key: 'paymentMode',
        label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
        icon: <WalletOutlined />,
      },
      {
        key: 'taxes',
        label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
        icon: <ShopOutlined />,
      },
      {
        key: 'generalSettings',
        label: <Link to={'/settings'}>{translate('settings')}</Link>,
        icon: <SettingOutlined />,
      },
      {
        key: 'about',
        label: <Link to={'/about'}>{translate('about')}</Link>,
        icon: <ReconciliationOutlined />,
      },
    ],
    [translate]
  );

  // Memoize showLogoApp to prevent unnecessary re-renders
  const showLogoApp = useMemo(() => {
    return isNavMenuClose;
  }, [isNavMenuClose]);

  // Removed the problematic useEffect that was causing infinite loops

  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          left: '20px',
          top: '20px',
        }),
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
        }}
      >
        <img src={logoIcon} alt="Logo" style={{ marginLeft: '-5px', height: '40px' }} />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="Logo"
            style={{
              marginTop: '3px',
              marginLeft: '10px',
              height: '38px',
            }}
          />
        )}
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          width: 256,
        }}
      />
    </Sider>
  );
}

function MobileSidebar(): JSX.Element {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}

