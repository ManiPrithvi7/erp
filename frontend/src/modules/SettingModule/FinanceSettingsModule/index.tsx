import SetingsSection from '../components/SetingsSection';
import UpdateSettingModule from '../components/UpdateSettingModule';
import MoneyFormSettingForm from './SettingsForm';
import useLanguage from '@/locale/useLanguage';
import { ModuleConfig } from '@/types';

interface FinanceSettingsModuleProps {
  config: ModuleConfig;
}

export default function MoneyFormatSettingsModule({
  config,
}: FinanceSettingsModuleProps): JSX.Element {
  const translate = useLanguage();
  return (
    <UpdateSettingModule config={config}>
      <SetingsSection
        title={translate('Finance Settings')}
        description={translate('Update Company Finance Settings')}
      >
        <MoneyFormSettingForm />
      </SetingsSection>
    </UpdateSettingModule>
  );
}
