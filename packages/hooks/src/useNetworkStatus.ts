import { useState, useEffect } from 'react';

interface NetworkInformationLike extends EventTarget {
  rtt?: number;
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

interface NetworkStatus {
  online: boolean;
  since: Date | undefined;
  rtt: number | undefined;
  type: string | undefined;
  downlink: number | undefined;
  saveData: boolean | undefined;
}

/**
 * Track network connection status
 * @returns Network status object
 * 
 * @example
 * const { online, since } = useNetworkStatus();
 * 
 * return <div>{online ? 'Online' : 'Offline since ' + since}</div>;
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    since: typeof navigator !== 'undefined' && !navigator.onLine ? new Date() : undefined,
    rtt: undefined,
    type: undefined,
    downlink: undefined,
    saveData: undefined,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection =
      navigatorWithConnection.connection ??
      navigatorWithConnection.mozConnection ??
      navigatorWithConnection.webkitConnection;

    const updateNetworkInfo = () => {
      setStatus((prev) => ({
        ...prev,
        online: navigator.onLine,
        rtt: connection?.rtt,
        type: connection?.effectiveType,
        downlink: connection?.downlink,
        saveData: connection?.saveData,
      }));
    };

    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        online: true,
        since: new Date(),
        rtt: connection?.rtt,
        type: connection?.effectiveType,
        downlink: connection?.downlink,
        saveData: connection?.saveData,
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        online: false,
        since: new Date(),
        rtt: connection?.rtt,
        type: connection?.effectiveType,
        downlink: connection?.downlink,
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

  return status;
}
