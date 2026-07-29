// @input-kit/timeline - Timeline component for displaying events

import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// ============================================================================
// SVG Icon Components (Lucide-style)
// ============================================================================

const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CircleIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const XIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CircleOutlineIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const ChevronRightIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelinePosition = 'left' | 'right' | 'alternate' | 'center';
export type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error';

export interface TimelineEvent {
  /** Unique identifier */
  id: string;
  /** Title of the event */
  title: string;
  /** Description or content */
  description?: string;
  /** Date/time of the event */
  date?: Date | string | number;
  /** Status of this event */
  status?: TimelineItemStatus;
  /** Custom icon or content for the marker */
  icon?: React.ReactNode;
  /** Custom color for this event */
  color?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface TimelineContextValue {
  orientation: TimelineOrientation;
  position: TimelinePosition;
  activeId?: string;
  setActiveId: (id: string | undefined) => void;
  lineColor: string;
  lineWidth: number;
  animate: boolean;
}

export interface TimelineProps {
  /** Timeline events to display */
  events?: TimelineEvent[];
  /** Children (TimelineItem components) */
  children?: React.ReactNode;
  /** Orientation of the timeline */
  orientation?: TimelineOrientation;
  /** Position of items relative to the line */
  position?: TimelinePosition;
  /** Currently active/selected item ID */
  activeId?: string;
  /** Callback when an item is clicked */
  onItemClick?: (event: TimelineEvent | string) => void;
  /** Color of the connecting line */
  lineColor?: string;
  /** Width of the connecting line in pixels */
  lineWidth?: number;
  /** Enable animations */
  animate?: boolean;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface TimelineItemProps {
  /** Unique identifier (required if not using events prop) */
  id?: string;
  /** Event data (if using events prop) */
  event?: TimelineEvent;
  /** Title of the item */
  title?: string;
  /** Description or content */
  description?: string;
  /** Date/time to display */
  date?: Date | string | number;
  /** Status of this item */
  status?: TimelineItemStatus;
  /** Custom icon or content for the marker */
  icon?: React.ReactNode;
  /** Custom color for the marker */
  color?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Position index within the rendered timeline */
  index?: number;
  /** Whether this is the last item */
  isLast?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface TimelineMarkerProps {
  /** Status of the marker */
  status?: TimelineItemStatus;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom color */
  color?: string;
  /** Size in pixels */
  size?: number;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface TimelineContentProps {
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Date */
  date?: Date | string | number;
  /** Children content */
  children?: React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface TimelineConnectorProps {
  /** Whether this is the last item (hide connector) */
  isLast?: boolean;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface UseTimelineOptions {
  /** Initial events */
  events?: TimelineEvent[];
  /** Initially active item ID */
  initialActiveId?: string;
}

export interface UseTimelineReturn {
  /** Current events */
  events: TimelineEvent[];
  /** Currently active item ID */
  activeId?: string;
  /** Set active item */
  setActiveId: (id: string | undefined) => void;
  /** Add a new event */
  addEvent: (event: TimelineEvent) => void;
  /** Remove an event */
  removeEvent: (id: string) => void;
  /** Update an event */
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  /** Update event status */
  setEventStatus: (id: string, status: TimelineItemStatus) => void;
  /** Reorder events */
  reorderEvents: (fromIndex: number, toIndex: number) => void;
  /** Clear all events */
  clearEvents: () => void;
  /** Get event by ID */
  getEvent: (id: string) => TimelineEvent | undefined;
  /** Get completed events */
  completedEvents: TimelineEvent[];
  /** Get pending events */
  pendingEvents: TimelineEvent[];
  /** Get current event */
  currentEvent: TimelineEvent | undefined;
}

// ============================================================================
// Context
// ============================================================================

const TimelineContext = createContext<TimelineContextValue | null>(null);

function useTimelineContext(): TimelineContextValue {
  const context = useContext(TimelineContext);
  if (!context) {
    return {
      orientation: 'vertical',
      position: 'left',
      activeId: undefined,
      setActiveId: () => {},
      lineColor: '#e5e7eb',
      lineWidth: 2,
      animate: true,
    };
  }
  return context;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format a date for display
 */
export function formatTimelineDate(
  date: Date | string | number | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return '';
  
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  return d.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Get status color
 */
function getStatusColor(status?: TimelineItemStatus): string {
  switch (status) {
    case 'completed':
      return '#10b981'; // green
    case 'current':
      return '#3b82f6'; // blue
    case 'error':
      return '#ef4444'; // red
    case 'pending':
    default:
      return '#9ca3af'; // gray
  }
}

/**
 * Get default icon for status
 */
function getStatusIcon(status?: TimelineItemStatus): React.ReactNode {
  switch (status) {
    case 'completed':
      return <CheckIcon size={12} />;
    case 'current':
      return <CircleIcon size={12} />;
    case 'error':
      return <XIcon size={12} />;
    case 'pending':
    default:
      return <CircleOutlineIcon size={12} />;
  }
}

/**
 * Sort events by date
 */
export function sortEventsByDate(
  events: TimelineEvent[],
  direction: 'asc' | 'desc' = 'asc'
): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: TimelineEvent[],
  granularity: 'day' | 'month' | 'year' = 'day'
): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    if (!event.date) {
      const key = 'No Date';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
      continue;
    }

    const date = new Date(event.date);
    let key: string;

    switch (granularity) {
      case 'year':
        key = date.getFullYear().toString();
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'day':
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return groups;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for managing timeline state
 */
export function useTimeline(options: UseTimelineOptions = {}): UseTimelineReturn {
  const { events: initialEvents = [], initialActiveId } = options;

  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [activeId, setActiveId] = useState<string | undefined>(initialActiveId);

  const addEvent = useCallback((event: TimelineEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (activeId === id) setActiveId(undefined);
  }, [activeId]);

  const updateEvent = useCallback((id: string, updates: Partial<TimelineEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const setEventStatus = useCallback((id: string, status: TimelineItemStatus) => {
    updateEvent(id, { status });
  }, [updateEvent]);

  const reorderEvents = useCallback((fromIndex: number, toIndex: number) => {
    setEvents((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setActiveId(undefined);
  }, []);

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const completedEvents = useMemo(
    () => events.filter((e) => e.status === 'completed'),
    [events]
  );

  const pendingEvents = useMemo(
    () => events.filter((e) => e.status === 'pending' || !e.status),
    [events]
  );

  const currentEvent = useMemo(
    () => events.find((e) => e.status === 'current'),
    [events]
  );

  return {
    events,
    activeId,
    setActiveId,
    addEvent,
    removeEvent,
    updateEvent,
    setEventStatus,
    reorderEvents,
    clearEvents,
    getEvent,
    completedEvents,
    pendingEvents,
    currentEvent,
  };
}

// ============================================================================
// Components
// ============================================================================

/**
 * Timeline marker/dot component
 */
export function TimelineMarker({
  status,
  icon,
  color,
  size = 24,
  className,
  style,
}: TimelineMarkerProps): JSX.Element {
  const context = useTimelineContext();
  const markerColor = color || getStatusColor(status);
  const displayIcon = icon || getStatusIcon(status);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: status === 'completed' ? markerColor : 'white',
    border: `2px solid ${markerColor}`,
    color: status === 'completed' ? 'white' : markerColor,
    fontSize: size * 0.5,
    fontWeight: 'bold',
    flexShrink: 0,
    zIndex: 1,
    boxShadow: status === 'current' ? `0 0 0 4px ${markerColor}22` : undefined,
    transform: status === 'current' ? 'scale(1.04)' : undefined,
    transition: context.animate ? 'all 0.2s ease' : undefined,
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      {displayIcon}
    </div>
  );
}

/**
 * Timeline connector line component
 */
export function TimelineConnector({
  isLast = false,
  className,
  style,
}: TimelineConnectorProps): JSX.Element | null {
  const context = useTimelineContext();

  if (isLast) return null;

  const isVertical = context.orientation === 'vertical';

  const baseStyle: React.CSSProperties = {
    backgroundColor: context.lineColor,
    position: 'absolute',
    ...(isVertical
      ? {
          width: context.lineWidth,
          top: 24,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }
      : {
          height: context.lineWidth,
          left: 24,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
        }),
    ...style,
  };

  return <div className={className} style={baseStyle} />;
}

/**
 * Timeline content component
 */
export function TimelineContent({
  title,
  description,
  date,
  children,
  className,
  style,
}: TimelineContentProps): JSX.Element {
  const parsedDate = date ? new Date(date) : null;
  const isValidDate = parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());

  const baseStyle: React.CSSProperties = {
    padding: '4px 0',
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
  };

  const descStyle: React.CSSProperties = {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
  };

  const dateStyle: React.CSSProperties = {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#9ca3af',
  };

  return (
    <div className={className} style={baseStyle}>
      {title && <h3 style={titleStyle}>{title}</h3>}
      {description && <p style={descStyle}>{description}</p>}
      {date && (
        <p style={dateStyle}>
          {isValidDate ? (
            <time dateTime={parsedDate.toISOString()}>{formatTimelineDate(date)}</time>
          ) : (
            formatTimelineDate(date)
          )}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * Individual timeline item component
 */
export function TimelineItem({
  id,
  event,
  title,
  description,
  date,
  status,
  icon,
  color,
  children,
  index = 0,
  isLast = false,
  onClick,
  className,
  style,
}: TimelineItemProps): JSX.Element {
  const context = useTimelineContext();
  
  const itemId = id || event?.id;
  const itemTitle = title || event?.title;
  const itemDescription = description || event?.description;
  const itemDate = date || event?.date;
  const itemStatus = status || event?.status;
  const itemIcon = icon || event?.icon;
  const itemColor = color || event?.color;

  const isActive = itemId !== undefined && context.activeId === itemId;
  const isVertical = context.orientation === 'vertical';
  const resolvedPosition = !isVertical
    ? 'left'
    : context.position === 'alternate'
    ? index % 2 === 0
      ? 'left'
      : 'right'
    : context.position === 'left'
    ? 'left'
    : 'right';
  const useCenteredRail = isVertical && context.position !== 'left';
  const isInteractive = Boolean(onClick || itemId);

  const handleClick = () => {
    if (onClick) onClick();
    if (itemId) context.setActiveId(itemId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const containerStyle: React.CSSProperties = {
    display: useCenteredRail ? 'grid' : 'flex',
    gridTemplateColumns: useCenteredRail ? 'minmax(0, 1fr) auto minmax(0, 1fr)' : undefined,
    columnGap: useCenteredRail ? '16px' : undefined,
    flexDirection: !useCenteredRail ? (isVertical ? 'row' : 'column') : undefined,
    alignItems: useCenteredRail ? 'flex-start' : isVertical ? 'flex-start' : 'center',
    position: 'relative',
    paddingBottom: isVertical && !isLast ? '24px' : undefined,
    paddingRight: !isVertical && !isLast ? '24px' : undefined,
    cursor: isInteractive ? 'pointer' : undefined,
    opacity: isActive ? 1 : 0.92,
    transition: context.animate ? 'opacity 0.2s ease, transform 0.2s ease' : undefined,
    transform: isActive ? 'translateY(-1px)' : undefined,
    ...style,
  };

  const markerContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gridColumn: useCenteredRail ? 2 : undefined,
    justifySelf: useCenteredRail ? 'center' : undefined,
  };

  const contentContainerStyle: React.CSSProperties = {
    gridColumn: useCenteredRail ? (resolvedPosition === 'left' ? 1 : 3) : undefined,
    marginLeft: !useCenteredRail && isVertical ? '12px' : undefined,
    marginTop: !isVertical ? '12px' : undefined,
    flex: 1,
    minWidth: 0,
    textAlign: useCenteredRail && resolvedPosition === 'left' ? 'right' : 'left',
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive ? 0 : undefined}
      role="listitem"
      aria-current={itemStatus === 'current' ? 'step' : undefined}
    >
      <div style={markerContainerStyle}>
        <TimelineMarker
          status={itemStatus}
          icon={itemIcon}
          color={itemColor}
        />
        <TimelineConnector isLast={isLast} />
      </div>
      <div style={contentContainerStyle}>
        {children || (
          <TimelineContent
            title={itemTitle}
            description={itemDescription}
            date={itemDate}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Main Timeline component
 */
export function Timeline({
  events,
  children,
  orientation = 'vertical',
  position = 'left',
  activeId: controlledActiveId,
  onItemClick,
  lineColor = '#e5e7eb',
  lineWidth = 2,
  animate = true,
  className,
  style,
}: TimelineProps): JSX.Element {
  const [internalActiveId, setInternalActiveId] = useState<string | undefined>();
  
  const activeId = controlledActiveId ?? internalActiveId;
  const setActiveId = useCallback((id: string | undefined) => {
    setInternalActiveId(id);
  }, []);

  const contextValue: TimelineContextValue = {
    orientation,
    position,
    activeId,
    setActiveId,
    lineColor,
    lineWidth,
    animate,
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: orientation === 'horizontal' ? '24px' : undefined,
    ...style,
  };

  const handleItemClick = (event: TimelineEvent) => {
    if (onItemClick) onItemClick(event);
    setActiveId(event.id);
  };

  const content = events ? (
    events.map((event, index) => (
      <TimelineItem
        key={event.id}
        event={event}
        index={index}
        isLast={index === events.length - 1}
        onClick={() => handleItemClick(event)}
      />
    ))
  ) : (
    children
  );

  return (
    <TimelineContext.Provider value={contextValue}>
      <div className={className} style={containerStyle} role="list">
        {content}
      </div>
    </TimelineContext.Provider>
  );
}

/**
 * Timeline separator for grouping events
 */
export function TimelineSeparator({
  label,
  className,
  style,
}: {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element {
  const context = useTimelineContext();
  const isVertical = context.orientation === 'vertical';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: isVertical ? '12px 0' : '0 12px',
    ...style,
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: isVertical ? '1px' : undefined,
    width: !isVertical ? '1px' : undefined,
    backgroundColor: context.lineColor,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={lineStyle} />
      <span style={labelStyle}>{label}</span>
      <div style={lineStyle} />
    </div>
  );
}

/**
 * Collapsible timeline group
 */
export function TimelineGroup({
  title,
  events,
  defaultExpanded = true,
  children,
  className,
  style,
}: {
  title: string;
  events?: TimelineEvent[];
  defaultExpanded?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}): JSX.Element {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const context = useTimelineContext();

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    cursor: 'pointer',
    userSelect: 'none',
    width: '100%',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  };

  const countStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '12px',
  };

  const chevronStyle: React.CSSProperties = {
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: context.animate ? 'transform 0.2s ease' : undefined,
  };

  const contentStyle: React.CSSProperties = {
    display: expanded ? 'block' : 'none',
    paddingLeft: '16px',
  };

  const count = events?.length || 0;

  return (
    <div className={className} style={style}>
      <button type="button" style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <span style={chevronStyle}><ChevronRightIcon size={12} /></span>
        <span style={titleStyle}>{title}</span>
        {count > 0 && <span style={countStyle}>{count}</span>}
      </button>
      <div style={contentStyle}>
        {events ? (
          events.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={index}
              isLast={index === events.length - 1}
            />
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
}
