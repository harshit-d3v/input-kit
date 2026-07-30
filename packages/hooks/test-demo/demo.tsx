/**
 * Demo/Test file for @input-kit/hooks
 * 
 * This file demonstrates how to use the hooks collection
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState } from 'react';
import {
  useDebounce,
  useThrottle,
  useLocalStorage,
  useMediaQuery,
  usePrevious,
  useCountdown,
  useNetworkStatus,
  useClipboard,
  useClickOutside,
  useKeyPressState,
} from '../src/index';

// Demo 1: useDebounce
function DebounceExample() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);

  return (
    <div>
      <h3>useDebounce</h3>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        style={{ padding: '10px', width: '100%' }}
      />
      <p>Immediate value: {value}</p>
      <p>Debounced value (500ms): {debouncedValue}</p>
    </div>
  );
}

// Demo 2: useThrottle
function ThrottleExample() {
  const [clickCount, setClickCount] = useState(0);
  const [throttledCount, setThrottledCount] = useState(0);

  // useThrottle throttles a *function*: at most one call per second, plus a
  // trailing call carrying whatever the last value was.
  const publish = useThrottle((value: number) => setThrottledCount(value), 1000);

  const handleClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    publish(next);
  };

  return (
    <div>
      <h3>useThrottle</h3>
      <button onClick={handleClick} style={{ padding: '10px 20px' }}>
        Click me fast!
      </button>
      <p>Total clicks: {clickCount}</p>
      <p>Throttled count (1s): {throttledCount}</p>
    </div>
  );
}

// Demo 3: useLocalStorage
function LocalStorageExample() {
  const [name, setName] = useLocalStorage('demo-name', '');
  const [theme, setTheme] = useLocalStorage('demo-theme', 'light');

  return (
    <div>
      <h3>useLocalStorage</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (persisted)"
        style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
      />
      <div>
        <label>
          <input
            type="radio"
            value="light"
            checked={theme === 'light'}
            onChange={(e) => setTheme(e.target.value)}
          />{' '}
          Light
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input
            type="radio"
            value="dark"
            checked={theme === 'dark'}
            onChange={(e) => setTheme(e.target.value)}
          />{' '}
          Dark
        </label>
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Values are persisted in localStorage. Refresh the page to see!
      </p>
    </div>
  );
}

// Demo 4: useMediaQuery
function MediaQueryExample() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div>
      <h3>useMediaQuery</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>Mobile (≤768px): {isMobile ? 'Yes' : 'No'}</li>
        <li>Tablet (769-1024px): {isTablet ? 'Yes' : 'No'}</li>
        <li>Desktop (≥1025px): {isDesktop ? 'Yes' : 'No'}</li>
        <li>Prefers dark mode: {prefersDark ? 'Yes' : 'No'}</li>
      </ul>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Resize the window to see changes
      </p>
    </div>
  );
}

// Demo 5: usePrevious
function PreviousExample() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <h3>usePrevious</h3>
      <button onClick={() => setCount((c) => c + 1)} style={{ padding: '10px 20px' }}>
        Increment
      </button>
      <p>Current: {count}</p>
      <p>Previous: {prevCount ?? 'N/A'}</p>
    </div>
  );
}

// Demo 6: useCountdown
function CountdownExample() {
  const { timeLeft, start, pause, reset, isRunning } = useCountdown(10);

  return (
    <div>
      <h3>useCountdown</h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
        {timeLeft}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={start} disabled={isRunning} style={{ padding: '10px 20px' }}>
          Start
        </button>
        <button onClick={pause} disabled={!isRunning} style={{ padding: '10px 20px' }}>
          Pause
        </button>
        <button onClick={reset} style={{ padding: '10px 20px' }}>
          Reset
        </button>
      </div>
    </div>
  );
}

// Demo 7: useNetworkStatus
function NetworkStatusExample() {
  const { online, downlink, type } = useNetworkStatus();

  return (
    <div>
      <h3>useNetworkStatus</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>Online: {online ? 'Connected' : 'Offline'}</li>
        <li>Connection type: {type || 'Unknown'}</li>
        <li>Downlink: {downlink ? `${downlink} Mbps` : 'Unknown'}</li>
      </ul>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Try toggling your network connection
      </p>
    </div>
  );
}

// Demo 8: useClipboard
function ClipboardExample() {
  const { copy, copied, value } = useClipboard(2000);

  return (
    <div>
      <h3>useClipboard</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => copy('Hello from useClipboard!')}
          style={{ padding: '10px 20px' }}
        >
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button
          onClick={() => copy(new Date().toISOString())}
          style={{ padding: '10px 20px' }}
        >
          Copy Timestamp
        </button>
      </div>
      {value && (
        <p style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' }}>
          Last copied: {value}
        </p>
      )}
    </div>
  );
}

// Demo 9: useClickOutside
function ClickOutsideExample() {
  const [isOpen, setIsOpen] = useState(false);

  // The hook owns the ref and hands it back — attach it to whatever counts as
  // "inside". Listening only while open avoids the click that opens it also
  // closing it.
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false), { enabled: isOpen });

  return (
    <div>
      <h3>useClickOutside</h3>
      <button onClick={() => setIsOpen(true)} style={{ padding: '10px 20px' }}>
        Open Popup
      </button>
      {isOpen && (
        <div
          ref={ref}
          style={{
            marginTop: '10px',
            padding: '20px',
            background: '#f0f0f0',
            borderRadius: '8px',
            border: '2px solid #3b82f6',
          }}
        >
          Click outside this box to close it
        </div>
      )}
    </div>
  );
}

// Demo 10: useKeyPress
function KeyPressExample() {
  // useKeyPressState reports whether a key is *currently held*. Use useKeyPress
  // when you want to react to the press instead.
  const isEnterPressed = useKeyPressState('Enter');
  const isEscapePressed = useKeyPressState('Escape');
  const isSpacePressed = useKeyPressState(' ');

  return (
    <div>
      <h3>useKeyPress</h3>
      <p>Press keys to see them highlight:</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <div
          style={{
            padding: '20px',
            background: isEnterPressed ? '#10b981' : '#f0f0f0',
            color: isEnterPressed ? '#fff' : '#000',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Enter
        </div>
        <div
          style={{
            padding: '20px',
            background: isEscapePressed ? '#ef4444' : '#f0f0f0',
            color: isEscapePressed ? '#fff' : '#000',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Escape
        </div>
        <div
          style={{
            padding: '20px',
            background: isSpacePressed ? '#3b82f6' : '#f0f0f0',
            color: isSpacePressed ? '#fff' : '#000',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Space
        </div>
      </div>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/hooks Demo</h1>
      
      <DebounceExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ThrottleExample />
      <hr style={{ margin: '30px 0' }} />
      
      <LocalStorageExample />
      <hr style={{ margin: '30px 0' }} />
      
      <MediaQueryExample />
      <hr style={{ margin: '30px 0' }} />
      
      <PreviousExample />
      <hr style={{ margin: '30px 0' }} />
      
      <CountdownExample />
      <hr style={{ margin: '30px 0' }} />
      
      <NetworkStatusExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ClipboardExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ClickOutsideExample />
      <hr style={{ margin: '30px 0' }} />
      
      <KeyPressExample />
    </div>
  );
}

// Export individual examples for testing
export {
  DebounceExample,
  ThrottleExample,
  LocalStorageExample,
  MediaQueryExample,
  PreviousExample,
  CountdownExample,
  NetworkStatusExample,
  ClipboardExample,
  ClickOutsideExample,
  KeyPressExample,
};

// Default export
export default DemoApp;
