# input-kit

Headless, unstyled React primitives for inputs and UI. Every package ships behaviour, state, and ARIA wiring — and **no CSS**. You bring the styling.

Monorepo for the [`@input-kit`](https://www.npmjs.com/org/input-kit) npm scope. MIT licensed.

**→ [Live demos for every package](https://input-kit.vercel.app)**

```bash
npm install @input-kit/table @input-kit/combobox @input-kit/toast
```

## Why headless

Most React component libraries ship their own styling and DOM structure. If you're on Tailwind, shadcn/ui, or an in-house design system, you end up either fighting the library's specificity or forking it.

`@input-kit` packages expose hooks that hand you state, event handlers, and the correct ARIA attributes. The optional reference components are class-names-only — no bundled stylesheet, no CSS-in-JS runtime, no theme provider. Style them however you already style everything else.

- **Headless first** — `useX()` hooks are the primary API; components are a convenience layer
- **TypeScript first** — full types exported, `strict` mode throughout
- **Dual ESM + CJS** with generated `.d.ts`
- **React 18 and 19** as peer deps
- **Zero styling opinions** — no CSS shipped in any package

## Packages

| Package | Version | Description | Source | Tests |
| --- | --- | --- | --: | --: |
| [`@input-kit/hooks`](packages/hooks) | 2.0.0 | Essential React hooks collection for @input-kit | 1706 | 2566 lines |
| [`@input-kit/virtual`](packages/virtual) | 0.1.1 | React virtualization primitives for large lists and grids with dynamic sizing | 1512 | 1534 lines |
| [`@input-kit/table`](packages/table) | 0.2.0 | Headless React data table with sorting, filtering, selection, and virtualization | 1546 | 976 lines |
| [`@input-kit/form`](packages/form) | 0.2.0 | Form validation with Zod | 1050 | 1223 lines |
| [`@input-kit/combobox`](packages/combobox) | 0.2.0 | Autocomplete combobox | 1202 | 1018 lines |
| [`@input-kit/color`](packages/color) | 0.1.0 | Color picker component | 1449 | 705 lines |
| [`@input-kit/toast`](packages/toast) | 1.0.2 | Headless toast notification library for React | 1166 | 632 lines |
| [`@input-kit/pin`](packages/pin) | 0.1.0 | PIN/OTP input component | 742 | 790 lines |
| [`@input-kit/tree`](packages/tree) | 0.1.1 | Accessible React tree views with keyboard navigation, selection, and virtualization | 1300 | — |
| [`@input-kit/upload`](packages/upload) | 0.1.1 | React file upload primitives with drag-and-drop, previews, validation, and queues | 1193 | — |
| [`@input-kit/number`](packages/number) | 0.1.1 | Headless number input component with locale support, currency modes, and TypeScript | 634 | 285 lines |
| [`@input-kit/card`](packages/card) | 0.1.0 | Credit card input | 899 | — |
| [`@input-kit/timeline`](packages/timeline) | 0.1.1 | Accessible React timelines for milestones, launches, and journey storytelling | 887 | — |
| [`@input-kit/slider`](packages/slider) | 0.1.1 | Accessible React slider primitives with single and range thumbs | 740 | — |
| [`@input-kit/time`](packages/time) | 0.1.1 | Locale-aware relative time, countdown, and stopwatch utilities for React | 737 | — |
| [`@input-kit/split`](packages/split) | 0.1.1 | Resizable split panes and panel layouts with keyboard support | 673 | — |
| [`@input-kit/sparkline`](packages/sparkline) | 0.1.1 | SVG sparkline, area, and bar charts for React dashboards | 643 | — |
| [`@input-kit/dropzone`](packages/dropzone) | 0.2.0 | File dropzone | 576 | — |
| [`@input-kit/tooltip`](packages/tooltip) | 0.1.1 | Accessible React tooltips with smart positioning and interactive content | 530 | 31 lines |
| [`@input-kit/date`](packages/date) | 0.1.0 | Date picker component | 556 | — |
| [`@input-kit/crop`](packages/crop) | 0.1.0 | Image cropper | 525 | — |
| [`@input-kit/command`](packages/command) | 0.1.0 | Command palette | 490 | — |
| [`@input-kit/menu`](packages/menu) | 0.1.0 | Context menu | 487 | — |
| [`@input-kit/gauge`](packages/gauge) | 0.1.0 | Gauge/meter | 480 | — |
| [`@input-kit/chart`](packages/chart) | 0.1.0 | Chart components | 478 | — |
| [`@input-kit/paste`](packages/paste) | 0.1.0 | Clipboard paste handler | 453 | — |
| [`@input-kit/markdown`](packages/markdown) | 0.1.0 | Markdown renderer | 438 | — |
| [`@input-kit/mask`](packages/mask) | 0.1.0 | Input masking | 429 | — |
| [`@input-kit/code`](packages/code) | 0.1.0 | Code block with syntax highlighting | 412 | — |
| [`@input-kit/otp`](packages/otp) | 0.1.0 | OTP input component | 397 | — |
| [`@input-kit/csv`](packages/csv) | 0.1.0 | CSV parser and formatter | 189 | 186 lines |
| [`@input-kit/tabs`](packages/tabs) | 0.1.1 | Accessible React tabs with roving focus and compound primitives | 372 | — |
| [`@input-kit/resize`](packages/resize) | 0.1.0 | Resize observer hook | 370 | — |
| [`@input-kit/i18n`](packages/i18n) | 0.1.0 | Internationalization | 350 | — |
| [`@input-kit/json`](packages/json) | 0.1.0 | JSON viewer | 290 | — |
| [`@input-kit/confetti`](packages/confetti) | 0.1.0 | Confetti effects | 165 | 102 lines |
| [`@input-kit/search`](packages/search) | 0.1.0 | Search input with debounce | 127 | — |
| [`@input-kit/currency`](packages/currency) | 0.1.0 | Currency formatting | 124 | — |
| [`@input-kit/online`](packages/online) | 0.1.0 | Network status | 122 | — |
| [`@input-kit/fullscreen`](packages/fullscreen) | 0.1.0 | Fullscreen API | 110 | — |
| [`@input-kit/clipboard`](packages/clipboard) | 0.1.0 | Clipboard utilities | 101 | — |

**[`@input-kit/phone`](https://github.com/harshit-d3v/input-kit-phone)** lives in its own repository — it predates this monorepo and has independent release history.

## Project status

Being upfront about where this actually stands.

**Everything green, verified rather than asserted.** `npm run test` — 10,048 lines of
tests across 12 packages, **718 tests passing, none failing**. `npm run typecheck` — clean
across all 41 packages and the docs site, which compiles every demo. `npm run build` — all
41 packages build.

**Test coverage is partial: 12 of 41 packages here have real suites** (`hooks`, `virtual`, `table`, `form`, `combobox`, `color`, `toast`, `pin`, `number`, `tooltip`, `csv`, `confetti`). The remaining 29 have working implementations and runnable demos but
nothing guarding them. An earlier version of this repo carried a placeholder test in 25
of them asserting only `expect(true).toBe(true)`; those were deleted rather than kept
as a fake number, so those packages honestly report zero. Closing this gap is the top
priority — see [KNOWN-ISSUES.md](KNOWN-ISSUES.md).

**26,650 lines of implementation.** Real code, not scaffolding — the largest packages are
1,000+ lines each.

**Most packages are `0.1.x`** and should be treated as early; APIs may change before
1.0. `hooks` is at `2.0.0` after an API overhaul, and `toast` at `1.0.2`.

**Accessibility is implemented but not independently audited.** Keyboard navigation
and ARIA wiring follow the [APG](https://www.w3.org/WAI/ARIA/apg/) patterns, and the
tested packages cover it, but no external audit or screen-reader matrix exists yet.

## Development

```bash
git clone https://github.com/harshit-d3v/input-kit.git
cd input-kit
npm install          # npm workspaces — installs all packages

npm run build        # build every package (tsup)
npm run test         # run every test suite (vitest)
npm run typecheck    # tsc --noEmit across the workspace
```

Per package:

```bash
npm run build -w @input-kit/table
npm run test  -w @input-kit/table
```

Each package also has a `test-demo/` directory with a standalone runnable demo:

```bash
cd packages/table/test-demo && node serve.cjs
```

## Repository layout

```
packages/
  <name>/
    src/              implementation + tests
    test-demo/        standalone runnable demo
    package.json
    tsconfig.json     extends ../../tsconfig.base.json
    tsup.config.ts    ESM + CJS + .d.ts
    vitest.config.ts
```

## Contributing

Contributions are welcome, and the packages listed above without tests are the most useful place to start. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Harshit Prakash
