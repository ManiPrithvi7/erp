import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '@/redux/auth/actions';
import { crud } from '@/redux/crud/actions';
import { erp } from '@/redux/erp/actions';
import PageLoader from '@/components/PageLoader';
import { useAppDispatch } from '@/redux/hooks';

const Logout = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  function asyncLogout() {
    dispatch(logoutAction());
  }

  useLayoutEffect(() => {
    dispatch(crud.resetState({}));
    dispatch(erp.resetState());
  }, [dispatch]);

  useEffect(() => {
    asyncLogout();
    navigate('/login');
  }, [navigate]);

  return <PageLoader />;
};
export default Logout;

