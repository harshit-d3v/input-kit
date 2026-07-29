// @input-kit/paste - Clipboard paste handling

import { useState, useCallback, useEffect, useRef } from 'react';

// Types
export interface PasteData {
  text?: string;
  html?: string;
  files?: File[];
  images?: File[];
  items?: DataTransferItem[];
}

export interface UsePasteOptions {
  onPaste?: (data: PasteData) => void;
  onPasteText?: (text: string) => void;
  onPasteFiles?: (files: File[]) => void;
  onPasteImages?: (images: File[]) => void;
  enabled?: boolean;
  preventDefault?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

export interface UsePasteReturn {
  lastPaste: PasteData | null;
  isPasting: boolean;
  pasteFromClipboard: () => Promise<PasteData | null>;
  clearLastPaste: () => void;
}

export interface PasteZoneProps {
  onPaste?: (data: PasteData) => void;
  onPasteText?: (text: string) => void;
  onPasteFiles?: (files: File[]) => void;
  onPasteImages?: (images: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showIndicator?: boolean;
}

interface PasteCallbacks {
  onPaste?: (data: PasteData) => void;
  onPasteText?: (text: string) => void;
  onPasteFiles?: (files: File[]) => void;
  onPasteImages?: (images: File[]) => void;
}

// Utility functions
function extractPasteData(e: ClipboardEvent): PasteData {
  const data: PasteData = {};
  const clipboardData = e.clipboardData;
  
  if (!clipboardData) return data;
  
  // Get text
  data.text = clipboardData.getData('text/plain') || undefined;
  
  // Get HTML
  data.html = clipboardData.getData('text/html') || undefined;
  
  // Get files and images
  const files: File[] = [];
  const images: File[] = [];
  const items: DataTransferItem[] = [];
  
  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i];
    items.push(item);
    
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
        if (file.type.startsWith('image/')) {
          images.push(file);
        }
      }
    }
  }
  
  if (files.length > 0) data.files = files;
  if (images.length > 0) data.images = images;
  if (items.length > 0) data.items = items;
  
  return data;
}

