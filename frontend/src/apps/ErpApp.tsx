import { useLayoutEffect, useRef } from 'react';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import Navigation from '@/apps/Navigation/NavigationContainer';
import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';
import AppRouter from '@/router/AppRouter';
import useResponsive from '@/hooks/useResponsive';
import storePersist from '@/redux/storePersist';

export default function ErpCrmApp(): JSX.Element {
  const { Content } = Layout;

  // const { state: stateApp, appContextAction } = useAppContext();
  // // const { app } = appContextAction;
  // const { isNavMenuClose, currentApp } = stateApp;

  const { isMobile } = useResponsive();

  const dispatch = useAppDispatch();
  const settingsLoadAttemptedRef = useRef(false);

  useLayoutEffect(() => {
    // Only load settings once - prevent infinite loops
    // Use ref instead of state to avoid dependency issues
    if (!settingsLoadAttemptedRef.current) {
      settingsLoadAttemptedRef.current = true;
      dispatch(settingsAction.list({ entity: 'setting' })).catch((error) => {
        console.error('Failed to load settings:', error);
        // Don't retry - use cached settings if available
      });
    }
  }, [dispatch]);

  // const appSettings = useSelector(selectAppSettings);

  const { isSuccess: settingIsloaded, isLoading: settingsLoading } = useSelector(selectSettings);

  // Check if settings exist in localStorage as fallback
  const settingsFromStorage = storePersist.get('settings');

  // useEffect(() => {
  //   const { loadDefaultLang } = storePersist.get('firstVisit');
  //   if (appSettings.idurar_app_language && !loadDefaultLang) {
  //     window.localStorage.setItem('firstVisit', JSON.stringify({ loadDefaultLang: true }));
  //   }
  // }, [appSettings]);

  // Render app if:
  // 1. Settings are successfully loaded, OR
  // 2. Settings exist in localStorage (cached), OR
  // 3. Settings loading has failed (don't block the app)
  // Only show loader if settings are actively loading and we don't have cached settings
  const shouldRenderApp = settingIsloaded || settingsFromStorage || (!settingsLoading && !settingIsloaded);

  if (shouldRenderApp) {
    return (
      <Layout hasSider>
        <Navigation />

        {isMobile ? (
          <Layout style={{ marginLeft: 0 }}>
            <HeaderContent />
            <Content
              style={{
                margin: '40px auto 30px',
                overflow: 'initial',
                width: '100%',
                padding: '0 25px',
                maxWidth: 'none',
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        ) : (
          <Layout>
            <HeaderContent />
            <Content
              style={{
                margin: '40px auto 30px',
                overflow: 'initial',
                width: '100%',
                padding: '0 50px',
                maxWidth: 1400,
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        )}
      </Layout>
    );
  } else {
    // Show loader only while actively loading settings for the first time
    return <PageLoader />;
  }
}

