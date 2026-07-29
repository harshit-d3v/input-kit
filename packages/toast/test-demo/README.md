# Test Demo for @input-kit/toast

This folder contains a visual demo for testing the toast notification library.

## Running the Demo

```bash
# Navigate to test-demo folder
cd test-demo

# Run the server
node serve.cjs
```

Then open http://localhost:3000 in your browser.

## Features Demonstrated

- **Toast Types**: Success, Error, Warning, Info
- **Positions**: All 6 positions (top/bottom × left/center/right)
- **Auto-dismiss**: Progress bar shows remaining time
- **Pause on hover**: Hover over a toast to pause the timer
- **Swipe to dismiss**: On touch devices, swipe left/right to dismiss
- **Promise toasts**: Loading → Success/Error flow
- **Action buttons**: Interactive buttons within toasts
- **Keyboard support**: Press Escape to dismiss toasts

## Demo Implementation

The demo uses a standalone implementation of the toast library embedded directly in the HTML file for easy testing without a build step. In a real application, you would import from the npm package:

```jsx
import { ToastProvider, useToast } from '@input-kit/toast';
```
