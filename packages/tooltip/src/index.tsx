import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipOptions {
  placement?: TooltipPlacement;
  delay?: number;
  closeDelay?: number;
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  interactive?: boolean;
  disabled?: boolean;
  collisionPadding?: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

interface TooltipState {
  isVisible: boolean;
  position: TooltipPosition;
  placement: TooltipPlacement;
}

type TriggerProps = HTMLAttributes<HTMLElement> & {
  ref: (node: HTMLElement | null) => void;
  'aria-describedby'?: string;
  'data-state': 'open' | 'closed';
};

type ContentProps = HTMLAttributes<HTMLDivElement> & {
  ref: (node: HTMLDivElement | null) => void;
  id: string;
  role: 'tooltip';
  style: CSSProperties;
  'data-state': 'open' | 'closed';
  'data-placement': TooltipPlacement;
};

export interface UseTooltipReturn {
  tooltipState: TooltipState;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  tooltipRef: React.MutableRefObject<HTMLDivElement | null>;
  triggerProps: TriggerProps;
  tooltipProps: ContentProps;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  updatePosition: () => void;
}

export interface TooltipProps extends TooltipOptions {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  showArrow?: boolean;
  arrowSize?: number;
  maxWidth?: number | string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function composeHandlers<EventType>(
  original?: (event: EventType) => void,
  next?: (event: EventType) => void
) {
  return (event: EventType) => {
    original?.(event);
    next?.(event);
  };
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): (node: T | null) => void {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
        return;
      }
      (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

function resolvePlacement(
  preferredPlacement: TooltipPlacement,
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  offset: number,
  collisionPadding: number
): { position: TooltipPosition; placement: TooltipPlacement } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const fitsTop = triggerRect.top - tooltipRect.height - offset >= collisionPadding;
  const fitsBottom = triggerRect.bottom + tooltipRect.height + offset <= viewportHeight - collisionPadding;
  const fitsLeft = triggerRect.left - tooltipRect.width - offset >= collisionPadding;
  const fitsRight = triggerRect.right + tooltipRect.width + offset <= viewportWidth - collisionPadding;

  let placement = preferredPlacement;

  if (preferredPlacement === 'top' && !fitsTop && fitsBottom) placement = 'bottom';
  if (preferredPlacement === 'bottom' && !fitsBottom && fitsTop) placement = 'top';
  if (preferredPlacement === 'left' && !fitsLeft && fitsRight) placement = 'right';
  if (preferredPlacement === 'right' && !fitsRight && fitsLeft) placement = 'left';

  let x = 0;
  let y = 0;

  switch (placement) {
    case 'bottom':
      x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      y = triggerRect.bottom + offset;
      break;
    case 'left':
      x = triggerRect.left - tooltipRect.width - offset;
      y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'right':
      x = triggerRect.right + offset;
      y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'top':
    default:
      x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      y = triggerRect.top - tooltipRect.height - offset;
      break;
  }

  x = clamp(x, collisionPadding, viewportWidth - tooltipRect.width - collisionPadding);
  y = clamp(y, collisionPadding, viewportHeight - tooltipRect.height - collisionPadding);

  return {
    position: { x, y },
    placement,
  };
}

function useControllableOpenState(
  openProp: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  return [open, setOpen] as const;
}

export function useTooltip(options: TooltipOptions = {}): UseTooltipReturn {
  const {
    placement = 'top',
    delay = 150,
    closeDelay = 80,
    offset = 10,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    interactive = false,
    disabled = false,
    collisionPadding = 8,
  } = options;

  const tooltipId = useId();
  const [open, setOpen] = useControllableOpenState(openProp, defaultOpen, onOpenChange);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }

    const next = resolvePlacement(
      placement,
      triggerRef.current.getBoundingClientRect(),
      tooltipRef.current.getBoundingClientRect(),
      offset,
      collisionPadding
    );

    setPosition(next.position);
    setResolvedPlacement(next.placement);
  }, [placement, offset, collisionPadding]);

  const showNow = useCallback(() => {
    if (disabled) return;
    clearTimers();
    setOpen(true);
  }, [clearTimers, disabled, setOpen]);

  const hideNow = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimers();

    if (delay <= 0) {
      setOpen(true);
      return;
    }

    openTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, delay);
  }, [clearTimers, delay, disabled, setOpen]);

  const hide = useCallback(() => {
    clearTimers();

    if (closeDelay <= 0) {
      setOpen(false);
      return;
    }

    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }, [clearTimers, closeDelay, setOpen]);

  const toggle = useCallback(() => {
    if (open) {
      hideNow();
    } else {
      showNow();
    }
  }, [hideNow, open, showNow]);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideNow();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (triggerRef.current?.contains(target) || tooltipRef.current?.contains(target)) {
        return;
      }

      hideNow();
    };

    const handleWindowUpdate = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
    };
  }, [hideNow, open, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  const handleTriggerLeave = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (
        interactive &&
        event.relatedTarget instanceof Node &&
        tooltipRef.current?.contains(event.relatedTarget)
      ) {
        return;
      }
      hide();
    },
    [hide, interactive]
  );

  const handleTriggerBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (
        interactive &&
        event.relatedTarget instanceof Node &&
        tooltipRef.current?.contains(event.relatedTarget)
      ) {
        return;
      }
      hide();
    },
    [hide, interactive]
  );

  const handleTooltipBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (
        event.relatedTarget instanceof Node &&
        (tooltipRef.current?.contains(event.relatedTarget) ||
          triggerRef.current?.contains(event.relatedTarget))
      ) {
        return;
      }
      hide();
    },
    [hide]
  );

  const tooltipStyle: CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
    pointerEvents: interactive ? 'auto' : 'none',
  };

  return {
    tooltipState: {
      isVisible: open,
      position,
      placement: resolvedPlacement,
    },
    triggerRef,
    tooltipRef,
    triggerProps: {
      ref: (node) => {
        triggerRef.current = node;
      },
      onMouseEnter: show,
      onMouseLeave: handleTriggerLeave,
      onFocus: showNow,
      onBlur: handleTriggerBlur,
      'aria-describedby': open ? tooltipId : undefined,
      'data-state': open ? 'open' : 'closed',
    },
    tooltipProps: {
      ref: (node) => {
        tooltipRef.current = node;
      },
      id: tooltipId,
      role: 'tooltip',
      style: tooltipStyle,
      onMouseEnter: interactive ? showNow : undefined,
      onMouseLeave: interactive ? () => hide() : undefined,
      onBlur: interactive ? handleTooltipBlur : undefined,
      'data-state': open ? 'open' : 'closed',
      'data-placement': resolvedPlacement,
    },
    show,
    hide,
    toggle,
    updatePosition,
  };
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay,
  closeDelay,
  offset,
  open,
  defaultOpen,
  onOpenChange,
  interactive = false,
  disabled = false,
  collisionPadding,
  className,
  style,
  showArrow = true,
  arrowSize = 8,
  maxWidth = 280,
}: TooltipProps) {
  const { tooltipState, triggerProps, tooltipProps } = useTooltip({
    placement,
    delay,
    closeDelay,
    offset,
    open,
    defaultOpen,
    onOpenChange,
    interactive,
    disabled,
    collisionPadding,
  });

  const contentStyle: CSSProperties = {
    ...tooltipProps.style,
    maxWidth,
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: '13px',
    lineHeight: 1.45,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.26)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    textWrap: 'pretty',
    ...style,
  };

  const arrowStyle: CSSProperties = {
    position: 'absolute',
    width: arrowSize,
    height: arrowSize,
    transform: 'rotate(45deg)',
    background: contentStyle.background,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderStyle: 'solid',
    borderWidth: '1px 0 0 1px',
  };

  if (tooltipState.placement === 'top') {
    arrowStyle.bottom = -arrowSize / 2;
    arrowStyle.left = '50%';
    arrowStyle.marginLeft = -arrowSize / 2;
  } else if (tooltipState.placement === 'bottom') {
    arrowStyle.top = -arrowSize / 2;
    arrowStyle.left = '50%';
    arrowStyle.marginLeft = -arrowSize / 2;
  } else if (tooltipState.placement === 'left') {
    arrowStyle.right = -arrowSize / 2;
    arrowStyle.top = '50%';
    arrowStyle.marginTop = -arrowSize / 2;
  } else {
    arrowStyle.left = -arrowSize / 2;
    arrowStyle.top = '50%';
    arrowStyle.marginTop = -arrowSize / 2;
  }

  const fallbackTrigger = (
    <span
      {...triggerProps}
      style={{ display: 'inline-flex', alignItems: 'center' }}
      tabIndex={0}
    >
      {children}
    </span>
  );

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        ...triggerProps,
        ref: mergeRefs(
          (children as ReactElement<any> & { ref?: React.Ref<HTMLElement> }).ref,
          triggerProps.ref
        ),
        onMouseEnter: composeHandlers(children.props.onMouseEnter, triggerProps.onMouseEnter),
        onMouseLeave: composeHandlers(children.props.onMouseLeave, triggerProps.onMouseLeave),
        onFocus: composeHandlers(children.props.onFocus, triggerProps.onFocus),
        onBlur: composeHandlers(children.props.onBlur, triggerProps.onBlur),
      })
    : fallbackTrigger;

  return (
    <>
      {trigger}
      {tooltipState.isVisible && (
        <div {...tooltipProps} className={className} style={contentStyle}>
          {showArrow && <span aria-hidden="true" style={arrowStyle} />}
          {content}
        </div>
      )}
    </>
  );
}
