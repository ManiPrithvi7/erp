import { Form, Input } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function UpdateEmail(): JSX.Element {
  const translate = useLanguage();
  return (
    <>
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
        <Input prefix={<MailOutlined className="site-form-item-icon" />} />
      </Form.Item>
    </>
  );
}

