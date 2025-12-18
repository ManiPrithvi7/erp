import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';
import { Form, Button } from 'antd';
import { login } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';
import { useAppDispatch } from '@/redux/hooks';

const LoginPage = (): JSX.Element => {
  const translate = useLanguage();
  const { isLoading, isLoggedIn } = useSelector(selectAuth);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const onFinish = (values: any) => {
    dispatch(login({ loginData: values }));
  };

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const FormContainer = (): JSX.Element => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
            email: 'admin@admin.com',
            password: 'admin123',
          }}
          onFinish={onFinish}
        >
          <LoginForm />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
              size="large"
              block
            >
              {translate('Log in')}
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              {translate("Don't have an account?")}{' '}
              <Link to="/signup">{translate('Sign up')}</Link>
            </div>
          </Form.Item>
        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign in" />;
};

export default LoginPage;

