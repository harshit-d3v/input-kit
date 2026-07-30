# @input-kit/hooks

## 2.0.0

The test suite that shipped with `1.0.1` had never passed: **67 of its 128 tests
failed**, and one file exhausted the JS heap and crashed the runner. The cause was
that the tests and the implementations had been written against two different API
designs and never reconciled.

Where the two disagreed, the tests described the better API — a hook that hands you
a ref is easier to use than one that demands you create it — so the implementations
were brought to match. That makes this a breaking release. **128 of 128 tests now
pass**, and the package typechecks and builds clean.

### Bug fixes

These were real defects, not test problems.

- **`useScrollPosition` could hang the browser.** The scroll listener was keyed on
  the identity of the `ref` argument. Calling it the natural way —
  `useScrollPosition({ current: el })` — passes a new object every render, so the
  effect reattached, measured, set state, and re-rendered, forever. In tests this
  exhausted a 4 GB heap; in an app it would peg a core and freeze the tab. The ref
  is now read at event time and is not a dependency, and state is left alone when
  nothing measurable changed.
- **`useLocalStorage` and `useSessionStorage` threw on every write.** Each
  dispatched a synthetic `StorageEvent` carrying `storageArea: window.localStorage`,
  which is rejected wherever storage is not a real `Storage` instance. It was also
  semantically wrong: the native `storage` event fires in *other* tabs, so the
  writing tab was telling itself another tab had changed. Same-tab instances are now
  notified directly through a registry, and cross-tab sync reads `event.newValue`
  instead of re-reading storage — which is what makes it work when the other tab
  wrote a value this tab cannot see.
- **`useThrottle` delivered stale arguments.** The trailing call captured the
  arguments from when the timer was *scheduled*, so throttling a search box searched
  for what you had typed at the start of the window, not the end. It also never
  cleared its timer on unmount.
- **`useMediaQuery` threw where `matchMedia` is unavailable** instead of falling
  back, making it unsafe during SSR.
- **`usePrevious` was one render behind.** It wrote refs in an effect, which cannot
  affect what render already returned. It is now computed during render, guarded by
  a change check that keeps it correct under StrictMode's double-invoked render.
- **`useKeyPressMultiple` reattached its listeners on every render**, because an
  array literal is a new identity each time.
- **`useDebounce(value)` and `useThrottle(fn)` had no default delay.** The omitted
  argument reached `setTimeout` as `undefined`, which means 0 — so the hooks did
  nothing at all. Both now default to 500ms.
- **`useNetworkStatus` conflated two different fields.** It reported
  `connection.effectiveType` under the name `type` and never exposed the real `type`.
  These mean different things: `type` is the physical link (`'wifi'`), while
  `effectiveType` is measured throughput (`'4g'`). Both are now reported.

### Breaking changes

**`useResizeObserver`** — takes a callback and options, returns the ref:

```diff
- const ref = useRef<HTMLDivElement>(null);
- const { width, height } = useResizeObserver(ref);
+ const { ref, size } = useResizeObserver<HTMLDivElement>();
+ const { width, height } = size;
```

**`useIntersectionObserver`** — returns an object rather than a tuple:

```diff
- const [ref, isVisible, entry] = useIntersectionObserver({ threshold: 0.5 });
+ const { ref, isIntersecting, intersectionRatio, entry } = useIntersectionObserver({ threshold: 0.5 });
```

**`useClickOutside`** — takes the callback first and returns the ref:

```diff
- const ref = useRef<HTMLDivElement>(null);
- useClickOutside(ref, close);
+ const ref = useClickOutside<HTMLDivElement>(close);
```

Now also accepts `{ events, enabled }`.

**`useKeyPress`** — is now callback-based. The old boolean form is
`useKeyPressState`:

```diff
- const escPressed = useKeyPress('Escape');
- useEffect(() => { if (escPressed) close(); }, [escPressed]);
+ useKeyPress('Escape', close);

- const shiftHeld = useKeyPress('Shift');
+ const shiftHeld = useKeyPressState('Shift');
```

Supports `{ modifiers, preventDefault, stopPropagation, eventType, enabled, target }`.

**`useCountdown`** — `seconds` is `timeLeft`, and `reset` no longer takes an argument:

```diff
- const { seconds, reset } = useCountdown(60);
- reset(30);
+ const { timeLeft, reset, resetWith } = useCountdown(60);
+ resetWith(30);
```

`reset` taking no argument means it can be passed straight to `onClick` without the
event being read as a duration. `isPaused`, `resume` and `stop` are gone: `start`
already resumes, and `pause` already stops.

**`useLocalStorage` / `useSessionStorage`** — return a third element and accept
options:

```diff
- const [value, setValue] = useLocalStorage('key', 'initial');
+ const [value, setValue, remove] = useLocalStorage('key', 'initial');

+ const [when, setWhen] = useLocalStorage('when', new Date(), {
+   serializer: (d) => d.toISOString(),
+   deserializer: (raw) => new Date(raw),
+ });
```

A failed write is warned about but no longer discards the in-memory update.

**`useClipboard`** — gains `error`, and `copy` resolves to a boolean instead of
rejecting. A denied clipboard permission is expected, not exceptional, so it no
longer needs a try/catch at each call site.

**`useFullscreen`** — `ref` is optional and defaults to `document.documentElement`.
Returns `{ isFullscreen, error, enter, exit, toggle }`; the three actions resolve to
a boolean rather than rejecting, and vendor-prefixed APIs are handled.

**`useScrollPosition`** — returns `{ x, y, directionX, directionY, maxX, maxY }` and
accepts `{ throttleDelay, trackDirection }`.

**`useMediaQuery`** — accepts `{ defaultValue, initializeWithValue }`. Set
`initializeWithValue: false` when server-rendering to avoid a hydration mismatch.

### Internal

- `useLocalStorage` and `useSessionStorage` were near-duplicates and now share one
  implementation, differing only in cross-tab sync — which applies to localStorage
  only, since sessionStorage is scoped to a single tab.
- The two observer hooks share a ref that reports assignment, so they attach the
  moment an element arrives without polling for it.

## 1.0.1

Initial published release.