async function readClipboard(): Promise<PasteData> {
  const data: PasteData = {};

  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return data;
  }
  
  try {
    // Read text
    if (typeof navigator.clipboard.readText === 'function') {
      try {
        data.text = await navigator.clipboard.readText();
      } catch {
        // Text read not permitted
      }
    }
    
    // Read files/images
    if (typeof navigator.clipboard.read === 'function') {
      try {
        const clipboardItems = await navigator.clipboard.read();
        const files: File[] = [];
        const images: File[] = [];
        
        for (const item of clipboardItems) {
          for (const type of item.types) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-${Date.now()}`, { type });
            files.push(file);
            
            if (type.startsWith('image/')) {
              images.push(file);
            }
          }
        }
        
        if (files.length > 0) data.files = files;
        if (images.length > 0) data.images = images;
      } catch {
        // Clipboard read not permitted
      }
    }
  } catch {
    return data;
  }
  
  return data;
}

function filterByType(files: File[], acceptedTypes?: string[]): File[] {
  if (!acceptedTypes || acceptedTypes.length === 0) return files;
  
  return files.filter(file => {
    return acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });
  });
}

function filterBySize(files: File[], maxSize?: number): File[] {
  if (!maxSize) return files;
  return files.filter(file => file.size <= maxSize);
}

function finalizePasteData(
  data: PasteData,
  acceptedTypes?: string[],
  maxFileSize?: number
): PasteData {
  const nextData: PasteData = { ...data };

  if (nextData.files) {
    nextData.files = filterBySize(filterByType(nextData.files, acceptedTypes), maxFileSize);
  }

  if (nextData.images) {
    nextData.images = filterBySize(filterByType(nextData.images, acceptedTypes), maxFileSize);
  }

  return nextData;
}

function dispatchPasteCallbacks(data: PasteData, callbacks: PasteCallbacks) {
  callbacks.onPaste?.(data);

  if (data.text) {
    callbacks.onPasteText?.(data.text);
  }

  if (data.files && data.files.length > 0) {
    callbacks.onPasteFiles?.(data.files);
  }

  if (data.images && data.images.length > 0) {
    callbacks.onPasteImages?.(data.images);
  }
}

// Hook
export function usePaste(options: UsePasteOptions = {}): UsePasteReturn {
  const {
    onPaste,
    onPasteText,
    onPasteFiles,
    onPasteImages,
    enabled = true,
    preventDefault = true,
    acceptedTypes,
    maxFileSize,
  } = options;
  
  const [lastPaste, setLastPaste] = useState<PasteData | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!enabled) return;
    
    if (preventDefault) {
      e.preventDefault();
    }
    
    const data = finalizePasteData(extractPasteData(e), acceptedTypes, maxFileSize);
    
    setLastPaste(data);

    dispatchPasteCallbacks(data, {
      onPaste,
      onPasteText,
      onPasteFiles,
      onPasteImages,
    });
  }, [enabled, preventDefault, acceptedTypes, maxFileSize, onPaste, onPasteText, onPasteFiles, onPasteImages]);
  
  // Global paste listener
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    
    document.addEventListener('paste', handlePaste as EventListener);
    return () => document.removeEventListener('paste', handlePaste as EventListener);
  }, [enabled, handlePaste]);
  
  const pasteFromClipboard = useCallback(async (): Promise<PasteData | null> => {
    if (!enabled) return null;
    
    setIsPasting(true);
    
    try {
      const data = finalizePasteData(await readClipboard(), acceptedTypes, maxFileSize);
      
      setLastPaste(data);

      dispatchPasteCallbacks(data, {
        onPaste,
        onPasteText,
        onPasteFiles,
        onPasteImages,
      });
      
      return data;
    } catch {
      return null;
    } finally {
      setIsPasting(false);
    }
  }, [enabled, acceptedTypes, maxFileSize, onPaste, onPasteText, onPasteFiles, onPasteImages]);
  
  const clearLastPaste = useCallback(() => {
    setLastPaste(null);
  }, []);
  
  return {
    lastPaste,
    isPasting,
    pasteFromClipboard,
    clearLastPaste,
  };
}

// Hook for paste within a specific element
export function usePasteZone(
  elementRef: React.RefObject<HTMLElement>,
  options: UsePasteOptions = {}
): UsePasteReturn {
  const {
    onPaste,
    onPasteText,
    onPasteFiles,
    onPasteImages,
    enabled = true,
    preventDefault = true,
    acceptedTypes,
    maxFileSize,
  } = options;
  
  const [lastPaste, setLastPaste] = useState<PasteData | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!enabled) return;
    
    if (preventDefault) {
      e.preventDefault();
    }
    
    const data = finalizePasteData(extractPasteData(e), acceptedTypes, maxFileSize);
    
    setLastPaste(data);

    dispatchPasteCallbacks(data, {
      onPaste,
      onPasteText,
      onPasteFiles,
      onPasteImages,
    });
  }, [enabled, preventDefault, acceptedTypes, maxFileSize, onPaste, onPasteText, onPasteFiles, onPasteImages]);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;
    
    element.addEventListener('paste', handlePaste as EventListener);
    return () => element.removeEventListener('paste', handlePaste as EventListener);
  }, [elementRef, enabled, handlePaste]);
  
  const pasteFromClipboard = useCallback(async (): Promise<PasteData | null> => {
    if (!enabled) return null;

    setIsPasting(true);

    try {
      const data = finalizePasteData(await readClipboard(), acceptedTypes, maxFileSize);

      setLastPaste(data);

      dispatchPasteCallbacks(data, {
        onPaste,
        onPasteText,
        onPasteFiles,
        onPasteImages,
      });

      return data;
    } catch {
      return null;
    } finally {
      setIsPasting(false);
    }
  }, [enabled, acceptedTypes, maxFileSize, onPaste, onPasteText, onPasteFiles, onPasteImages]);
  
  const clearLastPaste = useCallback(() => setLastPaste(null), []);
  
  return { lastPaste, isPasting, pasteFromClipboard, clearLastPaste };
}

// Component
export function PasteZone({
  onPaste,
  onPasteText,
  onPasteFiles,
  onPasteImages,
  acceptedTypes,
  maxFileSize,
  disabled = false,
  children,
  className,
  style,
  showIndicator = true,
}: PasteZoneProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  usePasteZone(zoneRef, {
    onPaste,
    onPasteText,
    onPasteFiles,
    onPasteImages,
    enabled: !disabled,
    acceptedTypes,
    maxFileSize,
  });
  
  return (
    <div
      ref={zoneRef}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={className}
      style={{
        outline: 'none',
        position: 'relative',
        ...style,
      }}
    >
      {children}
      {showIndicator && isFocused && !disabled && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            padding: '4px 8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
          }}
        >
          Press Ctrl+V to paste
        </div>
      )}
    </div>
  );
}

// Utility to read image from paste as data URL
export async function pasteImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility to read text from clipboard
export async function readTextFromClipboard(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
    return null;
  }

  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

// Utility to check if clipboard has images
export async function clipboardHasImage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
    return false;
  }

  try {
    const items = await navigator.clipboard.read();
    return items.some(item => 
      item.types.some(type => type.startsWith('image/'))
    );
  } catch {
    return false;
  }
}
