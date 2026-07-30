import { useStorage } from './internal/storage.js';
import type { UseStorageOptions, UseStorageReturn } from './internal/storage.js';

/**
 * Persist state to sessionStorage for the lifetime of the tab.
 *
 * @param key sessionStorage key to read and write
 * @param initialValue value used when the key is absent, and restored by `remove`
 * @param options custom `serializer` / `deserializer`; both default to JSON
 * @returns `[value, setValue, remove]`
 *
 * @example
 * const [draft, setDraft, clearDraft] = useSessionStorage('draft', '');
 *
 * @example Storing a type JSON cannot round-trip on its own
 * const [seen, setSeen] = useSessionStorage('seen', new Map<string, number>(), {
 *   serializer: (m) => JSON.stringify([...m.entries()]),
 *   deserializer: (raw) => new Map(JSON.parse(raw)),
 * });
 *
 * @remarks
 * Unlike {@link useLocalStorage} this does not respond to `storage` events.
 * sessionStorage is scoped to one tab, so a `storage` event from another tab
 * refers to a different store entirely and must be ignored. Instances sharing a
 * key within the same tab are still kept in sync.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseStorageOptions<T> = {},
): UseStorageReturn<T> {
  return useStorage('sessionStorage', key, initialValue, options, false);
}
