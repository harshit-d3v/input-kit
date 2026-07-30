import { useStorage } from './internal/storage.js';
import type { UseStorageOptions, UseStorageReturn } from './internal/storage.js';

export type { UseStorageOptions, UseStorageReturn };

/**
 * Persist state to localStorage, synchronised across tabs and across instances.
 *
 * @param key localStorage key to read and write
 * @param initialValue value used when the key is absent, and restored by `remove`
 * @param options custom `serializer` / `deserializer`; both default to JSON
 * @returns `[value, setValue, remove]`
 *
 * @example
 * const [name, setName] = useLocalStorage('name', 'John');
 * setName('Jane');
 * setName((prev) => prev.toUpperCase());
 *
 * @example Storing a type JSON cannot round-trip on its own
 * const [when, setWhen] = useLocalStorage('when', new Date(), {
 *   serializer: (d) => d.toISOString(),
 *   deserializer: (raw) => new Date(raw),
 * });
 *
 * @remarks
 * A failed write — quota exceeded, storage disabled, private browsing — is warned
 * about but does not discard the in-memory update, so the component still reflects
 * what the caller asked for.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseStorageOptions<T> = {},
): UseStorageReturn<T> {
  return useStorage('localStorage', key, initialValue, options, true);
}
