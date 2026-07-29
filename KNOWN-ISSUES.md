# Known issues

Written down rather than left to be discovered. Everything here is open work, in
rough priority order. Contributions to any of it are welcome.

## 1. `@input-kit/hooks` — 67 of 128 tests fail

The published `@input-kit/hooks@1.0.1` has a failing test suite: **67 failed, 53
passed** across 15 files. This is not a regression from the monorepo migration —
the same result reproduces from the package's original standalone directory at
its original dependency versions.

The failures cluster into a few causes, and at least two look like real
implementation bugs rather than test problems:

| area | symptom | likely cause |
| --- | --- | --- |
| `useLocalStorage`, `useSessionStorage` | `TypeError: Failed to construct 'StorageEvent': parameter 2 has member 'storageArea' that is not of type 'Storage'` | the hook dispatches a synthetic `StorageEvent` with an invalid `storageArea` — an implementation bug, not a test bug |
| `useResizeObserver` | throws from `useResizeObserver.ts:25` | implementation error surfaced by the test |
| `useCountdown`, `useThrottle`, `useDebounce` | timing assertions fail | fake-timer handling |
| `useKeyPress`, `usePrevious`, `useClickOutside` | state not updated as expected | missing `act()` wrapping |
| `useClipboard`, `useFullscreen`, `useIntersectionObserver` | rejected-path assertions fail | incomplete jsdom API mocks |

`hooks` is published at `1.0.1`, which claims more stability than a 52% failing
suite supports. Fixing these is the highest-priority work in the repo.

## 2. 29 of 41 packages have no tests

Listed in the README. These packages have working implementations and runnable
demos but nothing guarding them.

An earlier version of this repo carried a placeholder test file in 25 of them
that asserted only `expect(true).toBe(true)`. Those were deleted rather than kept
as a fake coverage number, so those packages now honestly report zero tests.
Their `test` script passes with `--passWithNoTests`; packages that do have suites
keep strict behaviour, so a vanished test file stays loud.

## 3. 27 type errors in five demo files

The demo files are typechecked when the docs site builds. 27 errors remain, so
`apps/site` currently sets `typescript.ignoreBuildErrors: true`. These are
type-only — the demos render correctly at runtime, and every package source
typechecks clean.

**`packages/table` — `Table` is not generic (6 errors).** Same defect that was
fixed in `Combobox`: the component is fixed at `TableRow`, so `User[]` and
`Column<User>[]` cannot be passed, and cell values arrive as `unknown`. Fix by
restating the exported signature as generic over `T`, exactly as
`packages/combobox/src/Combobox.tsx` now does.

**`packages/dropzone` — `rejectedFiles` is not returned (8 errors).** The demo
destructures `rejectedFiles` from `useDropzone()`, but `UseDropzoneReturn` has no
such property, even though `onDrop` receives a `rejected` argument. Either the
hook should expose rejections as state or the demo should track them from
`onDrop`. The 6 implicit-`any` errors in that file are downstream of this one.

**`packages/form` — field-array paths are not typed (9 errors).** Paths like
`` `members.${number}.name` `` are rejected because the field-name parameter is
narrowed to top-level keys (`"teamName" | "members"`), and `FieldError` cannot be
indexed by number. Supporting nested array paths needs a recursive `Path<T>` type
and a matching nested error shape.

**`packages/virtual` — demo omits a required prop (1 error).** `VirtualGridProps`
requires `width`; the demo's `VirtualGrid` usage does not pass it.

**`packages/hooks` — demo misuses its own API (3 errors).** `useThrottle` takes
`(fn, limit)` but the demo passes a number; `useCountdown().reset` takes an
optional number and is bound straight to `onClick`, which would pass it a mouse
event.

## 4. `Combobox` `onChange` is not discriminated by `multi`

Fixed enough to be usable, not fixed properly. `Combobox` is now generic over
`T`, but `onChange` is still typed `(value: T | T[] | null) => void` whether or
not `multi` is set, so single-select callers must narrow. See the `single()` and
`multiple()` adapters at the top of `packages/combobox/test-demo/demo.tsx`.

The real fix is to split `value` / `onChange` / `multi` into a discriminated
union so single-select gets `(value: T | null) => void`. That cascades into the
implementation's `onChange` call sites, which is why it is not done here.

## 5. Thirteen demos are placeholders

`chart`, `code`, `command`, `crop`, `currency`, `date`, `gauge`, `i18n`, `json`,
`markdown`, `mask`, `menu`, `otp` have a demo file that prints the package's
export list instead of exercising it. Their package pages on the docs site say so
explicitly.

## Fixed while assembling this monorepo

For reference, these were found and fixed rather than carried forward:

- **`@input-kit/toast` crashed under SSR and leaked timers.**
  `requestAnimationFrame` and `cancelAnimationFrame` were called unguarded, so
  importing the store in any non-browser context threw, and a queued frame could
  fire after its environment was gone — which is what made the test suite emit
  unhandled `ReferenceError`s despite all 46 tests passing. Frame scheduling now
  goes through a guarded helper with a matching canceller, and auto-dismiss
  timers are tracked so `__resetStore` can clear them.
- **`@input-kit/hooks` depended on `@testing-library/react-hooks`,** which is
  deprecated and supports only React 16/17, making the workspace unresolvable.
  Every test already imported `renderHook` from `@testing-library/react`, so the
  dependency was unused and was removed.
- **Three demo files contained two concatenated copies of themselves**
  (`color`, `confetti`, `tooltip`), the second truncated mid-expression, leaving
  them syntactically invalid. Artefact of the batch generator appending instead
  of overwriting. The duplicated tails were removed.
- **`Combobox` could not accept typed options** — see item 4.
- **The `color` demo bound a `Color` union to an `<input value>`.** Now uses the
  package's own `formatColor(color, format)`.
