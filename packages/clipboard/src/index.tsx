import { useState, useCallback, useRef, useEffect } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Shared write implementation used by both the hook and the standalone util.
 * The legacy execCommand fallback is kept for non-secure contexts (e.g. http://localhost).
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Legacy fallback for non-secure contexts and older browsers.
      // execCommand is deprecated but remains the only option without the
      // Clipboard API.
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // Keep it off-screen and out of the accessibility tree.
      textarea.style.cssText =
        'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      textarea.setAttribute('aria-hidden', 'true');
      textarea.setAttribute('tabindex', '-1');
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (!ok) throw new Error('execCommand copy returned false');
    }
    return true;
  } catch {
    return false;
  }
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel the pending reset on unmount to avoid state updates on
  // an already-unmounted component.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Cancel any in-flight timer so rapid calls don't stack.
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      const success = await writeToClipboard(text);
      if (success) {
        setCopied(true);
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setCopied(false);
        }, timeout);
      }
      return success;
    },
    [timeout]
  );

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  return writeToClipboard(text);
}

export async function readFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch {
    return null;
  }
}
