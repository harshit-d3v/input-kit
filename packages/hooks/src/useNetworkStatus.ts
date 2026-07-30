import { useCallback, useEffect, useState } from 'react';

interface NetworkInformationLike extends EventTarget {
  rtt?: number;
  /** Measured connection quality: `'slow-2g'`, `'2g'`, `'3g'`, `'4g'`. */
  effectiveType?: string;
  /** Physical connection type: `'wifi'`, `'cellular'`, `'ethernet'`, … */
  type?: string;
  downlink?: number;
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

export interface NetworkStatus {
  /** Whether the browser believes it is online. */
  online: boolean;
  /** When `online` last changed. Undefined if it has not changed since mount. */
  since: Date | undefined;
  /** Estimated round-trip time in ms. */
  rtt: number | undefined;
  /** Measured connection quality: `'slow-2g'`, `'2g'`, `'3g'`, `'4g'`. */
  effectiveType: string | undefined;
  /** Physical connection type: `'wifi'`, `'cellular'`, `'ethernet'`, … */
  type: string | undefined;
  /** Estimated downlink speed in Mbps. */
  downlink: number | undefined;
  /** Whether the user has asked for reduced data usage. */
  saveData: boolean | undefined;
}

function getConnection(): NetworkInformationLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function readConnection(): Omit<NetworkStatus, 'online' | 'since'> {
  const connection = getConnection();
  return {
    rtt: connection?.rtt,
    effectiveType: connection?.effectiveType,
    type: connection?.type,
    downlink: connection?.downlink,
    saveData: connection?.saveData,
  };
}

/**
 * Track connectivity and, where the browser exposes it, connection quality.
 *
 * @returns `{ online, since, rtt, effectiveType, type, downlink, saveData }`
 *
 * @example
 * const { online, effectiveType, saveData } = useNetworkStatus();
 * if (!online) return <Offline />;
 * if (saveData || effectiveType === '2g') return <LightweightView />;
 *
 * @remarks
 * `type` and `effectiveType` are different things, and both are reported. `type` is
 * the physical link (`'wifi'`, `'cellular'`); `effectiveType` is measured throughput
 * expressed as a generation (`'4g'`, `'3g'`). A good phone on cellular can be
 * `type: 'cellular'` with `effectiveType: '4g'`, and bad hotel wifi can be
 * `type: 'wifi'` with `effectiveType: '2g'` — so decisions about how much to load
 * belong on `effectiveType`, not `type`.
 *
 * Everything but `online` is undefined outside Chromium, where the Network
 * Information API is unimplemented.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    since: undefined,
    ...readConnection(),
  }));

  const sync = useCallback((online?: boolean) => {
    setStatus((prev) => {
      const nextOnline = online ?? (typeof navigator === 'undefined' ? true : navigator.onLine);
      return {
        ...prev,
        online: nextOnline,
        // Only stamp a time when the state actually flipped, so `since` means
        // "since it changed" rather than "since the last connection event".
        since: nextOnline === prev.online ? prev.since : new Date(),
        ...readConnection(),
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = () => sync(true);
    const onOffline = () => sync(false);
    const onChange = () => sync();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const connection = getConnection();
    connection?.addEventListener('change', onChange);

    // Pick up anything that changed between the initial state and this effect.
    sync();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      connection?.removeEventListener('change', onChange);
    };
  }, [sync]);

  return status;
}
