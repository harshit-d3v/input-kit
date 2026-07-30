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

  // Tracks the ancestors of the value currently being rendered. Without it a cyclic
  // object recursed until the stack overflowed and took the whole app down.
  const renderValue = (
    value: unknown,
    key?: string,
    depth = 0,
    ancestors: readonly object[] = []
  ): React.ReactNode => {
    const type = value === null ? 'null' : typeof value;

    if (value !== null && typeof value === 'object') {
      if (ancestors.includes(value as object)) {
        return (
          <span style={{ color: colors.null, opacity: 0.8 }}>
            {key && <span style={{ color: colors.key }}>{key}: </span>}
            [Circular]
          </span>
        );
      }
    }

    const nextAncestors =
      value !== null && typeof value === 'object'
        ? [...ancestors, value as object]
        : ancestors;

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
          renderValue={(v, k, d) => renderValue(v, k, d, nextAncestors)}
        />
      );
    }

    if (type === 'object') {
      // Date, Map, Set and RegExp all satisfy `typeof === 'object'` but expose no
      // own enumerable keys, so they used to render as an empty `{0 keys}`.
      if (
        value instanceof Date ||
        value instanceof RegExp ||
        value instanceof Map ||
        value instanceof Set
      ) {
        return (
          <span style={{ color: colors.string }}>
            {key && <span style={{ color: colors.key }}>{key}: </span>}
            {value instanceof Date ? value.toISOString() : String(value)}
            {displayDataTypes && (
              <span style={{ opacity: 0.5 }}> ({value.constructor.name})</span>
            )}
          </span>
        );
      }

      return (
        <JSONObject
          data={value as Record<string, unknown>}
          keyName={key}
          depth={depth}
          collapsed={collapsed}
          displayObjectSize={displayObjectSize}
          colors={colors}
          renderValue={(v, k, d) => renderValue(v, k, d, nextAncestors)}
        />
      );
    }

    // `undefined` reaches here; render the key so the row is not silently blank.
    if (type === 'undefined') {
      return (
        <span style={{ color: colors.null, opacity: 0.7 }}>
          {key && <span style={{ color: colors.key }}>{key}: </span>}
          undefined
        </span>
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
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        {keyName && <span style={{ color: colors.key }}>{keyName}: </span>}
        {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />} [{displayObjectSize && `${data.length} items`}]
      </button>
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
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        {keyName && <span style={{ color: colors.key }}>{keyName}: </span>}
        {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />} {'{'}{displayObjectSize && `${keys.length} keys`}{'}'}
      </button>
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
