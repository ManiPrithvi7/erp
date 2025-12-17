import React from 'react';
import { Form, Input } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

export default function SignupForm() {
  const translate = useLanguage();
  return (
    <div>
      <Form.Item
        label={translate('first Name')}
        name="name"
        rules={[
          {
            required: true,
            message: translate('Please input your first name!'),
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder={translate('First Name')}
          size="large"
        />
      </Form.Item>
      <Form.Item
        label={translate('last Name')}
        name="surname"
        rules={[
          {
            required: false,
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder={translate('Last Name')}
          size="large"
        />
      </Form.Item>
      <Form.Item
        label={translate('email')}
        name="email"
        rules={[
          {
            required: true,
            message: translate('Please input your email!'),
          },
          {
            type: 'email',
            message: translate('Please enter a valid email!'),
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="site-form-item-icon" />}
          placeholder={translate('Email')}
          type="email"
          size="large"
        />
      </Form.Item>
      <Form.Item
        label={translate('password')}
        name="password"
        rules={[
          {
            required: true,
            message: translate('Please input your password!'),
          },
          {
            min: 6,
            message: translate('Password must be at least 6 characters!'),
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={translate('Password')}
          size="large"
        />
      </Form.Item>
      <Form.Item
        label={translate('Confirm Password')}
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          {
            required: true,
            message: translate('Please confirm your password!'),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('The two passwords do not match!')));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={translate('Confirm Password')}
          size="large"
        />
      </Form.Item>
    </div>
  );
}

