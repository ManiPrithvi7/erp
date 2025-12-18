import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import AppSettingForm from './forms/AppSettingForm';
import useLanguage from '@/locale/useLanguage';
import { ModuleConfig } from '@/types';

interface CompanyLogoSettingsModuleProps {
  config: ModuleConfig;
}

export default function CompanyLogoSettingsModule({
  config,
}: CompanyLogoSettingsModuleProps): JSX.Element {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config} uploadSettingKey="company_logo" withUpload>
      <SetingsSection title={translate('Company Logo')} description={translate('Update Company logo')}>
        <AppSettingForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}
