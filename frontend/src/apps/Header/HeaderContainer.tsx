import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Layout, MenuProps } from 'antd';
import { LogoutOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { User } from '@/types';
import { FILE_BASE_URL } from '@/config/serverApiConfig';
import useLanguage from '@/locale/useLanguage';
import UpgradeButton from './UpgradeButton';

export default function HeaderContent(): JSX.Element {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const { Header } = Layout;
  const admin = currentAdmin as User | null;

  const translate = useLanguage();

  const ProfileDropdown = (): JSX.Element => {
    const navigate = useNavigate();
    const admin = currentAdmin as User | null;
    return (
      <div className="profileDropdown" onClick={() => navigate('/profile')}>
        <Avatar
          size="large"
          className="last"
          src={admin?.photo ? FILE_BASE_URL + admin.photo : undefined}
          style={{
            color: '#f56a00',
            backgroundColor: admin?.photo ? 'none' : '#fde3cf',
            boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 6px 1px',
          }}
        >
          {admin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div className="profileDropdownInfo">
          <p>
            {admin?.name} {admin?.surname}
          </p>
          <p>{admin?.email}</p>
        </div>
      </div>
    );
  };

  const DropdownMenu = ({ text }: { text: string }): JSX.Element => {
    return <span style={{}}>{text}</span>;
  };

  const items: MenuProps['items'] = [
    {
      label: <ProfileDropdown />,
      key: 'ProfileDropdown',
    },
    {
      type: 'divider',
    },
    {
      icon: <UserOutlined />,
      key: 'settingProfile',
      label: (
        <Link to={'/profile'}>
          <DropdownMenu text={translate('profile_settings')} />
        </Link>
      ),
    },
    {
      icon: <ToolOutlined />,
      key: 'settingApp',
      label: <Link to={'/settings'}>{translate('app_settings')}</Link>,
    },
    {
      type: 'divider',
    },
    {
      icon: <LogoutOutlined />,
      key: 'logout',
      label: <Link to={'/logout'}>{translate('logout')}</Link>,
    },
  ];

  return (
    <Header
      style={{
        padding: '20px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'flex-start',
        gap: ' 15px',
      }}
    >
      <Dropdown
        menu={{
          items: items || [],
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Avatar
          className="last"
          src={admin?.photo && FILE_BASE_URL ? FILE_BASE_URL + admin.photo : undefined}
          style={{
            color: '#f56a00',
            backgroundColor: admin?.photo ? 'none' : '#fde3cf',
            boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
            float: 'right',
            cursor: 'pointer',
          }}
          size="large"
        >
          {admin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      </Dropdown>

      <UpgradeButton />
    </Header>
  );
}

