import { Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import UpdateSettingForm from './UpdateSettingForm';
import { ModuleConfig } from '@/types';
import { ReactNode } from 'react';

interface UpdateSettingModuleProps {
  config: ModuleConfig;
  children: ReactNode;
  withUpload?: boolean;
  uploadSettingKey?: string | null;
}

export default function UpdateSettingModule({
  config,
  children,
  withUpload = false,
  uploadSettingKey = null,
}: UpdateSettingModuleProps): JSX.Element {
  return (
    <>
      <PageHeader
        title={config.SETTINGS_TITLE as string}
        ghost={false}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Divider></Divider>
      <UpdateSettingForm
        config={config}
        withUpload={withUpload}
        uploadSettingKey={uploadSettingKey}
      >
        {children}
      </UpdateSettingForm>
    </>
  );
}
