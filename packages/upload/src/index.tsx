// @input-kit/upload - File upload with progress tracking

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadFile {
  /** Unique identifier */
  id: string;
  /** Original File object */
  file: File;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File MIME type */
  type: string;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: UploadStatus;
  /** Error message if status is 'error' */
  error?: string;
  /** Response data from server */
  response?: unknown;
  /** Preview URL (for images) */
  preview?: string;
  /** XMLHttpRequest instance for abort */
  xhr?: XMLHttpRequest;
  /** Abort function for the active request */
  abort?: () => void;
}

export interface UploadOptions {
  /** Upload endpoint URL */
  url: string;
  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Form field name for the file (default: 'file') */
  fieldName?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Additional form data */
  data?: Record<string, string | Blob>;
  /** With credentials (for CORS) */
  withCredentials?: boolean;
  /** Maximum concurrent uploads (default: 3) */
  maxConcurrent?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed MIME types */
  accept?: string[];
  /** Maximum number of files */
  maxFiles?: number;
  /** Auto upload on file selection (default: true) */
  autoUpload?: boolean;
  /** Callback when upload starts */
  onUploadStart?: (file: UploadFile) => void;
  /** Callback on progress update */
  onProgress?: (file: UploadFile, progress: number) => void;
  /** Callback when upload completes successfully */
  onSuccess?: (file: UploadFile, response: unknown) => void;
  /** Callback when upload fails */
  onError?: (file: UploadFile, error: string) => void;
  /** Callback when all uploads complete */
  onAllComplete?: (files: UploadFile[]) => void;
}

export interface UseUploadOptions extends UploadOptions {}

export interface UseUploadReturn {
  /** List of files */
  files: UploadFile[];
  /** Add files to the queue */
  addFiles: (files: FileList | File[]) => void;
  /** Remove a file from the queue */
  removeFile: (id: string) => void;
  /** Clear all files */
  clearFiles: () => void;
  /** Start uploading all pending files */
  upload: () => Promise<void>;
  /** Start uploading a specific file */
  uploadFile: (id: string) => Promise<void>;
  /** Abort upload for a specific file */
  abortUpload: (id: string) => void;
  /** Abort all uploads */
  abortAll: () => void;
  /** Retry failed upload */
  retryUpload: (id: string) => Promise<void>;
  /** Overall upload progress (0-100) */
  overallProgress: number;
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Whether all uploads are complete */
  isComplete: boolean;
  /** Number of files currently uploading */
  uploadingCount: number;
  /** Number of files pending */
  pendingCount: number;
  /** Number of successful uploads */
  successCount: number;
  /** Number of failed uploads */
  errorCount: number;
  /** Validate a file before adding */
  validateFile: (file: File) => { valid: boolean; error?: string };
}

export interface FileUploadProps {
  /** Upload endpoint URL */
  url: string;
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Form field name for the file */
  fieldName?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Additional form data */
  data?: Record<string, string | Blob>;
  /** Allowed file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Auto upload on selection */
  autoUpload?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Callbacks */
  onUploadStart?: (file: UploadFile) => void;
  onProgress?: (file: UploadFile, progress: number) => void;
  onSuccess?: (file: UploadFile, response: unknown) => void;
  onError?: (file: UploadFile, error: string) => void;
  onAllComplete?: (files: UploadFile[]) => void;
  /** Custom children */
  children?: React.ReactNode | ((props: UseUploadReturn & {
    isDragActive: boolean;
    openFileDialog: () => void;
  }) => React.ReactNode);
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface UploadProgressProps {
  /** The upload file */
  file: UploadFile;
  /** Show preview thumbnail */
  showPreview?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show cancel button */
  showCancel?: boolean;
  /** Show retry button */
  showRetry?: boolean;
  /** Show remove button */
  showRemove?: boolean;
  /** Callbacks */
  onCancel?: () => void;
  onRetry?: () => void;
  onRemove?: () => void;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface UploadListProps {
  /** Upload files */
  files: UploadFile[];
  /** Show previews for images */
  showPreview?: boolean;
  /** Show progress bars */
  showProgress?: boolean;
  /** Callbacks */
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  // Clamped: sizes beyond the table used to index past its end and render
  // "1024 undefined".
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Create preview URL for a file
 */
export function createPreviewUrl(file: File): string | undefined {
  if (isImageFile(file)) {
    return URL.createObjectURL(file);
  }
  return undefined;
}

/**
 * Revoke preview URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Parse accept string into array of MIME types
 */
export function parseAccept(accept: string): string[] {
  return accept.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Check if file matches accept pattern
 */
export function matchesAccept(file: File, accept: string[]): boolean {
  if (accept.length === 0) return true;
  
  const extension = `.${getFileExtension(file.name)}`;
  
  return accept.some((pattern) => {
    // Extension match (e.g., ".jpg")
    if (pattern.startsWith('.')) {
      return extension.toLowerCase() === pattern.toLowerCase();
    }
    // MIME type match (e.g., "image/*" or "image/png")
    if (pattern.endsWith('/*')) {
      const baseType = pattern.slice(0, -2);
      return file.type.startsWith(baseType);
    }
    return file.type === pattern;
  });
}

// ============================================================================
// Upload Function
// ============================================================================

/**
 * Upload a file using XMLHttpRequest
 */
export function uploadFile(
  file: File,
  options: UploadOptions,
  callbacks: {
    onProgress?: (progress: number) => void;
    onSuccess?: (response: unknown) => void;
    onError?: (error: string) => void;
  }
): { xhr: XMLHttpRequest; abort: () => void } {
  const {
    url,
    method = 'POST',
    fieldName = 'file',
    headers = {},
    data = {},
    withCredentials = false,
  } = options;

  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  // Add file
  formData.append(fieldName, file);

  // Add additional data
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Setup XHR
  xhr.open(method, url, true);
  xhr.withCredentials = withCredentials;

  // Set headers
  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });

  // Progress handler
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable && callbacks.onProgress) {
      const progress = Math.round((e.loaded / e.total) * 100);
      callbacks.onProgress(progress);
    }
  };

