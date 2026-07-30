// @input-kit/crop - Image cropper component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  MouseEvent,
} from 'react';

// Types
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  blob: Blob | null;
  dataUrl: string;
  width: number;
  height: number;
}

export interface UseCropOptions {
  aspectRatio?: number; // width / height, undefined for free
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UseCropReturn {
  cropArea: CropArea;
  setCropArea: (area: CropArea) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  isDragging: boolean;
  isResizing: boolean;
  handleMouseDown: (e: MouseEvent, type: 'move' | 'resize', handle?: string) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  reset: () => void;
}

export interface ImageCropperProps {
  src: string;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  showGrid?: boolean;
  showZoom?: boolean;
  showRotation?: boolean;
  onCropComplete?: (result: CropResult) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Hook
export function useCrop(options: UseCropOptions = {}): UseCropReturn {
  const {
    aspectRatio,
    minWidth = 50,
    minHeight = 50,
    maxWidth = Infinity,
    maxHeight = Infinity,
  } = options;

  const [cropArea, setCropAreaState] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: aspectRatio ? 200 / aspectRatio : 200,
  });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  // Use a ref instead of state for drag origin — updating it on every mousemove
  // with setState would cause an extra re-render per event.
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const setCropArea = useCallback((area: CropArea) => {
    let { width, height } = area;
    
    // Apply min/max constraints
    width = Math.max(minWidth, Math.min(maxWidth, width));
    height = Math.max(minHeight, Math.min(maxHeight, height));
    
    // Apply aspect ratio
    if (aspectRatio) {
      height = width / aspectRatio;
    }
    
    setCropAreaState({ ...area, width, height });
  }, [aspectRatio, minWidth, minHeight, maxWidth, maxHeight]);

  const handleMouseDown = useCallback((
    e: MouseEvent,
    type: 'move' | 'resize',
    handle?: string
  ) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    
    if (type === 'move') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
      setResizeHandle(handle || null);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (isDragging) {
      setCropAreaState(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    } else if (isResizing && resizeHandle) {
      setCropAreaState(prev => {
        let { x, y, width, height } = prev;
        // The right and bottom edges stay put when dragging a west/north handle, so
        // clamping the size afterwards has to move `x`/`y` back to keep them fixed.
        // Without that correction the width pinned at `minWidth` while `x` kept
        // advancing, and the crop box walked across the image under the pointer.
        const right = x + width;
        const bottom = y + height;
        const movesLeftEdge = resizeHandle === 'nw' || resizeHandle === 'sw' || resizeHandle === 'w';
        const movesTopEdge = resizeHandle === 'nw' || resizeHandle === 'ne' || resizeHandle === 'n';

        switch (resizeHandle) {
          case 'nw':
            x += deltaX;
            y += deltaY;
            width -= deltaX;
            height -= deltaY;
            break;
          case 'ne':
            y += deltaY;
            width += deltaX;
            height -= deltaY;
            break;
          case 'sw':
            x += deltaX;
            width -= deltaX;
            height += deltaY;
            break;
          case 'se':
            width += deltaX;
            height += deltaY;
            break;
          case 'n':
            y += deltaY;
            height -= deltaY;
            break;
          case 's':
            height += deltaY;
            break;
          case 'w':
            x += deltaX;
            width -= deltaX;
            break;
          case 'e':
            width += deltaX;
            break;
        }

        // Apply constraints
        width = Math.max(minWidth, Math.min(maxWidth, width));
        height = Math.max(minHeight, Math.min(maxHeight, height));

        if (aspectRatio) {
          // Height follows width, so a vertical handle has to express its drag as a
          // width change — otherwise the n/s handles are inert under a fixed ratio,
          // which is how this behaved before.
          if (resizeHandle === 'n' || resizeHandle === 's') {
            width = Math.max(minWidth, Math.min(maxWidth, height * aspectRatio));
          }
          height = width / aspectRatio;
        }

        // Re-anchor the edges the handle was not supposed to move.
        if (movesLeftEdge) x = right - width;
        if (movesTopEdge) y = bottom - height;

        return { x, y, width, height };
      });
    }
  }, [isDragging, isResizing, resizeHandle, aspectRatio, minWidth, minHeight, maxWidth, maxHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const reset = useCallback(() => {
    setCropAreaState({
      x: 50,
      y: 50,
      width: 200,
      height: aspectRatio ? 200 / aspectRatio : 200,
    });
    setZoom(1);
    setRotation(0);
  }, [aspectRatio]);

  return {
    cropArea,
    setCropArea,
    zoom,
    setZoom,
    rotation,
    setRotation,
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    reset,
  };
}

// Utility to crop image
export async function cropImage(
  imageSrc: string,
  cropArea: CropArea,
  zoom: number = 1,
  rotation: number = 0
): Promise<CropResult> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw cropped area
      ctx.drawImage(
        image,
        cropArea.x / zoom,
        cropArea.y / zoom,
        cropArea.width / zoom,
        cropArea.height / zoom,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      const dataUrl = canvas.toDataURL('image/png');

      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl,
          width: cropArea.width,
          height: cropArea.height,
        });
      }, 'image/png');
    };

    image.onerror = () => {
      resolve({ blob: null, dataUrl: '', width: 0, height: 0 });
    };

    image.src = imageSrc;
  });
}

