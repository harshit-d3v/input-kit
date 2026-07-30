// TypeScript 6 raises TS2882 for a side-effect import with no type declaration, so
// `import './globals.css'` in app/layout.tsx needs one. Next's own next-env.d.ts does
// not cover the bare-CSS case, and it is marked "should not be edited".
declare module '*.css';
declare module '*.scss';
