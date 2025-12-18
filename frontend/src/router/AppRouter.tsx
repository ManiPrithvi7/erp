import { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { useAppContext } from '@/context/appContext';
import routes from './routes';
import { RouteConfig } from '@/types';

export default function AppRouter(): JSX.Element | null {
  let location = useLocation();
  const { appContextAction } = useAppContext();
  const { app } = appContextAction;

  const routesList: RouteConfig[] = [];

  Object.entries(routes).forEach(([, value]) => {
    if (Array.isArray(value)) {
      routesList.push(...value);
    }
  });

  function getAppNameByPath(path: string): string {
    for (const key in routes) {
      const routeArray = routes[key];
      if (Array.isArray(routeArray)) {
        for (let i = 0; i < routeArray.length; i++) {
          const route = routeArray[i];
          if (route && route.path === path) {
            return key;
          }
        }
      }
    }
    // Return 'default' app  if the path is not found
    return 'default';
  }
  useEffect(() => {
    if (location.pathname === '/') {
      app.default();
    } else {
      const path = getAppNameByPath(location.pathname);
      app.open(path);
    }
  }, [location, app]);

  let element = useRoutes(routesList);

  return element;
}
