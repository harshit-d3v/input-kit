// @input-kit/split - Split pane component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  MouseEvent,
  TouchEvent,
} from 'react';

// SVG Icon Components (Lucide-style)
const ChevronRight = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeft = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronDown = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// Types
export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitPaneProps {
  direction?: SplitDirection;
  defaultSizes?: number[];
  sizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  onSizesChange?: (sizes: number[]) => void;
  gutterSize?: number;
  keyboardStep?: number;
  snapOffset?: number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface PaneProps {
  children: ReactNode;
  minSize?: number;
  maxSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface GutterProps {
  index: number;
  direction: SplitDirection;
  size: number;
  onDragStart: (index: number, e: MouseEvent | TouchEvent) => void;
  onResizeByStep: (index: number, delta: number) => void;
  onReset: (index: number) => void;
  keyboardStep: number;
  currentValue: number;
  minValue: number;
  maxValue: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseSplitPaneOptions {
  direction?: SplitDirection;
  defaultSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  gutterSize?: number;
  keyboardStep?: number;
  snapOffset?: number;
  onSizesChange?: (sizes: number[]) => void;
}

export interface UseSplitPaneReturn {
  sizes: number[];
  setSizes: (sizes: number[]) => void;
  isDragging: boolean;
  dragIndex: number | null;
  handleDragStart: (index: number, e: MouseEvent | TouchEvent) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

// Context
interface SplitContextValue {
  direction: SplitDirection;
  sizes: number[];
  gutterSize: number;
  isDragging: boolean;
}

const SplitContext = createContext<SplitContextValue | null>(null);

function useSplitContext() {
  const context = useContext(SplitContext);
  if (!context) {
    throw new Error('Pane must be used within a SplitPane');
  }
  return context;
}

function resizePair(
  sizes: number[],
  index: number,
  deltaPercent: number,
  minSizes: number[],
  maxSizes: number[],
  snapPercent: number
) {
  const nextSizes = [...sizes];
  const leftIndex = index;
  const rightIndex = index + 1;
  const pairTotal = nextSizes[leftIndex] + nextSizes[rightIndex];

  let leftSize = nextSizes[leftIndex] + deltaPercent;
  let rightSize = nextSizes[rightIndex] - deltaPercent;

  const leftMin = minSizes[leftIndex] ?? 0;
  const leftMax = maxSizes[leftIndex] ?? 100;
  const rightMin = minSizes[rightIndex] ?? 0;
  const rightMax = maxSizes[rightIndex] ?? 100;

  if (leftSize < leftMin) {
    leftSize = leftMin;
    rightSize = pairTotal - leftSize;
  }
  if (leftSize > leftMax) {
    leftSize = leftMax;
    rightSize = pairTotal - leftSize;
  }
  if (rightSize < rightMin) {
    rightSize = rightMin;
    leftSize = pairTotal - rightSize;
  }
  if (rightSize > rightMax) {
    rightSize = rightMax;
    leftSize = pairTotal - rightSize;
  }

  if (snapPercent > 0) {
    if (leftSize < snapPercent) {
      leftSize = 0;
      rightSize = pairTotal;
    } else if (rightSize < snapPercent) {
      rightSize = 0;
      leftSize = pairTotal;
    }
  }

  nextSizes[leftIndex] = leftSize;
  nextSizes[rightIndex] = rightSize;

  return nextSizes;
}

// Hook
export function useSplitPane(
  paneCount: number,
  options: UseSplitPaneOptions = {}
): UseSplitPaneReturn {
  const {
    direction = 'horizontal',
    defaultSizes,
    minSizes = [],
    maxSizes = [],
    gutterSize = 8,
    snapOffset = 30,
    onSizesChange,
  } = options;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizesState] = useState<number[]>(() => {
    if (defaultSizes && defaultSizes.length === paneCount) {
      return defaultSizes;
    }
    // Equal distribution
    return Array(paneCount).fill(100 / paneCount);
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const startPosRef = useRef(0);
  const startSizesRef = useRef<number[]>([]);

  // `sizes` is seeded once by useState, so adding or removing a pane would otherwise
  // leave the array the wrong length and emit `flex: 0 0 calc(undefined% - 4px)`.
  // Redistribute evenly when the count changes; this does not notify onSizesChange
  // because it is a structural reset rather than a user resize.
  useEffect(() => {
    setSizesState((prev) =>
      prev.length === paneCount ? prev : Array(paneCount).fill(100 / paneCount)
    );
  }, [paneCount]);


  const setSizes = useCallback((newSizes: number[]) => {
    setSizesState(newSizes);
    onSizesChange?.(newSizes);
  }, [onSizesChange]);
  
  const getContainerSize = useCallback(() => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return direction === 'horizontal' ? rect.width : rect.height;
  }, [direction]);
  
  const handleDragStart = useCallback((index: number, e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    
    const clientPos = 'touches' in e 
      ? e.touches[0][direction === 'horizontal' ? 'clientX' : 'clientY']
      : e[direction === 'horizontal' ? 'clientX' : 'clientY'];
    
    startPosRef.current = clientPos;
    startSizesRef.current = [...sizes];
    setDragIndex(index);
    setIsDragging(true);
  }, [direction, sizes]);
  
  // Handle drag
  useEffect(() => {
    if (!isDragging || dragIndex === null) return;
    
    const handleMove = (clientPos: number) => {
      const containerSize = getContainerSize();
      if (containerSize === 0) return;
      
      const gutterCount = paneCount - 1;
      const totalGutterSize = gutterCount * gutterSize;
      const availableSize = containerSize - totalGutterSize;
      
      const delta = clientPos - startPosRef.current;
      const deltaPercent = (delta / availableSize) * 100;
      
      const snapPercent = snapOffset > 0 ? (snapOffset / availableSize) * 100 : 0;
      const newSizes = resizePair(
        startSizesRef.current,
        dragIndex,
        deltaPercent,
        minSizes,
        maxSizes,
        snapPercent
      );

      setSizes(newSizes);
    };
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      handleMove(direction === 'horizontal' ? e.clientX : e.clientY);
    };
    
    const handleTouchMove = (e: globalThis.TouchEvent) => {
      handleMove(direction === 'horizontal' ? e.touches[0].clientX : e.touches[0].clientY);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setDragIndex(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragIndex, direction, paneCount, gutterSize, minSizes, maxSizes, snapOffset, getContainerSize, setSizes]);
  
  return {
    sizes,
    setSizes,
    isDragging,
    dragIndex,
    handleDragStart,
    containerRef,
  };
}

// Gutter Component
function Gutter({
  index,
  direction,
  size,
  onDragStart,
  onResizeByStep,
  onReset,
  keyboardStep,
  currentValue,
  minValue,
  maxValue,
  className,
  style,
}: GutterProps) {
  const isHorizontal = direction === 'horizontal';
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    if (event.key === previousKey) {
      event.preventDefault();
      onResizeByStep(index, -keyboardStep);
      return;
    }

    if (event.key === nextKey) {
      event.preventDefault();
      onResizeByStep(index, keyboardStep);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onResizeByStep(index, minValue - currentValue);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      onResizeByStep(index, maxValue - currentValue);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onReset(index);
    }
  };

  // Hover shading goes through state rather than writing to `currentTarget.style`
  // directly — the imperative version permanently clobbered a `background` passed in
  // via `style`, because React never knew to patch it back.
  return (
    <div
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(currentValue)}
      aria-valuemin={Math.round(minValue)}
      aria-valuemax={Math.round(maxValue)}
      tabIndex={0}
      className={className}
      onMouseDown={(e) => onDragStart(index, e)}
      onTouchStart={(e) => onDragStart(index, e)}
      onDoubleClick={() => onReset(index)}
      onKeyDown={handleKeyDown}
      title="Drag or use arrow keys to resize"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: `0 0 ${size}px`,
        background: isHovered ? '#d1d5db' : '#e5e7eb',
        cursor: isHorizontal ? 'col-resize' : 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
    >
      {/* Drag handle indicator */}
      <div
        style={{
          width: isHorizontal ? 4 : 30,
          height: isHorizontal ? 30 : 4,
          background: '#9ca3af',
          borderRadius: 2,
        }}
      />
    </div>
  );
}

// Pane Component
/**
 * Optional wrapper for a pane's contents.
 *
 * Sizing is owned by the wrapper `SplitPane` renders around every child, so this
 * component only carries per-pane constraints and styling. It used to try to
 * discover its own index by walking `parentElement.children` for `data-pane`
 * siblings — but that wrapper is its only sibling scope, so the probe always
 * resolved to `0` and every `Pane` claimed `sizes[0]`, with its `flex` fighting the
 * wrapper's.
 */
export function Pane({
  children,
  minSize,
  maxSize,
  className,
  style,
}: PaneProps) {
  const { direction } = useSplitContext();
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minWidth: isHorizontal ? minSize : undefined,
        minHeight: !isHorizontal ? minSize : undefined,
        maxWidth: isHorizontal ? maxSize : undefined,
        maxHeight: !isHorizontal ? maxSize : undefined,
        overflow: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// SplitPane Component
export function SplitPane({
  direction = 'horizontal',
  defaultSizes,
  sizes: controlledSizes,
  minSizes = [],
  maxSizes = [],
  onSizesChange,
  gutterSize = 8,
  keyboardStep = 5,
  snapOffset = 30,
  children,
  className,
  style,
}: SplitPaneProps) {
  // Count pane children
  const childArray = React.Children.toArray(children).filter(
    child => React.isValidElement(child)
  );
  const paneCount = childArray.length;
  
  const {
    sizes,
    setSizes,
    isDragging,
    handleDragStart,
    containerRef,
  } = useSplitPane(paneCount, {
    direction,
    defaultSizes: controlledSizes || defaultSizes,
    minSizes,
    maxSizes,
    gutterSize,
    snapOffset,
    onSizesChange,
  });
  
  // Sync controlled sizes.
  //
  // This deliberately compares by value rather than by array identity. The
  // documented usage passes an inline literal (`sizes={[30, 70]}`), which is a new
  // array every render — keying the effect on that identity meant it fired on every
  // render, set new state, and re-rendered forever.
  const appliedSizesRef = useRef<number[] | null>(null);
  useEffect(() => {
    if (!controlledSizes) return;

    const previous = appliedSizesRef.current;
    const unchanged =
      previous !== null &&
      previous.length === controlledSizes.length &&
      previous.every((size, index) => size === controlledSizes[index]);

    if (unchanged) return;

    appliedSizesRef.current = [...controlledSizes];
    setSizes(controlledSizes);
  }, [controlledSizes, setSizes]);
  
  const isHorizontal = direction === 'horizontal';

  const handleKeyboardResize = useCallback((index: number, deltaPercent: number) => {
    setSizes(resizePair(sizes, index, deltaPercent, minSizes, maxSizes, 0));
  }, [maxSizes, minSizes, setSizes, sizes]);

  const handleResetPair = useCallback((index: number) => {
    const pairTotal = sizes[index] + sizes[index + 1];
    const balanced = pairTotal / 2;
    const nextSizes = [...sizes];
    nextSizes[index] = balanced;
    nextSizes[index + 1] = pairTotal - balanced;
    setSizes(nextSizes);
  }, [setSizes, sizes]);
  
  // Interleave panes with gutters
  const content: ReactNode[] = [];
  childArray.forEach((child, index) => {
    // Clone child with size prop
    // `sizes` can lag `childArray` by one render when children are added, so fall
    // back to an even share rather than emitting `calc(undefined% - 4px)`.
    const paneSize = sizes[index] ?? 100 / paneCount;
    const paneStyle: React.CSSProperties = {
      flex: `0 0 calc(${paneSize}% - ${(gutterSize * (paneCount - 1)) / paneCount}px)`,
      overflow: 'auto',
    };
    
    content.push(
      <div key={`pane-${index}`} data-pane="true" style={paneStyle}>
        {child}
      </div>
    );
    
    // Add gutter between panes
    if (index < childArray.length - 1) {
      content.push(
        <Gutter
          key={`gutter-${index}`}
          index={index}
          direction={direction}
          size={gutterSize}
          onDragStart={handleDragStart}
          onResizeByStep={handleKeyboardResize}
          onReset={handleResetPair}
          keyboardStep={keyboardStep}
          currentValue={sizes[index] ?? 0}
          minValue={minSizes[index] ?? 0}
          maxValue={100 - (minSizes[index + 1] ?? 0)}
        />
      );
    }
  });
  
  return (
    <SplitContext.Provider value={{ direction, sizes, gutterSize, isDragging }}>
      <div
        ref={containerRef}
        className={className}
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style,
        }}
      >
        {content}
      </div>
    </SplitContext.Provider>
  );
}

// Simplified two-pane split
export function Split({
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 10,
  maxSize,
  first,
  second,
  onSizeChange,
  gutterSize = 8,
  className,
  style,
}: {
  direction?: SplitDirection;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  first: ReactNode;
  second: ReactNode;
  onSizeChange?: (size: number) => void;
  gutterSize?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const handleSizesChange = useCallback((sizes: number[]) => {
    onSizeChange?.(sizes[0]);
  }, [onSizeChange]);
  
  return (
    <SplitPane
      direction={direction}
      defaultSizes={[defaultSize, 100 - defaultSize]}
      minSizes={[minSize, minSize]}
      maxSizes={maxSize ? [maxSize, maxSize] : undefined}
      onSizesChange={handleSizesChange}
      gutterSize={gutterSize}
      className={className}
      style={style}
    >
      {first}
      {second}
    </SplitPane>
  );
}

// Collapsible split pane
export function CollapsibleSplit({
  direction = 'horizontal',
  defaultSize = 250,
  collapsedSize = 0,
  first,
  second,
  collapsed = false,
  onCollapsedChange,
  className,
  style,
}: {
  direction?: SplitDirection;
  defaultSize?: number;
  minSize?: number;
  collapsedSize?: number;
  first: ReactNode;
  second: ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // `collapsed` seeded useState and nothing else, so a parent that flipped it after
  // mount was ignored. Track it.
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // This pane is a fixed width that collapses; it is not draggable. There used to be
  // a `savedSize` state here whose setter was never called, which read as though drag
  // resizing were coming. Use `SplitPane` if you need a resizable divider.
  const currentSize = isCollapsed ? collapsedSize : defaultSize;
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <div
        style={{
          flex: `0 0 ${currentSize}px`,
          overflow: 'hidden',
          transition: 'flex-basis 0.2s ease',
        }}
      >
        {first}
      </div>
      
      <button
        onClick={handleToggle}
        style={{
          flex: '0 0 24px',
          background: '#f3f4f6',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        {isHorizontal 
          ? (isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />)
          : (isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />)
        }
      </button>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {second}
      </div>
    </div>
  );
}
