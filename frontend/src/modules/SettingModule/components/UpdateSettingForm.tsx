import { useEffect } from 'react';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';
import { Button, Form } from 'antd';
import Loading from '@/components/Loading';
import useLanguage from '@/locale/useLanguage';
import { useAppDispatch } from '@/redux/hooks';
import { ModuleConfig } from '@/types';

interface UpdateSettingFormProps {
  config: ModuleConfig;
  children: ReactNode;
  withUpload?: boolean;
  uploadSettingKey?: string | null;
}

export default function UpdateSettingForm({
  config,
  children,
  withUpload = false,
  uploadSettingKey = null,
}: UpdateSettingFormProps): JSX.Element {
  const { entity, settingsCategory } = config;
  const dispatch = useAppDispatch();
  const { result, isLoading } = useSelector(selectSettings);
  const translate = useLanguage();
  const [form] = Form.useForm();

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    if (withUpload && uploadSettingKey) {
      if (fieldsValue.file && Array.isArray(fieldsValue.file) && fieldsValue.file.length > 0) {
        const fileItem = fieldsValue.file[0];
        if (fileItem && typeof fileItem === 'object' && 'originFileObj' in fileItem) {
          fieldsValue.file = (fileItem as { originFileObj?: File }).originFileObj;
        }
      }
      dispatch(
        settingsAction.upload({ entity, settingKey: uploadSettingKey, jsonData: fieldsValue })
      );
    } else {
      const settings: Array<{ settingKey: string; settingValue: unknown }> = [];

      for (const [key, value] of Object.entries(fieldsValue)) {
        settings.push({ settingKey: key, settingValue: value });
      }

      dispatch(settingsAction.updateMany({ entity, jsonData: { settings } }));
    }
  };

  useEffect(() => {
    if (settingsCategory && result && typeof settingsCategory === 'string') {
      const resultRecord = result as unknown as Record<string, unknown>;
      if (settingsCategory in resultRecord) {
        const current = resultRecord[settingsCategory];
        if (current && typeof current === 'object' && current !== null) {
          form.setFieldsValue(current as Record<string, unknown>);
        }
      }
    }
  }, [result, settingsCategory, form]);

  return (
    <div>
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          onFinish={onSubmit}
          labelCol={{ span: 10 }}
          labelAlign="left"
          wrapperCol={{ span: 16 }}
        >
          {children}
          <Form.Item
            style={{
              display: 'inline-block',
              paddingRight: '5px',
            }}
          >
            <Button type="primary" htmlType="submit">
              {translate('Save')}
            </Button>
          </Form.Item>
          <Form.Item
            style={{
              display: 'inline-block',
              paddingLeft: '5px',
            }}
          >
            {/* <Button onClick={() => console.log('Cancel clicked')}>{translate('Cancel')}</Button> */}
          </Form.Item>
        </Form>
      </Loading>
    </div>
  );
}
