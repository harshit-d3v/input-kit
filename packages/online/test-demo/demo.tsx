/**
 * Demo/Test file for @input-kit/online
 * 
 * This file demonstrates how to use the online status hook
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState, useEffect } from 'react';

// SVG Icon Component (Lucide-style)
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const WifiIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const WifiOffIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M1 1l22 22" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 22 12.55" />
    <path d="M5 12.55a11 11 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22 9" />
    <path d="M6.23 6.26A15.95 15.95 0 0 0 2 9" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <path d="M12 20h.01" />
  </svg>
);

const RefreshIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
  </svg>
);

const UploadIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SaveIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const BookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

// Simple online status hook implementation for demo
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Demo 1: Basic Online Status
function BasicExample() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <h3>Basic Online Status</h3>
      <div
        style={{
          padding: '30px',
          borderRadius: '12px',
          background: isOnline ? '#dcfce7' : '#fef2f2',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {isOnline ? <WifiIcon size={48} /> : <WifiOffIcon size={48} />}
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: isOnline ? '#166534' : '#991b1b',
          }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </div>
        <p style={{ color: '#666', marginTop: '10px' }}>
          {isOnline
            ? 'You are connected to the internet'
            : 'No internet connection detected'}
        </p>
      </div>
    </div>
  );
}

// Demo 2: Status Banner
function BannerExample() {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return (
      <div>
        <h3>Offline Banner</h3>
        <div
          style={{
            padding: '15px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            color: '#166534',
          }}
        >
          <CheckIcon size={16} /> You're online! Disconnect your network to see the offline banner.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Offline Banner</h3>
      <div
        style={{
          padding: '15px',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b' }}>
          <span><AlertIcon size={16} /></span>
          <span>You're offline. Some features may not be available.</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#991b1b',
            fontSize: '18px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Demo 3: Sync Status Indicator
function SyncIndicatorExample() {
  const isOnline = useOnlineStatus();
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const addChange = () => {
    setPendingChanges((p) => p + 1);
  };

  const syncNow = async () => {
    if (!isOnline || pendingChanges === 0) return;
    
    setSyncing(true);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPendingChanges(0);
    setSyncing(false);
  };

  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      syncNow();
    }
  }, [isOnline]);

  return (
    <div>
      <h3>Sync Status Indicator</h3>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div
          style={{
            flex: 1,
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <button
            onClick={addChange}
            style={{ padding: '10px 20px', marginBottom: '15px' }}
          >
            Make a Change
          </button>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Pending changes: {pendingChanges}
          </div>
        </div>
        <div
          style={{
            padding: '20px',
            background: syncing ? '#fef3c7' : isOnline ? '#f0fdf4' : '#fef2f2',
            borderRadius: '12px',
            minWidth: '150px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>
            {syncing ? <RefreshIcon size={24} /> : isOnline ? <CheckIcon size={24} /> : <WifiOffIcon size={24} />}
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color: syncing ? '#92400e' : isOnline ? '#166534' : '#991b1b',
            }}
          >
            {syncing ? 'Syncing...' : isOnline ? 'Synced' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo 4: Online History
function HistoryExample() {
  const isOnline = useOnlineStatus();
  const [history, setHistory] = useState<{ time: Date; status: boolean }[]>([]);

  useEffect(() => {
    setHistory((h) => [...h, { time: new Date(), status: isOnline }].slice(-10));
  }, [isOnline]);

  return (
    <div>
      <h3>Connection History</h3>
      <div
        style={{
          padding: '15px',
          background: '#f8fafc',
          borderRadius: '8px',
          maxHeight: '200px',
          overflow: 'auto',
        }}
      >
        {history.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No connection changes yet</p>
        ) : (
          history
            .slice()
            .reverse()
            .map((entry, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: entry.status ? '#10b981' : '#ef4444' }}>
                  {entry.status ? 'Online' : 'Offline'}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {entry.time.toLocaleTimeString()}
                </span>
              </div>
            ))
        )}
      </div>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Toggle your network connection to see history updates
      </p>
    </div>
  );
}

// Demo 5: Conditional Feature
function ConditionalFeatureExample() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <h3>Conditional Features</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div
          style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}><UploadIcon size={24} /></div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Upload</div>
          <button
            disabled={!isOnline}
            style={{
              padding: '8px 16px',
              opacity: isOnline ? 1 : 0.5,
              cursor: isOnline ? 'pointer' : 'not-allowed',
            }}
          >
            {isOnline ? 'Upload File' : 'Unavailable Offline'}
          </button>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}><SaveIcon size={24} /></div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Save Draft</div>
          <button style={{ padding: '8px 16px' }}>
            Save Locally (Always Available)
          </button>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}><RefreshIcon size={24} /></div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Refresh Data</div>
          <button
            disabled={!isOnline}
            style={{
              padding: '8px 16px',
              opacity: isOnline ? 1 : 0.5,
              cursor: isOnline ? 'pointer' : 'not-allowed',
            }}
          >
            {isOnline ? 'Refresh' : 'Unavailable Offline'}
          </button>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}><BookIcon size={24} /></div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Read Cached</div>
          <button style={{ padding: '8px 16px' }}>
            View Content (Cached)
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/online Demo</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Try disconnecting your network to see the offline states
      </p>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <BannerExample />
      <hr style={{ margin: '30px 0' }} />
      
      <SyncIndicatorExample />
      <hr style={{ margin: '30px 0' }} />
      
      <HistoryExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ConditionalFeatureExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, BannerExample, SyncIndicatorExample, HistoryExample, ConditionalFeatureExample };

// Default export
export default DemoApp;
