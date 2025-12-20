import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import GeneralSettingForm from './forms/GeneralSettingForm';
import useLanguage from '@/locale/useLanguage';
import { ModuleConfig } from '@/types';

interface GeneralSettingsModuleProps {
  config: ModuleConfig;
}

export default function GeneralSettingsModule({
  config,
}: GeneralSettingsModuleProps): JSX.Element {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection
        title={translate('App Settings')}
        description={translate('Update your app configuration')}
      >
        <GeneralSettingForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}
