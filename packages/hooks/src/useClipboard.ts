import { useState, useCallback, useEffect, useRef } from 'react';

interface UseClipboardReturn {
  value: string | undefined;
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Copy text to clipboard
 * @param timeout Duration to show "copied" state (ms)
 * @returns Clipboard state and copy function
 * 
 * @example
 * const { copy, copied } = useClipboard();
 * 
 * <button onClick={() => copy('Hello!')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 */
export function useClipboard(timeout: number = 2000): UseClipboardReturn {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopiedTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearCopiedTimeout, [clearCopiedTimeout]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        console.warn('Clipboard API not available');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setValue(text);
        setCopied(true);
        clearCopiedTimeout();
        
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, timeout);
        
        return true;
      } catch (error) {
        clearCopiedTimeout();
        console.warn('Failed to copy:', error);
        setCopied(false);
        return false;
      }
    },
    [clearCopiedTimeout, timeout]
  );

  const reset = useCallback(() => {
    clearCopiedTimeout();
    setValue(undefined);
    setCopied(false);
  }, [clearCopiedTimeout]);

  return { value, copied, copy, reset };
}
