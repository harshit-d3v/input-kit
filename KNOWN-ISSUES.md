# Known issues

Written down rather than left to be discovered. Everything here is open work.

## Current state

- **718 tests pass, none fail.** `npm run test` at the repo root.
- **All 41 packages typecheck clean**, as does the docs site, which compiles every
  package's demo. `npm run typecheck`.
- **All 41 packages build clean.** `npm run build`.

A second review pass (2026-07-30) went through all 29 packages that carry no test
suite and fixed roughly 120 defects across 28 of them — including several that made a
package's headline feature wrong in its default configuration. The full write-up, one
section per package, is in [`REVIEW-2026-07-30.md`](REVIEW-2026-07-30.md); the
summary is under "Fixed" below. `clipboard` was the only package with no defects found.

A follow-up pass then added regression suites to nine of the worst-affected packages
and replaced every placeholder demo. **890 tests pass** and `npm run test` exits clean
for the first time.

## 1. 20 of 41 packages have no tests

Listed with their source volume in the README. These have working implementations
and runnable demos but nothing guarding them.

An earlier version of this repo carried a placeholder test file in 25 of them that
asserted only `expect(true).toBe(true)`. Those were deleted rather than kept as a
fake coverage number, so those packages now honestly report zero tests. Their `test`
script passes with `--passWithNoTests`; packages that do have suites keep strict
behaviour, so a vanished test file stays loud.

`gauge`, `split`, `otp`, `date`, `currency`, `markdown`, `i18n`, `time` and
`sparkline` gained suites aimed squarely at the defects the review found — the fill
that rendered at 1%, the controlled-`sizes` render loop, the repeated `onComplete`,
the dates that rolled over instead of failing, and so on. Writing one for a package
still on the list is the most useful contribution available; start from its
`test-demo/` to see the intended behaviour.

## 2. Demos

Every package now has a demo that exercises it. The thirteen that used to print an
export list — `chart`, `code`, `command`, `crop`, `currency`, `date`, `gauge`,
`i18n`, `json`, `markdown`, `mask`, `menu`, `otp` — were replaced with interactive
ones, several of which demonstrate the specific behaviour the review pass repaired.

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

The 2026-07-30 pass closed a number of concrete gaps — `gauge` and `LinearGauge` had no
`role="meter"`, `json`'s expand control was a bare `<span onClick>`, `date`'s day cells
announced as a bare number and its focus ring was suppressed across the whole grid,
`tree` left collapsed subtrees in the accessibility tree, `menu` never exposed an
active item.

A follow-up closed the two gaps that pass had deferred:

- **`date` (0.3.0)** — the calendar is now a real `role="grid"` with rows and
  gridcells, and a roving tabindex: one day sits in the tab order, and arrows,
  Home/End and PageUp/PageDown move by day, week and month. Days are marked
  `aria-disabled` rather than natively `disabled`, so out-of-range dates stay
  focusable and discoverable — a natively disabled button cannot be focused, which
  would have broken arrow navigation the moment it crossed one.
- **`menu` (0.2.0)** — items are real focusable `<button role="menuitem">` elements
  with a roving tabindex, and the key handler is bound to the menu instead of to
  `document`. Focus enters on open, ArrowLeft returns from a submenu to the parent
  item it came from, and `aria-haspopup` / `aria-expanded` describe submenus.

Remaining, unchanged: no external audit and no screen-reader test matrix.

## 5. Version spread

Packages fixed in the 2026-07-30 pass are on `0.1.x` or `0.2.x`; `hooks` is at `2.0.0`
and `toast` at `1.0.2`. Everything below 1.0 should still be treated as early — APIs
may change.

## Fixed

### The 2026-07-30 review pass — 28 packages

Every package without a test suite was read line by line and its defects fixed. Full
detail per package in [`REVIEW-2026-07-30.md`](REVIEW-2026-07-30.md). The ones that
mattered most:

- **`gauge` (0.2.0)** — horizontal `LinearGauge` rendered ~1% full at every value: the
  0–1 fraction was interpolated straight into a CSS percent, while the vertical branch
  three lines away scaled it correctly. `animated` was also inert — it transitioned
  `stroke-dashoffset` on a path that changed via `d`, and moved the needle through
  `x2`/`y2`, neither of which browsers animate.
- **`split` (0.2.0)** — controlled `sizes` was an infinite render loop. The sync effect
  keyed on array identity, and the documented usage passes an inline literal.
- **`otp` (0.2.0)** — `onComplete` re-fired on every render once the code was full, so
  consumers using it to submit submitted repeatedly.
- **`dropzone` (0.2.1)** — `dragenter` threw a `TypeError` in Chrome whenever `accept`
  used file extensions, because the synthetic drag object has no filename.
- **`menu` (0.1.1)** — `DropdownMenu` could not be dismissed by clicking away; outside
  click and Escape lived only in `useContextMenu`, which it does not use.
- **`markdown` (0.1.1)** — `//evil.com` passed the URL sanitiser as an "internal" path.
- **`tree` (0.2.0)** — all nine mutators invoked consumer callbacks from inside
  `setState` updaters, so StrictMode fired every one of them twice.
- **`mask` (0.2.0)** — `MaskedInput` looped forever with `showMaskOnFocus={false}`; the
  documented `A` mask character never uppercased.
- **`upload` (0.1.2)** — every image preview leaked its object URL, and all four
  callbacks received a file snapshot frozen at `status: 'idle', progress: 0`.
- **`date` (0.2.0)** — `parseDate('13/45/2026')` returned a real date in 2027 instead of
  `null`; `minDate` carrying a time component disabled that whole day.
- **`chart` (0.2.0)** — all-negative series scaled outside the plot area, flat series
  rendered `NaN` paths, and `fill` crashed on an empty series.
- **`sparkline` (0.1.2)** — `SparkBar` drew wrong heights for any data containing
  negatives, and `SparkArea`'s `Math.random()` gradient id broke SSR hydration.

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
