# @input-kit/toast

Headless toast notification library for React with full TypeScript support.

## Features

- 🎯 **Multiple toast types**: success, error, warning, info
- 📍 **6 positions**: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
- ⏱️ **Auto-dismiss** with progress bar
- ⏸️ **Pause on hover**
- 👆 **Swipe to dismiss** (mobile)
- 🔄 **Promise toasts**: loading → success/error
- 🔘 **Action buttons** in toasts
- ⌨️ **Keyboard support** (Escape to dismiss)
- 📚 **Toast stacking/limit**
- 🎨 **Headless design**: bring your own styles
- 🔷 **Full TypeScript support**

## Installation

```bash
npm install @input-kit/toast
# or
yarn add @input-kit/toast
# or
pnpm add @input-kit/toast
```

## Quick Start

### 1. Wrap your app with ToastProvider

```tsx
import { ToastProvider } from '@input-kit/toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

### 2. Use the useToast hook

```tsx
import { useToast } from '@input-kit/toast';

function MyComponent() {
  const { success, error, info, warning, promise } = useToast();

  const handleClick = () => {
    success('Operation completed!');
  };

  const handleSave = async () => {
    await promise(saveData(), {
      loading: 'Saving...',
      success: 'Saved successfully!',
      error: 'Failed to save',
    });
  };

  return (
    <>
      <button onClick={handleClick}>Show Success</button>
      <button onClick={handleSave}>Save Data</button>
    </>
  );
}
```

## API Reference

### ToastProvider

```tsx
<ToastProvider
  maxToasts={10}           // Maximum number of toasts shown at once
  defaultDuration={3000}   // Default duration in ms
  defaultPosition="bottom-right"  // Default position
  reverseOrder={false}     // Reverse toast order
  gutter={8}              // Gap between toasts in px
  containerStyle={{}}      // Custom container styles
  toastStyle={{}}          // Custom toast styles
>
  {children}
</ToastProvider>
```

### useToast Hook

```tsx
const toast = useToast();

// Basic toasts
toast.success(message, options?);
toast.error(message, options?);
toast.warning(message, options?);
toast.info(message, options?);
toast.custom(message, options?);

// Promise toast
await toast.promise(promise, {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error!',
});

// Dismiss
toast.dismiss(toastId);
toast.dismissAll();
```

### Toast Options

```tsx
interface ToastOptions {
  id?: string;              // Custom ID
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;           // Toast title
  duration?: number;        // Duration in ms (0 = infinite)
  position?: ToastPosition; // Toast position
  action?: {                // Action button
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  onDismiss?: () => void;   // Callback on dismiss
  onAutoClose?: () => void; // Callback on auto-close
}
```

### Positions

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

### Standalone Usage (Outside React)

```tsx
import { toast } from '@input-kit/toast';

// Can be used outside React components
toast.success('Hello!');
toast.error('Something went wrong');
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed!',
});
```

## Styling

The library is headless - you provide your own styles. Each toast has CSS classes you can target:

```css
.toast {
  /* Base toast styles */
}

.toast--success { /* Success variant */ }
.toast--error { /* Error variant */ }
.toast--warning { /* Warning variant */ }
.toast--info { /* Info variant */ }

.toast--entering { /* Enter animation */ }
.toast--exiting { /* Exit animation */ }

.toast__icon { /* Icon element */ }
.toast__content { /* Content wrapper */ }
.toast__title { /* Title element */ }
.toast__message { /* Message element */ }
.toast__action { /* Action button */ }
.toast__close { /* Close button */ }
.toast__progress { /* Progress bar container */ }
.toast__progress-bar { /* Progress bar fill */ }
```

### Example Custom Styles

```tsx
<ToastProvider
  toastStyle={{
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  }}
/>
```

## Examples

### With Action Button

```tsx
toast.success('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => {
      // Undo the deletion
      restoreItem();
    },
  },
});
```

### Custom Duration

```tsx
toast.info('This will stay for 10 seconds', {
  duration: 10000,
});

// Infinite duration (manual dismiss only)
toast.error('Critical error!', {
  duration: 0,
});
```

### Different Positions

```tsx
toast.success('Top right toast', { position: 'top-right' });
toast.error('Bottom center toast', { position: 'bottom-center' });
```

### Promise with Dynamic Messages

```tsx
await toast.promise(
  fetchUser(userId),
  {
    loading: 'Loading user...',
    success: (user) => `Welcome, ${user.name}!`,
    error: (err) => `Failed: ${err.message}`,
  }
);
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { ToastOptions, ToastPosition, ToastType } from '@input-kit/toast';
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+

## License

MIT
