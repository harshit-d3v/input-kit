# Contributing to input-kit

Thanks for considering a contribution.

## Setup

```bash
git clone https://github.com/harshit-d3v/input-kit.git
cd input-kit
npm install
npm run build
npm run test
```

This is an npm workspaces monorepo. Every package under `packages/*` is published to the `@input-kit` scope on npm.

## The most useful contribution right now

**Tests.** 29 of the 41 packages in this repo have working implementations but no automated tests. If you want to help and don't have a specific bug in mind, picking one of those packages and writing a real test suite is the highest-value thing available.

Packages that already have real suites, for reference on style and depth: `table`, `virtual`, `combobox`, `form`, `hooks`, `toast`, `pin`, `color`, `number`, `csv`, `confetti`.

Tests use [Vitest](https://vitest.dev/) with `@testing-library/react` and `jsdom`:

```bash
npm run test -w @input-kit/<name>
npm run test:watch -w @input-kit/<name>
```

Please do not add placeholder tests that assert nothing (`expect(true).toBe(true)`). A package with no tests is more honest than a package with fake ones.

## Guidelines

**Keep it headless.** No package should ship CSS, require a theme provider, or bundle a styling runtime. Hooks return state, handlers, and ARIA props; components accept `className` and nothing more opinionated.

**Accessibility follows the [APG](https://www.w3.org/WAI/ARIA/apg/).** If you're adding an interactive primitive, match the relevant APG pattern for roles, keyboard interaction, and focus management. Note in the PR which pattern you followed.

**TypeScript strict.** No `any` without a comment explaining why. Export the types consumers will need.

**React 18 and 19 both.** Don't use APIs available in only one.

## Pull requests

1. Branch from `main`
2. Make the change, add or update tests
3. Run `npm run test` and `npm run typecheck` at the repo root
4. Open the PR describing what changed and why

For a new package, open an issue first so we can talk through whether it belongs in the scope.

## Adding a test to an untested package

Each package has a `test-demo/` directory with a runnable demo — that's usually the fastest way to understand the intended behaviour before writing assertions:

```bash
cd packages/<name>/test-demo && node serve.cjs
```

## License

Contributions are licensed under [MIT](LICENSE), matching the project.
