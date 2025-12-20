import { Form, Input, Select, Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

interface AdminFormProps {
  isUpdateForm?: boolean;
  isForAdminOwner?: boolean;
}

export default function AdminForm({ isUpdateForm = false, isForAdminOwner = false }: AdminFormProps): JSX.Element {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        label={translate('first Name')}
        name="name"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label={translate('last Name')}
        name="surname"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        label={translate('email')}
        name="email"
        rules={[
          {
            required: true,
          },
          {
            type: 'email',
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>

      {!isUpdateForm && (
        <Form.Item
          label={translate('Password')}
          name="password"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      )}

      <Form.Item
        label={translate('Role')}
        name="role"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select>
          <Select.Option value="owner" disabled={!isForAdminOwner}>
            {translate('Account owner')}
          </Select.Option>
          <Select.Option value="admin" disabled={isForAdminOwner}>
            {translate('super_admin')}
          </Select.Option>
          <Select.Option value="manager" disabled={isForAdminOwner}>
            {translate('manager')}
          </Select.Option>
          <Select.Option value="employee" disabled={isForAdminOwner}>
            {translate('employee')}
          </Select.Option>
          <Select.Option value="create_only" disabled={isForAdminOwner}>
            {translate('create_only')}
          </Select.Option>
          <Select.Option value="read_only" disabled={isForAdminOwner}>
            {translate('read_only')}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('enabled')}
        name="enabled"
        valuePropName={'checked'}
        initialValue={true}
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
    </>
  );
}

