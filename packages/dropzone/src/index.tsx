// @input-kit/dropzone - File dropzone component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  DragEvent,
  ChangeEvent,
  ReactNode,
} from 'react';

// SVG Icon Components (Lucide-style)
const FileIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const FolderIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const DownloadIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Types
export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export interface UseDropzoneOptions {
  accept?: string | string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  onDropAccepted?: (files: File[]) => void;
  onDropRejected?: (rejections: FileRejection[]) => void;
  validator?: (file: File) => FileRejection | null;
}

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export interface FileError {
  code: 'file-too-large' | 'file-invalid-type' | 'too-many-files' | 'custom';
  message: string;
}

export interface UseDropzoneReturn {
  /** Files that passed validation, in the order they were accepted. */
  files: FileWithPreview[];
  /** Files rejected by the most recent drop, each with the reasons why. */
  rejectedFiles: FileRejection[];
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  getRootProps: () => {
    onDragEnter: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    tabIndex: number;
    role: 'button';
    'aria-label': string;
  };
  getInputProps: () => {
    type: 'file';
    accept?: string;
    multiple?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    style: React.CSSProperties;
    ref: React.RefObject<HTMLInputElement>;
  };
  open: () => void;
  removeFile: (id: string) => void;
  /** Remove all accepted files and clear any rejections. */
  clearFiles: () => void;
  /** Clear rejections only, leaving accepted files in place. */
  clearRejections: () => void;
}

export interface DropzoneProps {
  accept?: string | string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (files: File[]) => void;
  onRemove?: (file: FileWithPreview) => void;
  showPreview?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode | ((state: { isDragActive: boolean }) => ReactNode);
}

// Utilities
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidFileType(file: File, accept?: string | string[]): boolean {
  if (!accept) return true;

  const acceptArray = Array.isArray(accept) ? accept : accept.split(',').map(s => s.trim());

  return acceptArray.some(type => {
    if (type.startsWith('.')) {
      // `name` is absent during drag events, where only the MIME type is exposed.
      // Reading it unguarded threw a TypeError on dragenter in Chrome — the one
      // browser that does populate `DataTransferItem.type` — whenever `accept`
      // used extensions. An extension rule simply cannot be evaluated without a
      // filename, so treat it as "not yet known" rather than crashing.
      if (!file.name) return false;
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });
}

function createFileWithPreview(file: File): FileWithPreview {
  // Explicitly assign new properties onto the File object (standard pattern,
  // used by react-dropzone as well). File extends Blob which is a platform
  // object, so we can't structurally clone it — we have to augment in place.
  return Object.assign(file, {
    id: generateId(),
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
  }) as FileWithPreview;
}

// Hook
export function useDropzone(options: UseDropzoneOptions = {}): UseDropzoneReturn {
  const {
    accept,
    maxSize = Infinity,
    maxFiles = Infinity,
    multiple = true,
    disabled = false,
    onDrop,
    onDropAccepted,
    onDropRejected,
    validator,
  } = options;

  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  // Rejections were previously computed and handed to onDropRejected, then thrown
  // away. Callers that want to render "3 files were rejected, here is why" should not
  // have to mirror that into their own state.
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragAccept, setIsDragAccept] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  // Keep a ref to the latest files so the unmount cleanup can revoke object URLs
  // without needing files in the effect dependency array.
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];

    newFiles.forEach(file => {
      const errors: FileError[] = [];

      // Check file type
      if (!isValidFileType(file, accept)) {
        errors.push({
          code: 'file-invalid-type',
          message: `File type ${file.type || 'unknown'} is not accepted`,
        });
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push({
          code: 'file-too-large',
          message: `File is larger than ${formatFileSize(maxSize)}`,
        });
      }

      // Check max files
      if (files.length + accepted.length >= maxFiles) {
        errors.push({
          code: 'too-many-files',
          message: `Maximum ${maxFiles} files allowed`,
        });
      }

      // Custom validator
      if (validator) {
        const customRejection = validator(file);
        if (customRejection) {
          errors.push(...customRejection.errors);
        }
      }

      if (errors.length > 0) {
        rejected.push({ file, errors });
      } else {
        accepted.push(file);
      }
    });

    // Add accepted files
    if (accepted.length > 0) {
      const newFilesWithPreview = accepted.map(createFileWithPreview);
      setFiles(prev => {
        if (multiple) return [...prev, ...newFilesWithPreview];
        // Single-file mode replaces the list wholesale, so the outgoing file's
        // object URL has to be revoked here — nothing else will ever see it again.
        prev.forEach(f => {
          if (f.preview && !newFilesWithPreview.some(n => n.preview === f.preview)) {
            URL.revokeObjectURL(f.preview);
          }
        });
        return newFilesWithPreview;
      });
      onDropAccepted?.(accepted);
    }

    // Replace rather than append: rejections describe the most recent drop, so
    // stale ones from an earlier attempt would be misleading.
    setRejectedFiles(rejected);

    if (rejected.length > 0) {
      onDropRejected?.(rejected);
    }

    onDrop?.(accepted, rejected);
  }, [accept, maxSize, maxFiles, multiple, files.length, validator, onDrop, onDropAccepted, onDropRejected]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    setIsDragActive(true);

    const items = Array.from(e.dataTransfer.items).filter(item => item.kind === 'file');

    // Browsers don't expose MIME types during drag events for security reasons
    // (Firefox, Safari always return ''; Chrome exposes them). When no type info
    // is available we cannot determine validity, so default to the accept state.
    const hasTypeInfo = items.some(item => item.type !== '');
    const acceptArray = accept
      ? (Array.isArray(accept) ? accept : accept.split(',').map(s => s.trim()))
      : [];
    // Extension rules need a filename, which a drag event never carries, so drag
    // feedback can only be based on the MIME rules.
    const mimeRules = acceptArray.filter(rule => !rule.startsWith('.'));

    if (!hasTypeInfo || mimeRules.length === 0) {
      setIsDragAccept(true);
      setIsDragReject(false);
    } else {
      const allValid = items.every(item =>
        isValidFileType({ type: item.type, name: '' } as File, mimeRules)
      );
      setIsDragAccept(allValid);
      setIsDragReject(!allValid);
    }
  }, [disabled, accept]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set inactive if leaving the dropzone entirely
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDragActive(false);
      setIsDragAccept(false);
      setIsDragReject(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(false);
    setIsDragAccept(false);
    setIsDragReject(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  const open = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setRejectedFiles([]);
  }, [files]);

  /** Dismiss the rejection messages without touching the accepted files. */
  const clearRejections = useCallback(() => {
    setRejectedFiles([]);
  }, []);

  const getRootProps = useCallback(() => ({
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: disabled ? -1 : 0,
    role: 'button' as const,
    'aria-label': 'File upload area',
  }), [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick, handleKeyDown, disabled]);

  const getInputProps = useCallback(() => ({
    type: 'file' as const,
    accept: Array.isArray(accept) ? accept.join(',') : accept,
    multiple,
    onChange: handleInputChange,
    style: { display: 'none' } as React.CSSProperties,
    ref: inputRef,
  }), [accept, multiple, handleInputChange]);

  return {
    files,
    rejectedFiles,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps,
    open,
    removeFile,
    clearFiles,
    clearRejections,
  };
}

