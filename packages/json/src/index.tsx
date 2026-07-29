// @input-kit/json - JSON viewer component

import React, { useState, useEffect, useRef, useCallback } from 'react';

// SVG Icon Components (Lucide-style)
const ChevronRightIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface JSONViewerProps {
  data: unknown;
  collapsed?: boolean;
  collapseStringsAfterLength?: number;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  enableClipboard?: boolean;
  theme?: 'light' | 'dark';
}

const styles = {
  container: {
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  light: {
    background: '#fff',
    string: '#0d7377',
    number: '#d19a66',
    boolean: '#c678dd',
    null: '#c678dd',
    key: '#e06c75',
  },
  dark: {
    background: '#1e1e1e',
    string: '#9cdcfe',
    number: '#b5cea8',
    boolean: '#569cd6',
    null: '#569cd6',
    key: '#9cdcfe',
  },
};

export function JSONViewer({
  data,
  collapsed = false,
  collapseStringsAfterLength,
  displayDataTypes = true,
  displayObjectSize = true,
  enableClipboard = false,
  theme = 'light',
}: JSONViewerProps): React.ReactElement {
  const colors = styles[theme];
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!enableClipboard || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formatJSON(data));
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  }, [data, enableClipboard]);

  const renderValue = (value: unknown, key?: string, depth = 0): React.ReactNode => {
    const type = value === null ? 'null' : typeof value;

    if (type === 'string') {
      const stringValue = String(value);
      const shouldTruncate =
        typeof collapseStringsAfterLength === 'number' &&
        collapseStringsAfterLength > 0 &&
        stringValue.length > collapseStringsAfterLength;
      const displayValue = shouldTruncate
        ? `${stringValue.slice(0, collapseStringsAfterLength)}...`
        : stringValue;

      return (
        <span style={{ color: colors.string }} title={shouldTruncate ? stringValue : undefined}>
          {key && <span style={{ color: colors.key }}>{key}: </span>}
          "{displayValue}"
          {displayDataTypes && <span style={{ opacity: 0.5 }}> (string)</span>}
        </span>
      );
    }

    if (type === 'number') {
      return (
        <span style={{ color: colors.number }}>
          {key && <span style={{ color: colors.key }}>{key}: </span>}
          {String(value)}
          {displayDataTypes && <span style={{ opacity: 0.5 }}> (number)</span>}
        </span>
      );
    }

    if (type === 'boolean') {
      return (
        <span style={{ color: colors.boolean }}>
          {key && <span style={{ color: colors.key }}>{key}: </span>}
          {String(value)}
          {displayDataTypes && <span style={{ opacity: 0.5 }}> (boolean)</span>}
        </span>
      );
    }

    if (type === 'null') {
      return (
        <span style={{ color: colors.null }}>
          {key && <span style={{ color: colors.key }}>{key}: </span>}
          null
          {displayDataTypes && <span style={{ opacity: 0.5 }}> (null)</span>}
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <JSONArray
          data={value}
          keyName={key}
          depth={depth}
          collapsed={collapsed}
          displayObjectSize={displayObjectSize}
          colors={colors}
          renderValue={renderValue}
        />
      );
    }

    if (type === 'object') {
      return (
        <JSONObject
          data={value as Record<string, unknown>}
          keyName={key}
          depth={depth}
          collapsed={collapsed}
          displayObjectSize={displayObjectSize}
          colors={colors}
          renderValue={renderValue}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ ...styles.container, backgroundColor: colors.background, padding: '10px' }}>
      {enableClipboard && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: colors.background,
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
            }}
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
      )}
      {renderValue(data)}
    </div>
  );
}

interface JSONArrayProps {
  data: unknown[];
  keyName?: string;
  depth: number;
  collapsed: boolean;
  displayObjectSize: boolean;
  colors: Record<string, string>;
  renderValue: (value: unknown, key?: string, depth?: number) => React.ReactNode;
}

function JSONArray({ data, keyName, depth, collapsed, displayObjectSize, colors, renderValue }: JSONArrayProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed && depth > 0);

  useEffect(() => {
    setIsCollapsed(collapsed && depth > 0);
  }, [collapsed, depth]);

  return (
    <div>
      <span onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
        {keyName && <span style={{ color: colors.key }}>{keyName}: </span>}
        {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />} [{displayObjectSize && `${data.length} items`}]
      </span>
      {!isCollapsed && (
        <div style={{ marginLeft: 20 }}>
          {data.map((item, index) => (
            <div key={index}>
              {renderValue(item, String(index), depth + 1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface JSONObjectProps {
  data: Record<string, unknown>;
  keyName?: string;
  depth: number;
  collapsed: boolean;
  displayObjectSize: boolean;
  colors: Record<string, string>;
  renderValue: (value: unknown, key?: string, depth?: number) => React.ReactNode;
}

function JSONObject({ data, keyName, depth, collapsed, displayObjectSize, colors, renderValue }: JSONObjectProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed && depth > 0);
  const keys = Object.keys(data);

  useEffect(() => {
    setIsCollapsed(collapsed && depth > 0);
  }, [collapsed, depth]);

  return (
    <div>
      <span onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
        {keyName && <span style={{ color: colors.key }}>{keyName}: </span>}
        {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />} {'{'}{displayObjectSize && `${keys.length} keys`}{'}'}
      </span>
      {!isCollapsed && (
        <div style={{ marginLeft: 20 }}>
          {keys.map((k) => (
            <div key={k}>
              {renderValue(data[k], k, depth + 1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function formatJSON(data: unknown, indent = 2): string {
  return JSON.stringify(data, null, indent);
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
