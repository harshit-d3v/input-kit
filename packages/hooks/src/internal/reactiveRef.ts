import type { MutableRefObject } from 'react';

/**
 * A ref that reports assignment.
 *
 * Observer hooks have to start observing the moment an element is attached. Polling
 * for `ref.current` to become non-null works but burns a timer for the lifetime of
 * every component using the hook, and a bare callback ref cannot be handed back as
 * something the caller may also read.
 *
 * A getter/setter pair gives both: React — or any caller — assigns `.current` as
 * usual, and the owner is notified synchronously. React only ever reads and writes
 * `.current`, so this is a drop-in wherever a ref object is expected.
 */
export function createReactiveRef<T>(
  onChange: (value: T | null) => void,
): MutableRefObject<T | null> {
  let current: T | null = null;

  return {
    get current() {
      return current;
    },
    set current(next: T | null) {
      if (next === current) return;
      current = next;
      onChange(next);
    },
  } as MutableRefObject<T | null>;
}
