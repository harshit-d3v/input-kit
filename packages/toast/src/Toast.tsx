import { useCallback, useRef, useState } from 'react';
import type { ToastItemProps, ToastType } from './types.js';

// SVG Icon Components (Lucide-style)
const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertTriangleIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Default icons using SVG components
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckIcon size={12} />,
  error: <XIcon size={12} />,
  warning: <AlertTriangleIcon size={12} />,
  info: <InfoIcon size={12} />,
};

// Default type colors for styling hooks
const TYPE_COLORS: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

/**
 * Toast component
 * Individual toast notification with progress bar and swipe support
 */
export const Toast: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  onPause,
  onResume,
  className,
  style,
}) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const handleMouseEnter = useCallback(() => {
    if (toast.duration > 0 && !toast.isPaused) {
      onPause(toast.id);
    }
  }, [onPause, toast.id, toast.duration, toast.isPaused]);

  const handleMouseLeave = useCallback(() => {
    if (toast.isPaused) {
      onResume(toast.id);
    }
  }, [onResume, toast.id, toast.isPaused]);

  // Touch handlers for swipe to dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      setSwipeOffset(deltaX);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    
    // Dismiss if swiped far enough
    if (Math.abs(swipeOffset) > 100) {
      handleDismiss();
    } else {
      setSwipeOffset(0);
    }
  }, [swipeOffset, handleDismiss]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  }, [handleDismiss]);

  // Animation classes
  const animationClass = toast.isExiting ? 'toast--exiting' : 'toast--entering';

  // Calculate opacity based on swipe
  const swipeOpacity = Math.max(0, 1 - Math.abs(swipeOffset) / 200);
  const isAssertive = toast.type === 'error' || toast.type === 'warning';

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`toast toast--${toast.type} ${animationClass} ${className || ''}`}
      data-toast-id={toast.id}
      data-toast-type={toast.type}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '400px',
        transform: `translateX(${swipeOffset}px)`,
        opacity: swipeOpacity,
        transition: isSwiping ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        cursor: 'grab',
        outline: 'none',
        ...style,
      }}
    >
      {/* Icon */}
      <span
        className="toast__icon"
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: TYPE_COLORS[toast.type],
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {ICONS[toast.type]}
      </span>

      {/* Content */}
      <div
        className="toast__content"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {toast.title && (
          <div
            className="toast__title"
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: '#1f2937',
              marginBottom: '4px',
            }}
          >
            {toast.title}
          </div>
        )}
        <div
          className="toast__message"
          style={{
            fontSize: '14px',
            color: '#4b5563',
            lineHeight: 1.5,
          }}
        >
          {toast.message}
        </div>

        {/* Action button */}
        {toast.action && (
          <button
            className={`toast__action toast__action--${toast.action.variant || 'primary'}`}
            onClick={toast.action.onClick}
            style={{
              marginTop: '12px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor:
                toast.action.variant === 'danger'
                  ? '#ef4444'
                  : toast.action.variant === 'secondary'
                  ? '#e5e7eb'
                  : TYPE_COLORS[toast.type],
              color:
                toast.action.variant === 'secondary' ? '#374151' : '#ffffff',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        className="toast__close"
        onClick={handleDismiss}
        aria-label="Close notification"
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          transition: 'background-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#4b5563';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && !toast.isPaused && (
        <div
          className="toast__progress"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
          }}
        >
          <div
            className="toast__progress-bar"
            style={{
              height: '100%',
              width: `${toast.progress}%`,
              backgroundColor: TYPE_COLORS[toast.type],
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      )}
    </div>
  );
};
