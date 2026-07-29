# Test Demo for @input-kit/number

This folder contains demo and test files for the number input package.

## Files

| File | Description |
|------|-------------|
| `demo.tsx` | React component demos showing all features |
| `test-imports.ts` | Tests all imports and utility functions |

## Run Tests

### Visual Test (HTML Demo) - RECOMMENDED
```bash
# Start the server
cd input-kit-number
node test-demo/serve.cjs

# Then open http://localhost:3000 in your browser
```

Or simply open `test-demo/index.html` directly in your browser.

### Test Imports & Utilities
```bash
npx tsx test-demo/test-imports.ts
```

## Run Demo App

To run the React demo, you need a React environment:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the demo (requires React setup)
npx tsx test-demo/demo.tsx
```

Or use it in a Next.js/Vite app:

```tsx
import { DemoApp } from '@input-kit/number/test-demo/demo';

export default function Page() {
  return <DemoApp />;
}
```

## What's Tested

### 1. Basic Number Input
- Simple number entry
- Min/max constraints
- Step increment

### 2. Currency Input
- USD formatting
- Symbol display
- Decimal handling

### 3. Percentage Input
- Percent format
- 0-1 range
- Decimal precision

### 4. Custom UI with Hook
- Using `useNumberInput` hook
- Custom buttons
- Increment/decrement

### 5. Internationalization
- German locale (de-DE)
- Euro currency
- Different decimal separator

### 6. Validation
- Required fields
- Min/max validation
- Error states
