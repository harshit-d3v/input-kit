import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseClipboardReturn {
  /** The text most recently copied successfully. */
  value: string | null;
  /** True for `timeout` ms after a successful copy — drive your "Copied!" label off this. */
  copied: boolean;
  /** Why the last copy failed, or null. */
  error: Error | null;
  /** Copy text. Resolves true on success; never rejects. */
  copy: (text: string) => Promise<boolean>;
  /** Clear `copied` and `error` immediately. */
  reset: () => void;
}

/**
 * Copy text to the clipboard, with a self-clearing success flag.
 *
 * @param timeout how long `copied` stays true, in ms. Defaults to 2000. Pass 0 to keep it set.
 * @returns `{ value, copied, error, copy, reset }`
 *
 * @example
 * const { copy, copied } = useClipboard();
 * return <button onClick={() => copy(token)}>{copied ? 'Copied' : 'Copy'}</button>;
 *
 * @remarks
 * `copy` resolves to a boolean rather than rejecting, so a denied clipboard
 * permission — common, and not the caller's fault — does not need a try/catch at
 * every call site. Inspect `error` when you need the reason.
 */
export function useClipboard(timeout = 2000): UseClipboardReturn {
  const [value, setValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // A pending reset must not outlive the component, or it fires into a torn-down tree.
  useEffect(() => clearTimer, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(null);
  }, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Clear the previous outcome first, so a failed second copy cannot leave a
      // stale "Copied!" on screen next to its own error.
      clearTimer();
      setCopied(false);
      setError(null);

      const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
      if (!clipboard || typeof clipboard.writeText !== 'function') {
        setError(new Error('Clipboard API not available'));
        return false;
      }

      try {
        await clipboard.writeText(text);
      } catch (cause) {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        return false;
      }

      setValue(text);
      setCopied(true);

      if (timeout > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setCopied(false);
        }, timeout);
      }

      return true;
    },
    [clearTimer, timeout],
  );

  return { value, copied, error, copy, reset };
}