// FilePreview Component
export function FilePreview({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '8px',
        marginTop: '8px',
      }}
    >
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          style={{
            width: '48px',
            height: '48px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      ) : (
        <div
          style={{
            width: '48px',
            height: '48px',
            background: '#e5e7eb',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          <FileIcon size={20} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {formatFileSize(file.size)}
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            color: '#6b7280',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Dropzone Component
export function Dropzone({
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  onDrop,
  onRemove,
  showPreview = true,
  className,
  style,
  children,
}: DropzoneProps) {
  const {
    files,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps,
    removeFile,
  } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
    onDropAccepted: onDrop,
  });

  const handleRemove = (file: FileWithPreview) => {
    removeFile(file.id);
    onRemove?.(file);
  };

  const borderColor = isDragReject 
    ? '#ef4444' 
    : isDragAccept 
      ? '#22c55e' 
      : isDragActive 
        ? '#3b82f6' 
        : '#d1d5db';

  const backgroundColor = isDragActive ? '#f0f9ff' : '#fafafa';

  return (
    <div className={className} style={style}>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          background: backgroundColor,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input {...getInputProps()} />
        
        {typeof children === 'function' ? (
          children({ isDragActive })
        ) : children ? (
          children
        ) : (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
              {isDragActive ? <DownloadIcon size={40} /> : <FolderIcon size={40} />}
            </div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              or click to browse
            </div>
            {(accept || maxSize) && (
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                {accept && <div>Accepted: {Array.isArray(accept) ? accept.join(', ') : accept}</div>}
                {maxSize && <div>Max size: {formatFileSize(maxSize)}</div>}
              </div>
            )}
          </div>
        )}
      </div>
      
      {showPreview && files.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {files.map(file => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => handleRemove(file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export utilities
export { formatFileSize, isValidFileType };
