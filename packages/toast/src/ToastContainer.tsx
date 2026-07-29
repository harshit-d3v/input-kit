import { useMemo, useCallback } from 'react';
import { useToastStore } from './ToastContext.js';
import { Toast } from './Toast.js';
import type { ToastPosition, ToastContainerProps } from './types.js';
import { POSITION_STYLES } from './types.js';

interface ToastContainerInternalProps extends ToastContainerProps {
  reverseOrder?: boolean;
  gutter?: number;
  containerStyle?: React.CSSProperties;
  toastStyle?: React.CSSProperties;
}

const POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/**
 * ToastContainer component
 * Renders toasts grouped by position
 */
export const ToastContainer: React.FC<ToastContainerInternalProps> = ({
  reverseOrder = false,
  gutter = 8,
  containerStyle,
  toastStyle,
}) => {
  const { toasts, dismissToast, pauseToast, resumeToast } = useToastStore();

  // Group toasts by position
  const toastsByPosition = useMemo(() => {
    const grouped: Record<ToastPosition, typeof toasts> = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': [],
    };

    toasts.forEach((toast) => {
      grouped[toast.position].push(toast);
    });

    return grouped;
  }, [toasts]);

  const handleDismiss = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast]
  );

  const handlePause = useCallback(
    (id: string) => {
      pauseToast(id);
    },
    [pauseToast]
  );

  const handleResume = useCallback(
    (id: string) => {
      resumeToast(id);
    },
    [resumeToast]
  );

  return (
    <>
      {POSITIONS.map((position) => {
        const positionToasts = toastsByPosition[position];
        if (positionToasts.length === 0) return null;

        const positionStyle = POSITION_STYLES[position];
        const isTop = position.startsWith('top');
        // isBottom is derived from !isTop
        const isCenter = position.includes('center');

        return (
          <div
            key={position}
            className={`toast-container toast-container--${position}`}
            style={{
              position: 'fixed',
              zIndex: 9999,
              display: 'flex',
              flexDirection: isTop ? 'column' : 'column-reverse',
              gap: gutter,
              padding: '16px',
              pointerEvents: 'none',
              ...positionStyle,
              ...containerStyle,
            }}
          >
            {(reverseOrder ? [...positionToasts].reverse() : positionToasts).map(
              (toast) => (
                <div
                  key={toast.id}
                  style={{
                    pointerEvents: 'auto',
                    transform: isCenter
                      ? 'translateX(-50%)'
                      : undefined,
                  }}
                >
                  <Toast
                    toast={toast}
                    onDismiss={handleDismiss}
                    onPause={handlePause}
                    onResume={handleResume}
                    style={toastStyle}
                  />
                </div>
              )
            )}
          </div>
        );
      })}
    </>
  );
};
