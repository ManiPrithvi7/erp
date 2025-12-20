import { useEffect, useState } from 'react';
import { isObject } from '@/utils/valueType';
import { NetworkConnection, NavigatorWithConnection } from '@/types';

enum NetworkEventType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHANGE = 'change',
}

interface NetworkState extends NetworkConnection {
  since?: Date;
  online: boolean;
}

function getConnection(): NetworkConnection | null {
  const nav = navigator as NavigatorWithConnection;
  if (!isObject(nav)) return null;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  return connection ? (connection as NetworkConnection) : null;
}

function getConnectionProperty(): NetworkConnection {
  const c = getConnection();
  if (!c) return {};
  return {
    rtt: c.rtt,
    type: c.type,
    saveData: c.saveData,
    downlink: c.downlink,
    downlinkMax: c.downlink,
    effectiveType: c.effectiveType,
  };
}

function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>(() => {
    return Object.assign(
      {
        since: undefined,
        online: navigator?.onLine || false,
      },
      getConnectionProperty()
    );
  });
  useEffect(() => {
    const onOnline = () => {
      setState((prevState) => Object.assign({ ...prevState }, { online: true, since: new Date() }));
    };
    const onOffline = () => {
      setState((prevState) =>
        Object.assign({ ...prevState }, { online: false, since: new Date() })
      );
    };
    const onConnectionChange = () => {
      setState((prevState) => Object.assign({ ...prevState }, getConnectionProperty()));
    };
    window.addEventListener(NetworkEventType.ONLINE, onOnline);
    window.addEventListener(NetworkEventType.OFFLINE, onOffline);
    const connection = getConnection();
    if (connection && 'addEventListener' in connection) {
      (connection as any).addEventListener(NetworkEventType.CHANGE, onConnectionChange);
    }
    return () => {
      window.removeEventListener(NetworkEventType.ONLINE, onOnline);
      window.removeEventListener(NetworkEventType.OFFLINE, onOffline);
      if (connection && 'removeEventListener' in connection) {
        (connection as any).removeEventListener(NetworkEventType.CHANGE, onConnectionChange);
      }
    };
  }, []);
  return state;
}

export default useNetwork;
