import { useProfileContext } from '@/context/profileContext';
import { generate as uniqueId } from 'shortid';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfileAdminForm from './ProfileAdminForm';
import { updateProfile } from '@/redux/auth/actions';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import useLanguage from '@/locale/useLanguage';
import { useAppDispatch } from '@/redux/hooks';
import { ModuleConfig, User } from '@/types';

interface UpdateAdminProps {
  config: ModuleConfig;
}

const UpdateAdmin = ({ config }: UpdateAdminProps): JSX.Element => {
  const translate = useLanguage();
  const { profileContextAction } = useProfileContext();
  const { updatePanel } = profileContextAction;
  const dispatch = useAppDispatch();
  const { ENTITY_NAME } = config;
  const currentAdmin = useSelector(selectCurrentAdmin) as User | null;
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentAdmin) {
      form.setFieldsValue(currentAdmin);
    }
  }, [currentAdmin, form]);

  const handleSubmit = (): void => {
    form.submit();
  };

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    if (fieldsValue.file && Array.isArray(fieldsValue.file) && fieldsValue.file.length > 0) {
      const fileItem = fieldsValue.file[0];
      if (fileItem && typeof fileItem === 'object' && 'originFileObj' in fileItem) {
        fieldsValue.file = (fileItem as { originFileObj?: File }).originFileObj;
      }
    }

    dispatch(updateProfile({ entity: 'admin/profile', jsonData: fieldsValue }));
  };

  return (
    <div>
      <PageHeader
        onBack={() => updatePanel.close()}
        title={ENTITY_NAME}
        ghost={false}
        extra={[
          <Button
            onClick={() => updatePanel.close()}
            key={`${uniqueId()}`}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              handleSubmit();
              updatePanel.close();
            }}
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
          >
            {translate('Save')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Row align="top">
        <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 4 }}></Col>
        <Col xs={{ span: 16 }}>
          <Form
            form={form}
            onFinish={onSubmit}
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 10 }}
          >
            <ProfileAdminForm isUpdateForm={true} />
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default UpdateAdmin;