  // Success handler
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      let response: unknown = xhr.responseText;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        // Keep as text
      }
      callbacks.onSuccess?.(response);
    } else {
      callbacks.onError?.(`Upload failed with status ${xhr.status}`);
    }
  };

  // Error handler
  xhr.onerror = () => {
    callbacks.onError?.('Network error occurred');
  };

  // Abort handler
  xhr.onabort = () => {
    callbacks.onError?.('Upload cancelled');
  };

  // Send request
  xhr.send(formData);

  return {
    xhr,
    abort: () => xhr.abort(),
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for managing file uploads
 */
export function useUpload(options: UseUploadOptions): UseUploadReturn {
  const {
    url,
    method = 'POST',
    fieldName = 'file',
    headers = {},
    data = {},
    withCredentials = false,
    maxConcurrent = 3,
    maxFileSize,
    accept = [],
    maxFiles,
    autoUpload = true,
    onUploadStart,
    onProgress,
    onSuccess,
    onError,
    onAllComplete,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const filesRef = useRef<UploadFile[]>([]);
  const uploadQueueRef = useRef<Set<string>>(new Set());
  const activeUploadsRef = useRef<number>(0);

  const updateFiles = useCallback((updater: (currentFiles: UploadFile[]) => UploadFile[]) => {
    setFiles((currentFiles) => {
      const nextFiles = updater(currentFiles);
      filesRef.current = nextFiles;
      return nextFiles;
    });
  }, []);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Revoke every outstanding preview on unmount. Previews were only ever revoked by
  // removeFile/clearFiles, so a component that unmounted with files still listed
  // leaked one blob URL per image for the lifetime of the document.
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.preview) revokePreviewUrl(f.preview);
      });
    };
  }, []);

  // Validate file
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        return {
          valid: false,
          error: `File size exceeds maximum of ${formatFileSize(maxFileSize)}`,
        };
      }

      // Check file type
      if (accept.length > 0 && !matchesAccept(file, accept)) {
        return {
          valid: false,
          error: `File type not allowed. Accepted: ${accept.join(', ')}`,
        };
      }

      return { valid: true };
    },
    [maxFileSize, accept]
  );

  // Process upload queue
  const processQueue = useCallback(async () => {
    if (activeUploadsRef.current >= maxConcurrent) return;
    if (uploadQueueRef.current.size === 0) return;

    const queuedIds = Array.from(uploadQueueRef.current);
    const toUpload = queuedIds.slice(0, maxConcurrent - activeUploadsRef.current);

    for (const id of toUpload) {
      uploadQueueRef.current.delete(id);
      activeUploadsRef.current++;

      const uploadFileById = async (fileId: string) => {
        const fileItem = filesRef.current.find((f) => f.id === fileId);
        if (!fileItem || fileItem.status === 'uploading') {
          activeUploadsRef.current--;
          return;
        }

        // Callbacks used to receive `fileItem` — the snapshot taken before the
        // request started — so `file.status` was permanently 'idle' and
        // `file.progress` permanently 0, even in onProgress. Read the live record
        // instead, falling back to the snapshot if it has since been removed.
        const currentFile = (): UploadFile =>
          filesRef.current.find((f) => f.id === fileId) ?? fileItem;

        // Update status to uploading
        updateFiles((currentFiles) =>
          currentFiles.map((f) =>
            f.id === fileId ? { ...f, status: 'uploading' as UploadStatus, progress: 0 } : f
          )
        );

        onUploadStart?.(currentFile());

        const { xhr, abort } = uploadFile(fileItem.file, {
          url,
          method,
          fieldName,
          headers,
          data,
          withCredentials,
        }, {
          onProgress: (progress) => {
            updateFiles((currentFiles) =>
              currentFiles.map((f) => (f.id === fileId ? { ...f, progress } : f))
            );
            onProgress?.(currentFile(), progress);
          },
          onSuccess: (response) => {
            updateFiles((currentFiles) =>
              currentFiles.map((f) =>
                f.id === fileId
                  ? { ...f, status: 'success' as UploadStatus, progress: 100, response, abort: undefined, xhr: undefined }
                  : f
              )
            );
            onSuccess?.(currentFile(), response);
            activeUploadsRef.current--;
            processQueue();
            checkAllComplete();
          },
          onError: (error) => {
            const nextStatus: UploadStatus = error === 'Upload cancelled' ? 'cancelled' : 'error';

            updateFiles((currentFiles) =>
              currentFiles.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      status: nextStatus,
                      error: nextStatus === 'error' ? error : undefined,
                      abort: undefined,
                      xhr: undefined,
                    }
                  : f
              )
            );
            if (nextStatus === 'error') {
              onError?.(currentFile(), error);
            }
            activeUploadsRef.current--;
            processQueue();
            checkAllComplete();
          },
        });

        // Store XHR for abort
        updateFiles((currentFiles) =>
          currentFiles.map((f) => (f.id === fileId ? { ...f, xhr, abort } : f))
        );
      };

      uploadFileById(id);
    }
  }, [data, fieldName, headers, maxConcurrent, method, onError, onProgress, onSuccess, onUploadStart, updateFiles, url, withCredentials]);

  // Check if all uploads are complete
  const checkAllComplete = useCallback(() => {
    const currentFiles = filesRef.current;
    const allDone = currentFiles.every(
      (f) => f.status === 'success' || f.status === 'error' || f.status === 'cancelled'
    );

    if (allDone && currentFiles.length > 0 && onAllComplete) {
      setTimeout(() => onAllComplete([...currentFiles]), 0);
    }
  }, [onAllComplete]);

  // Add files
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      
      // Check max files. `splice` with a negative start trims from the *end*, so
      // when the list was already at or over the limit this used to let some of the
      // new files through instead of none.
      if (maxFiles && filesRef.current.length + fileArray.length > maxFiles) {
        const allowed = Math.max(0, maxFiles - filesRef.current.length);
        fileArray.splice(allowed);
      }

      const uploadFiles: UploadFile[] = fileArray.map((file) => {
        const validation = validateFile(file);
        return {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: validation.valid ? ('idle' as UploadStatus) : ('error' as UploadStatus),
          error: validation.error,
          preview: createPreviewUrl(file),
        };
      });

      updateFiles((currentFiles) => [...currentFiles, ...uploadFiles]);

      // Auto upload valid files
      if (autoUpload) {
        const validIds = uploadFiles
          .filter((f) => f.status === 'idle')
          .map((f) => f.id);
        
        validIds.forEach((id) => uploadQueueRef.current.add(id));
        setTimeout(processQueue, 0);
      }
    },
    [autoUpload, maxFiles, processQueue, updateFiles, validateFile]
  );

  // Remove file
  const removeFile = useCallback((id: string) => {
    updateFiles((currentFiles) => {
      const file = currentFiles.find((f) => f.id === id);
      if (file?.preview) {
        revokePreviewUrl(file.preview);
      }
      if (file?.abort) {
        file.abort();
      } else if (file?.xhr) {
        file.xhr.abort();
      }
      uploadQueueRef.current.delete(id);
      return currentFiles.filter((f) => f.id !== id);
    });
  }, [updateFiles]);

  // Clear all files
  const clearFiles = useCallback(() => {
    filesRef.current.forEach((f) => {
      if (f.preview) revokePreviewUrl(f.preview);
      if (f.abort) {
        f.abort();
      } else if (f.xhr) {
        f.xhr.abort();
      }
    });
    uploadQueueRef.current.clear();
    activeUploadsRef.current = 0;
    updateFiles(() => []);
  }, [updateFiles]);

  // Upload all pending files
  const upload = useCallback(async () => {
    const pendingFiles = filesRef.current.filter((f) => f.status === 'idle');
    pendingFiles.forEach((f) => uploadQueueRef.current.add(f.id));
    processQueue();
  }, [processQueue]);

  // Upload specific file
  const uploadFileById = useCallback(
    async (id: string) => {
      uploadQueueRef.current.add(id);
      processQueue();
    },
    [processQueue]
  );

  // Abort upload
  const abortUpload = useCallback((id: string) => {
    updateFiles((currentFiles) =>
      currentFiles.map((f) => {
        if (f.id === id) {
          if (f.abort) {
            f.abort();
          } else if (f.xhr) {
            f.xhr.abort();
          }
          return { ...f, status: 'cancelled' as UploadStatus, error: undefined };
        }
        return f;
      })
    );
    uploadQueueRef.current.delete(id);
  }, [updateFiles]);

  // Abort all uploads
  const abortAll = useCallback(() => {
    updateFiles((currentFiles) =>
      currentFiles.map((f) => {
        if (f.status === 'uploading') {
          if (f.abort) {
            f.abort();
          } else if (f.xhr) {
            f.xhr.abort();
          }
          return { ...f, status: 'cancelled' as UploadStatus, error: undefined };
        }
        return f;
      })
    );
    uploadQueueRef.current.clear();
  }, [updateFiles]);

  // Retry failed upload
  const retryUpload = useCallback(
    async (id: string) => {
      // Re-validate. Retry used to reset straight to 'idle' and queue the file, so a
      // file rejected for exceeding maxFileSize would upload on the second attempt.
      const target = filesRef.current.find((f) => f.id === id);
      if (target) {
        const validation = validateFile(target.file);
        if (!validation.valid) {
          updateFiles((currentFiles) =>
            currentFiles.map((f) =>
              f.id === id
                ? { ...f, status: 'error' as UploadStatus, error: validation.error, progress: 0 }
                : f
            )
          );
          return;
        }
      }

      updateFiles((currentFiles) =>
        currentFiles.map((f) =>
          f.id === id
            ? { ...f, status: 'idle' as UploadStatus, error: undefined, progress: 0, abort: undefined, xhr: undefined }
            : f
        )
      );
      uploadQueueRef.current.add(id);
      processQueue();
    },
    [processQueue, updateFiles, validateFile]
  );

  // Computed values
  const { overallProgress, isUploading, isComplete, uploadingCount, pendingCount, successCount, errorCount } =
    useMemo(() => {
      const uploading = files.filter((f) => f.status === 'uploading');
      const pending = files.filter((f) => f.status === 'idle');
      const success = files.filter((f) => f.status === 'success');
      const errors = files.filter((f) => f.status === 'error');

      const totalProgress = files.reduce((sum, f) => sum + f.progress, 0);
      const overall = files.length > 0 ? Math.round(totalProgress / files.length) : 0;

      return {
        overallProgress: overall,
        isUploading: uploading.length > 0,
        isComplete: files.length > 0 && pending.length === 0 && uploading.length === 0,
        uploadingCount: uploading.length,
        pendingCount: pending.length,
        successCount: success.length,
        errorCount: errors.length,
      };
    }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    uploadFile: uploadFileById,
    abortUpload,
    abortAll,
    retryUpload,
    overallProgress,
    isUploading,
    isComplete,
    uploadingCount,
    pendingCount,
    successCount,
    errorCount,
    validateFile,
  };
}

