import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownReturn {
  /** Seconds remaining. */
  timeLeft: number;
  /** Whether the countdown is currently ticking. */
  isRunning: boolean;
  /** Start, or resume after a pause. Does nothing at zero. */
  start: () => void;
  /** Stop ticking, keeping the remaining time. */
  pause: () => void;
  /** Stop and return to the initial time. */
  reset: () => void;
  /** Stop and set a new time. */
  resetWith: (seconds: number) => void;
}

/** Whole, non-negative seconds — the only thing a countdown can meaningfully hold. */
function normalize(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.floor(seconds));
}

/**
 * A one-second-resolution countdown.
 *
 * @param initialSeconds where the countdown starts, clamped to >= 0. Defaults to 60.
 * @returns `{ timeLeft, isRunning, start, pause, reset, resetWith }`
 *
 * @example
 * const { timeLeft, isRunning, start, pause, reset } = useCountdown(30);
 *
 * return (
 *   <>
 *     <span>{timeLeft}s</span>
 *     <button onClick={isRunning ? pause : start}>{isRunning ? 'Pause' : 'Start'}</button>
 *     <button onClick={reset}>Reset</button>
 *   </>
 * );
 *
 * @remarks
 * `reset` takes no argument, so it can be passed straight to an event handler
 * without the event being mistaken for a duration. Use `resetWith(seconds)` to
 * change the time.
 */
export function useCountdown(initialSeconds = 60): UseCountdownReturn {
  const initial = normalize(initialSeconds);

  const [timeLeft, setTimeLeft] = useState(initial);
  const [isRunning, setIsRunning] = useState(false);

  // Lets `start` decide whether there is anything left to count without taking
  // timeLeft as a dependency, which would rebuild the callback on every tick.
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  // Stopping is driven off the value rather than done inside the tick, so the
  // state updater stays pure and is safe to invoke twice under StrictMode.
  useEffect(() => {
    if (isRunning && timeLeft === 0) setIsRunning(false);
  }, [isRunning, timeLeft]);

  const start = useCallback(() => {
    if (timeLeftRef.current <= 0) return;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialRef.current);
  }, []);

  const resetWith = useCallback((seconds: number) => {
    setIsRunning(false);
    setTimeLeft(normalize(seconds));
  }, []);

  return { timeLeft, isRunning, start, pause, reset, resetWith };
}
