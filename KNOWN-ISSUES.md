# Known issues

Written down rather than left to be discovered. Everything here is open work.

## Current state

- **718 tests pass, none fail.** `npm run test` at the repo root.
- **All 41 packages typecheck clean**, as does the docs site, which compiles every
  package's demo. `npm run typecheck`.
- **All 41 packages build clean.** `npm run build`.

## 1. 28 of 41 packages have no tests

Listed with their source volume in the README. These have working implementations
and runnable demos but nothing guarding them.

An earlier version of this repo carried a placeholder test file in 25 of them that
asserted only `expect(true).toBe(true)`. Those were deleted rather than kept as a
fake coverage number, so those packages now honestly report zero tests. Their `test`
script passes with `--passWithNoTests`; packages that do have suites keep strict
behaviour, so a vanished test file stays loud.

Writing a real suite for one of these is the most useful contribution available.
Start from the package's `test-demo/` to see the intended behaviour.

## 2. Thirteen demos are placeholders

`chart`, `code`, `command`, `crop`, `currency`, `date`, `gauge`, `i18n`, `json`,
`markdown`, `mask`, `menu`, `otp` have a demo that prints the package's export list
instead of exercising it. Their pages on the docs site say so explicitly.

## 3. `@input-kit/form` stores errors flat, not nested

Zod issue paths are joined with `.`, so a failure on the second member's name lands
at `errors['members.1.name']`, not `errors.members[1].name`. This is now typed
accurately — `FieldErrors` is keyed by `Path<T>` — so those reads are checked rather
than implicitly `any`.

The ecosystem convention (react-hook-form) is to nest. Nesting would read better at
the call site, but the package's own test suite documents the flat shape
(`utils.test.ts` asserts `errors['user.name']`), so changing it is a deliberate
breaking change rather than a fix, and it is not done here.

## 4. Accessibility is implemented but not audited

Keyboard navigation and ARIA wiring follow the [APG](https://www.w3.org/WAI/ARIA/apg/)
patterns, and the packages with suites cover it, but there is no external audit and
no screen-reader test matrix.

## 5. Most packages are still `0.1.x`

Treat them as early. APIs may change before 1.0.

## Fixed

### `@input-kit/hooks` — the whole suite (2.0.0)

`1.0.1` shipped with **67 of 128 tests failing**, and one file exhausted the JS heap
and crashed the runner. The tests and implementations had been written against two
different API designs and never reconciled. Where they disagreed the tests described
the better API, so the implementations were brought to match — a breaking change,
hence the major version. All 128 now pass. Full detail in
[`packages/hooks/CHANGELOG.md`](packages/hooks/CHANGELOG.md).

The defects behind those failures were real, not test artefacts:

- **`useScrollPosition` could hang the browser.** Its listener was keyed on the
  identity of the `ref` argument, so calling it the natural way —
  `useScrollPosition({ current: el })` — passed a new object every render: the effect
  reattached, measured, set state, and re-rendered, forever.
- **`useLocalStorage` / `useSessionStorage` threw on every write**, dispatching a
  synthetic `StorageEvent` with an invalid `storageArea`. Also semantically wrong:
  the native `storage` event fires in *other* tabs, so the writing tab was telling
  itself another tab had changed.
- **`useThrottle` delivered stale arguments** — its trailing call captured the
  arguments from when the timer was scheduled, not the latest — and never cleared
  its timer on unmount.
- **`useMediaQuery` threw where `matchMedia` is unavailable**, so it was unsafe
  during SSR.
- **`usePrevious` was one render behind**, writing refs in an effect that cannot
  affect what render already returned.
- **`useDebounce(value)` / `useThrottle(fn)` had no default delay**, so the omitted
  argument reached `setTimeout` as `undefined` — meaning 0 — and the hooks did
  nothing at all.
- **`useNetworkStatus` conflated `type` and `effectiveType`**, reporting the latter
  under the former's name and never exposing the real one.
- **`useKeyPressMultiple` reattached its listeners every render.**

### `@input-kit/toast` — crashed under SSR (1.0.2)

`requestAnimationFrame` and `cancelAnimationFrame` were called unguarded, so
importing the store in any non-browser context threw, and a queued frame could fire
after its environment was gone. Frame scheduling now goes through a guarded helper
with a matching canceller, and auto-dismiss timers are tracked so `__resetStore` can
clear them.

### `@input-kit/combobox` — unusable with typed options (0.2.0)

`Combobox` was fixed at `ComboboxProps<unknown>`, and because the props carry render
callbacks `T` was invariant, so `ComboboxOption<string>[]` could never be passed. The
exported signature is now generic over `T`.

`value` / `onChange` / `multi` are also now a discriminated union, so `onChange` says
what actually arrives — `T | null` normally, `T[]` when `multi` is set — instead of
`T | T[] | null` in both modes, which forced every single-select caller to narrow a
value that can never be an array. `onChange` is marked `NoInfer` so passing a
`useState` setter directly does not drag `SetStateAction` into `T`.

### `@input-kit/table` — generic in name only (0.2.0)

`TableRow` required `[key: string]: unknown`, and no ordinary interface satisfies an
index signature — so `Table<T>` silently fell back to its default and every cell
value arrived as `unknown`. Callers would have had to add an index signature to their
own domain types, giving up the safety the table exists to provide. The constraint is
now just an optional `id`; string-keyed column access is handled internally.

### `@input-kit/form` — field arrays were untyped and did not work (0.2.0)

Field addressing was `keyof T`, so `register('members.0.name')` — the normal way to
register a repeated field — was rejected outright. Worse, values were read and
written by flat indexing, so a dotted path created a literal `"members.0.name"` key
instead of reaching into the array: registration appeared to succeed and then did
nothing.

Addressing is now `Path<T>` (dotted paths with array indices), values move through
`getNestedValue` / `setNestedValue`, and `isFieldDirty` reads by path — it previously
compared `undefined` against `undefined` for any nested field and always reported it
clean. `useWatch<T>()` also now works with one type argument to watch the whole form.

### `@input-kit/dropzone` — rejections were computed then discarded (0.2.0)

`useDropzone` built the list of rejected files, handed it to `onDropRejected`, and
threw it away. Callers wanting to render "3 files rejected, here's why" had to mirror
it into their own state. Now exposed as `rejectedFiles`, with `clearRejections()`.

### Three demo files were syntactically invalid

`color`, `confetti` and `tooltip` each contained two concatenated copies of
themselves, the second truncated mid-expression — an artefact of the batch generator
appending instead of overwriting. A parse check over all 41 demos now guards this:
`node scripts/check-demos.mjs`.

### `@input-kit/confetti` tests never ran the renderer

jsdom implements no canvas, so `getContext('2d')` returned null and the library
correctly declined to draw — meaning the suite asserted against a library that had
opted out. A minimal 2D context stub in `src/setupTests.ts` lets the behaviour under
test actually run, without pulling in the native `canvas` package.
