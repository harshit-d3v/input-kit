import { useState, useEffect } from 'react';

/**
 * Detect when a specific key is pressed
 * @param targetKey The key to detect (e.g., 'Escape', 'Enter')
 * @returns Whether the key is currently pressed
 * 
 * @example
 * const isEscapePressed = useKeyPress('Escape');
 * 
 * useEffect(() => {
 *   if (isEscapePressed) {
 *     closeModal();
 *   }
 * }, [isEscapePressed]);
 */
export function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setIsPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setIsPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKey]);

  return isPressed;
}

/**
 * Detect when any of multiple keys are pressed
 * @param targetKeys Array of keys to detect
 * @returns Object with key states
 * 
 * @example
 * const keys = useKeyPressMultiple(['ArrowUp', 'ArrowDown']);
 * 
 * if (keys.ArrowUp) console.log('Up pressed');
 */
export function useKeyPressMultiple(targetKeys: string[]): Record<string, boolean> {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (targetKeys.includes(event.key)) {
        setPressedKeys((prev) => ({ ...prev, [event.key]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (targetKeys.includes(event.key)) {
        setPressedKeys((prev) => ({ ...prev, [event.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKeys]);

  return pressedKeys;
}
