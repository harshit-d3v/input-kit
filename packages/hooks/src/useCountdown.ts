import { useState, useCallback, useEffect, useRef } from 'react';

interface UseCountdownReturn {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
  stop: () => void;
}

/**
 * Countdown timer hook
 * @param initialSeconds Starting seconds
 * @returns Countdown state and controls
 * 
 * @example
 * const { seconds, start, pause, reset, isRunning } = useCountdown(60);
 * 
 * // Start countdown
 * start();
 * 
 * // seconds decreases every second until 0
 */
export function useCountdown(initialSeconds: number): UseCountdownReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (seconds <= 0) {
      setSeconds(initialSeconds);
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [seconds, initialSeconds]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [seconds]);

  const reset = useCallback((newSeconds?: number) => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [clearTimer, initialSeconds]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return clearTimer;
  }, [isRunning, isPaused, clearTimer]);

  return {
    seconds,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    stop,
  };
}
