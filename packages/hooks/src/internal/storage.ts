import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseStorageOptions<T> {
  /** Turn a value into the string written to storage. Defaults to JSON.stringify. */
  serializer?: (value: T) => string;
  /** Turn a stored string back into a value. Defaults to JSON.parse. */
  deserializer?: (raw: string) => T;
}

/** `[value, setValue, remove]`. `remove` clears the key and returns to the initial value. */
export type UseStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void,
];

/**
 * Same-tab synchronisation between hook instances that share a key.
 *
 * The native `storage` event fires only in *other* tabs, so two components using
 * the same key in one tab would otherwise drift apart after a write. Siblings are
 * therefore notified directly through this registry.
 *
 * The obvious-looking alternative — dispatching a synthetic `StorageEvent` on our
 * own window — is wrong twice over. It claims another tab made the change, and it
 * throws outright anywhere `localStorage` is not a real `Storage` instance, which
 * includes most test environments.
 */
type Sibling = (value: unknown) => void;

const siblings = new Map<string, Set<Sibling>>();

function subscribeSibling(scope: string, fn: Sibling): () => void {
  let group = siblings.get(scope);
  if (!group) {
    group = new Set();
    siblings.set(scope, group);
  }
  group.add(fn);

  return () => {
    const current = siblings.get(scope);
    if (!current) return;
    current.delete(fn);
    if (current.size === 0) siblings.delete(scope);
  };
}

function notifySiblings(scope: string, value: unknown, origin: Sibling): void {
  const group = siblings.get(scope);
  if (!group) return;
  group.forEach((fn) => {
    if (fn !== origin) fn(value);
  });
}

type AreaName = 'localStorage' | 'sessionStorage';

function readArea(area: AreaName): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window[area];
  } catch {
    // Storage access throws outright when blocked by browser privacy settings.
    return null;
  }
}

/**
 * Shared implementation behind useLocalStorage and useSessionStorage. The only
 * behavioural difference is cross-tab sync, which applies to localStorage only —
 * sessionStorage is scoped to a single tab by definition.
 */
export function useStorage<T>(
  area: AreaName,
  key: string,
  initialValue: T,
  options: UseStorageOptions<T> = {},
  crossTab = false,
): UseStorageReturn<T> {
  // Held in refs so that callers passing inline objects, inline functions, or a
  // fresh initial value each render do not retrigger effects or rebuild callbacks.
  const initialRef = useRef(initialValue);
  const serializeRef = useRef(options.serializer);
  const deserializeRef = useRef(options.deserializer);
  serializeRef.current = options.serializer;
  deserializeRef.current = options.deserializer;

  const serialize = useCallback(
    (value: T): string =>
      serializeRef.current ? serializeRef.current(value) : JSON.stringify(value),
    [],
  );

  const deserialize = useCallback(
    (raw: string): T =>
      deserializeRef.current ? deserializeRef.current(raw) : (JSON.parse(raw) as T),
    [],
  );

  const read = useCallback((): T => {
    const storage = readArea(area);
    if (!storage) return initialRef.current;

    try {
      const raw = storage.getItem(key);
      return raw === null ? initialRef.current : deserialize(raw);
    } catch (error) {
      console.warn(`Error reading ${area} key "${key}":`, error);
      return initialRef.current;
    }
  }, [area, key, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(read);

  // Mirrors state so functional updates can read the latest value without the
  // setter needing storedValue as a dependency.
  const valueRef = useRef(storedValue);
  valueRef.current = storedValue;

  const applyExternal = useCallback((value: unknown) => {
    valueRef.current = value as T;
    setStoredValue(value as T);
  }, []);

  // Identity must be stable for the lifetime of the instance: it doubles as this
  // instance's identifier, so notifySiblings can skip the writer.
  const applyExternalRef = useRef(applyExternal);
  applyExternalRef.current = applyExternal;
  const selfRef = useRef<Sibling>((value) => applyExternalRef.current(value));

  const scope = `${area}:${key}`;

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const next = value instanceof Function ? value(valueRef.current) : value;

      // State first, deliberately. A storage write can fail — quota exceeded,
      // private browsing, storage disabled — and losing the in-memory update
      // too would make the component silently ignore the caller.
      valueRef.current = next;
      setStoredValue(next);

      const storage = readArea(area);
      if (storage) {
        try {
          storage.setItem(key, serialize(next));
        } catch (error) {
          console.warn(`Error setting ${area} key "${key}":`, error);
        }
      }

      notifySiblings(scope, next, selfRef.current);
    },
    [area, key, scope, serialize],
  );

  const remove = useCallback(() => {
    valueRef.current = initialRef.current;
    setStoredValue(initialRef.current);

    const storage = readArea(area);
    if (storage) {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing ${area} key "${key}":`, error);
      }
    }

    notifySiblings(scope, initialRef.current, selfRef.current);
  }, [area, key, scope]);

  useEffect(() => subscribeSibling(scope, selfRef.current), [scope]);

  useEffect(() => {
    if (!crossTab || typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      // A null newValue means the key was removed in the other tab.
      if (event.newValue === null) {
        applyExternalRef.current(initialRef.current);
        return;
      }
      try {
        applyExternalRef.current(deserialize(event.newValue));
      } catch (error) {
        console.warn(`Error parsing ${area} key "${key}" from storage event:`, error);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [area, key, crossTab, deserialize]);

  return [storedValue, setValue, remove];
}