// Component
export function ImageCropper({
  src,
  aspectRatio,
  minWidth = 50,
  minHeight = 50,
  showGrid = true,
  showZoom = true,
  showRotation = true,
  onCropComplete,
  className,
  style,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const {
    cropArea,
    setCropArea,
    zoom,
    setZoom,
    rotation,
    setRotation,
    isDragging,
    isResizing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    reset,
  } = useCrop({ aspectRatio, minWidth, minHeight });

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      // Initialize crop area in center
      const initialWidth = Math.min(200, img.width * 0.8);
      const initialHeight = aspectRatio ? initialWidth / aspectRatio : Math.min(200, img.height * 0.8);
      setCropArea({
        x: (img.width - initialWidth) / 2,
        y: (img.height - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
    };
    img.src = src;
  }, [src, aspectRatio, setCropArea]);

  // Handle crop completion
  const handleCropComplete = useCallback(async () => {
    const result = await cropImage(src, cropArea, zoom, rotation);
    onCropComplete?.(result);
  }, [src, cropArea, zoom, rotation, onCropComplete]);

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      handleMouseMove(e as unknown as MouseEvent);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, isResizing, handleMouseUp, handleMouseMove]);

  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
  
  const getHandlePosition = (handle: string) => {
    const positions: Record<string, React.CSSProperties> = {
      nw: { top: -5, left: -5, cursor: 'nwse-resize' },
      n: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      ne: { top: -5, right: -5, cursor: 'nesw-resize' },
      w: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' },
      e: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' },
      sw: { bottom: -5, left: -5, cursor: 'nesw-resize' },
      s: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      se: { bottom: -5, right: -5, cursor: 'nwse-resize' },
    };
    return positions[handle];
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {/* Cropper Area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          aspectRatio: imageSize.width && imageSize.height 
            ? `${imageSize.width} / ${imageSize.height}` 
            : '16 / 9',
          background: '#1a1a1a',
          overflow: 'hidden',
          borderRadius: '8px',
        }}
      >
        {/* Image */}
        <img
          src={src}
          alt="Crop source"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
        
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            clipPath: `polygon(
              0 0, 100% 0, 100% 100%, 0 100%, 0 0,
              ${cropArea.x}px ${cropArea.y}px,
              ${cropArea.x}px ${cropArea.y + cropArea.height}px,
              ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
              ${cropArea.x + cropArea.width}px ${cropArea.y}px,
              ${cropArea.x}px ${cropArea.y}px
            )`,
          }}
        />
        
        {/* Crop Area */}
        <div
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          style={{
            position: 'absolute',
            top: cropArea.y,
            left: cropArea.x,
            width: cropArea.width,
            height: cropArea.height,
            border: '2px solid white',
            boxSizing: 'border-box',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Grid */}
          {showGrid && (
            <>
              <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.5)' }} />
            </>
          )}
          
          {/* Resize Handles */}
          {handles.map(handle => (
            <div
              key={handle}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'resize', handle);
              }}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                background: 'white',
                borderRadius: '50%',
                ...getHandlePosition(handle),
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {showZoom && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Zoom:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span>{zoom.toFixed(1)}x</span>
          </label>
        )}
        
        {showRotation && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rotate:</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
            <span>{rotation}°</span>
          </label>
        )}
        
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            background: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        
        <button
          onClick={handleCropComplete}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Crop
        </button>
      </div>
    </div>
  );
}
