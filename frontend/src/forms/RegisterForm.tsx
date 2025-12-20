import { Form, Input, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { countryList } from '@/utils/countryList';

interface RegisterFormProps {
  userLocation?: string;
}

export default function RegisterForm({ userLocation }: RegisterFormProps): JSX.Element {
  const translate = useLanguage();

  return (
    <>
      <Form.Item
        name="name"
        label={translate('name')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} size="large" />
      </Form.Item>
      <Form.Item
        name="email"
        label={translate('email')}
        rules={[
          {
            required: true,
          },
          {
            type: 'email',
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="site-form-item-icon" />}
          type="email"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        label={translate('password')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} size="large" />
      </Form.Item>
      <Form.Item
        label={translate('country')}
        name="country"
        rules={[
          {
            required: true,
          },
        ]}
        initialValue={userLocation}
      >
        <Select
          showSearch
          defaultOpen={false}
          optionFilterProp="children"
          filterOption={(input, option) =>
            ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) => {
            const labelA = ((optionA?.label as string) ?? '').toLowerCase();
            const labelB = ((optionB?.label as string) ?? '').toLowerCase();
            return labelA.localeCompare(labelB);
          }}
          style={{
            width: '100%',
          }}
          size="large"
        >
          {countryList.map((language) => (
            <Select.Option
              key={language.value}
              value={language.value}
              label={translate(language.label)}
            >
              {language?.icon && language?.icon + ' '}
              {translate(language.label)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}

