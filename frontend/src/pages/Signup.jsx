import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';

import { Form, Button } from 'antd';

import { register } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import SignupForm from '@/forms/SignupForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const SignupPage = () => {
  const translate = useLanguage();
  const { isLoading, isLoggedIn } = useSelector(selectAuth);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const onFinish = (values) => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registerData } = values;
    dispatch(register({ registerData }));
  };

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          name="normal_signup"
          className="signup-form"
          onFinish={onFinish}
        >
          <SignupForm />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="signup-form-button"
              loading={isLoading}
              size="large"
              block
            >
              {translate('Sign up')}
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              {translate('Already have an account?')}{' '}
              <Link to="/login">{translate('Log in')}</Link>
            </div>
          </Form.Item>
        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign up" isForRegistre={true} />;
};

export default SignupPage;


