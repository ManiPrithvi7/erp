import {
  DesktopOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';

interface IconMenuProps {
  name?: string;
}

export const IconMenu = ({ name }: IconMenuProps): JSX.Element => {
  const elements: Record<string, React.ComponentType> = {
    DesktopOutlined: DesktopOutlined,
    SettingOutlined: SettingOutlined,
    CustomerServiceOutlined: CustomerServiceOutlined,
    FileTextOutlined: FileTextOutlined,
    FileSyncOutlined: FileSyncOutlined,
    DashboardOutlined: DashboardOutlined,
    TeamOutlined: TeamOutlined,
    UserOutlined: UserOutlined,
    CreditCardOutlined: CreditCardOutlined,
    BankOutlined: BankOutlined,
    Default: DesktopOutlined,
  };

  const IconTag = elements[name || 'Default'] || SettingOutlined;
  return <IconTag />;
};
