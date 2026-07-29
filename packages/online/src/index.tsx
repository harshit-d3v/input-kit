import { useState, useEffect } from 'react';

interface NetworkInformationLike extends EventTarget {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

export interface NetworkState {
  online: boolean;
  offlineAt: Date | undefined;
  onlineAt: Date | undefined;
  downlink: number | undefined;
  effectiveType: string | undefined;
  rtt: number | undefined;
  saveData: boolean | undefined;
}

export function useOnline(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    offlineAt: typeof navigator !== 'undefined' && !navigator.onLine ? new Date() : undefined,
    onlineAt: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : undefined,
    downlink: undefined,
    effectiveType: undefined,
    rtt: undefined,
    saveData: undefined,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection =
      navigatorWithConnection.connection ||
      navigatorWithConnection.mozConnection ||
      navigatorWithConnection.webkitConnection;

    const updateNetworkInfo = () => {
      setState((prev) => ({
        ...prev,
        online: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      }));
    };

    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        online: true,
        onlineAt: new Date(),
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        online: false,
        offlineAt: new Date(),
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    updateNetworkInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return state;
}

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
