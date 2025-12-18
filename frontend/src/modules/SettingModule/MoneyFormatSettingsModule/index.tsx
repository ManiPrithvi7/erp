import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import SettingsForm from './SettingsForm';
import useLanguage from '@/locale/useLanguage';
import { ModuleConfig } from '@/types';

interface MoneyFormatSettingsModuleProps {
  config: ModuleConfig;
}

export default function MoneyFormatSettingsModule({
  config,
}: MoneyFormatSettingsModuleProps): JSX.Element {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection
        title={translate('Default Currency')}
        description={translate('Select Default Currency')}
      >
        <SettingsForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}