// ============================================================================
// Components
// ============================================================================

/**
 * Progress bar for individual upload
 */
export function UploadProgress({
  file,
  showPreview = true,
  showProgress = true,
  showCancel = true,
  showRetry = true,
  showRemove = true,
  onCancel,
  onRetry,
  onRemove,
  className,
  style,
}: UploadProgressProps): JSX.Element {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    ...style,
  };

  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  };

  const progressContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '6px',
  };

  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor:
      file.status === 'error'
        ? '#ef4444'
        : file.status === 'success'
        ? '#10b981'
        : '#3b82f6',
    width: `${file.progress}%`,
    transition: 'width 0.2s ease',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#e5e7eb',
    color: '#374151',
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'uploading':
        return `${file.progress}%`;
      case 'success':
        return 'Complete';
      case 'error':
        return file.error || 'Error';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  return (
    <div className={className} style={containerStyle}>
      {showPreview && file.preview && (
        <img
          src={file.preview}
          alt={file.name}
          style={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      )}
      <div style={infoStyle}>
        <div style={nameStyle}>{file.name}</div>
        <div style={metaStyle}>
          {formatFileSize(file.size)} • {getStatusText()}
        </div>
        {showProgress && file.status === 'uploading' && (
          <div style={progressContainerStyle}>
            <div style={progressBarStyle} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {showCancel && file.status === 'uploading' && onCancel && (
          <button style={buttonStyle} onClick={onCancel}>
            Cancel
          </button>
        )}
        {showRetry && file.status === 'error' && onRetry && (
          <button style={buttonStyle} onClick={onRetry}>
            Retry
          </button>
        )}
        {showRemove && file.status !== 'uploading' && onRemove && (
          <button style={{ ...buttonStyle, color: '#ef4444' }} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * List of upload items
 */
export function UploadList({
  files,
  showPreview = true,
  showProgress = true,
  onCancel,
  onRetry,
  onRemove,
  className,
  style,
}: UploadListProps): JSX.Element {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {files.map((file) => (
        <UploadProgress
          key={file.id}
          file={file}
          showPreview={showPreview}
          showProgress={showProgress}
          showCancel={!!onCancel}
          showRetry={!!onRetry}
          showRemove={!!onRemove}
          onCancel={() => onCancel?.(file.id)}
          onRetry={() => onRetry?.(file.id)}
          onRemove={() => onRemove?.(file.id)}
        />
      ))}
    </div>
  );
}

/**
 * Main file upload component
 */
export function FileUpload({
  url,
  method = 'POST',
  fieldName = 'file',
  headers = {},
  data = {},
  accept,
  multiple = true,
  maxFileSize,
  maxFiles,
  autoUpload = true,
  disabled = false,
  onUploadStart,
  onProgress,
  onSuccess,
  onError,
  onAllComplete,
  children,
  className,
  style,
}: FileUploadProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const acceptArray = accept ? parseAccept(accept) : [];

  const uploadState = useUpload({
    url,
    method,
    fieldName,
    headers,
    data,
    maxFileSize,
    accept: acceptArray,
    maxFiles,
    autoUpload,
    onUploadStart,
    onProgress,
    onSuccess,
    onError,
    onAllComplete,
  });

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadState.addFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);

    if (!disabled && e.dataTransfer.files.length > 0) {
      uploadState.addFiles(e.dataTransfer.files);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragActive(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  const containerStyle: React.CSSProperties = {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: isDragActive ? '#eff6ff' : '#ffffff',
    borderColor: isDragActive ? '#3b82f6' : '#d1d5db',
    boxShadow: isDragActive ? '0 0 0 4px rgba(59, 130, 246, 0.12)' : 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af',
  };

  // Custom render function
  if (typeof children === 'function') {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        {children({ ...uploadState, isDragActive, openFileDialog })}
      </>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div
        style={containerStyle}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label="File upload dropzone"
      >
        {children || (
          <>
            <div style={labelStyle}>
              {isDragActive ? 'Release to add files' : 'Drop files here or click to upload'}
            </div>
            <div style={hintStyle}>
              {accept && `Accepted: ${accept}`}
              {maxFileSize && ` • Max: ${formatFileSize(maxFileSize)}`}
              {maxFiles && ` • Max files: ${maxFiles}`}
            </div>
          </>
        )}
      </div>

      {uploadState.files.length > 0 && (
        <UploadList
          files={uploadState.files}
          onCancel={uploadState.abortUpload}
          onRetry={uploadState.retryUpload}
          onRemove={uploadState.removeFile}
          style={{ marginTop: '16px' }}
        />
      )}
    </div>
  );
}

/**
 * Simple upload button component
 */
export function UploadButton({
  url,
  accept,
  multiple = false,
  maxFileSize,
  disabled = false,
  onSuccess,
  onError,
  children = 'Upload',
  className,
  style,
}: {
  url: string;
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
  disabled?: boolean;
  onSuccess?: (file: UploadFile, response: unknown) => void;
  onError?: (file: UploadFile, error: string) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const acceptArray = accept ? parseAccept(accept) : [];

  const uploadState = useUpload({
    url,
    accept: acceptArray,
    maxFileSize,
    autoUpload: true,
    onUploadStart: () => setIsUploading(true),
    onSuccess: (file, response) => {
      setIsUploading(false);
      onSuccess?.(file, response);
    },
    onError: (file, error) => {
      setIsUploading(false);
      onError?.(file, error);
    },
  });

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadState.addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
    backgroundColor: disabled || isUploading ? '#d1d5db' : '#3b82f6',
    color: 'white',
    transition: 'background-color 0.2s ease',
    ...style,
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
      <button
        className={className}
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || isUploading}
      >
        {isUploading ? 'Uploading...' : children}
      </button>
    </>
  );
}
