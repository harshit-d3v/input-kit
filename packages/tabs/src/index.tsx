import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  loop: boolean;
  baseId: string;
}

export interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  id?: string;
}

export interface TabListProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export interface TabProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface TabPanelsProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface TabPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  forceMount?: boolean;
}

interface InternalTabProps extends TabProps {
  __index?: number;
  __selected?: boolean;
  __tabId?: string;
  __panelId?: string;
  __onSelect?: () => void;
  __onFocus?: () => void;
  __onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  __tabRef?: MutableRefObject<Array<HTMLButtonElement | null>>;
}

interface InternalTabPanelProps extends TabPanelProps {
  __index?: number;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
}

function toTabElements(children: ReactNode): ReactElement<InternalTabProps>[] {
  return Children.toArray(children).filter(isValidElement) as ReactElement<InternalTabProps>[];
}

function findEnabledTabIndex(
  children: ReactElement<InternalTabProps>[],
  startIndex: number,
  direction: 1 | -1,
  loop: boolean
) {
  if (children.length === 0) {
    return -1;
  }

  let nextIndex = startIndex;

  for (let attempts = 0; attempts < children.length; attempts += 1) {
    nextIndex += direction;

    if (nextIndex < 0) {
      nextIndex = loop ? children.length - 1 : 0;
    }

    if (nextIndex >= children.length) {
      nextIndex = loop ? 0 : children.length - 1;
    }

    if (!children[nextIndex]?.props.disabled) {
      return nextIndex;
    }

    if (!loop && (nextIndex === 0 || nextIndex === children.length - 1)) {
      break;
    }
  }

  return startIndex;
}

export function Tabs({
  children,
  defaultIndex = 0,
  selectedIndex: controlledIndex,
  onChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  loop = true,
  id,
}: TabsProps) {
  const generatedId = useId();
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const handleChange = useCallback((index: number) => {
    if (!isControlled) {
      setUncontrolledIndex(index);
    }
    onChange?.(index);
  }, [isControlled, onChange]);

  const value = useMemo(() => ({
    selectedIndex: currentIndex,
    setSelectedIndex: handleChange,
    orientation,
    activationMode,
    loop,
    baseId: id ?? `tabs-${generatedId}`,
  }), [activationMode, currentIndex, generatedId, handleChange, id, loop, orientation]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function TabList({
  children,
  className,
  style,
  'aria-label': ariaLabel,
}: TabListProps) {
  const { selectedIndex, setSelectedIndex, orientation, activationMode, loop, baseId } = useTabs();
  const tabs = toTabElements(children);
  const tabRefs = useMemo(() => ({ current: [] as Array<HTMLButtonElement | null> }), []);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
    if (activationMode === 'automatic') {
      setSelectedIndex(index);
    }
  }, [activationMode, setSelectedIndex, tabRefs]);

  const firstEnabledIndex = useMemo(
    () => tabs.findIndex((tab) => !tab.props.disabled),
    [tabs]
  );

  const lastEnabledIndex = useMemo(() => {
    for (let index = tabs.length - 1; index >= 0; index -= 1) {
      if (!tabs[index]?.props.disabled) {
        return index;
      }
    }
    return -1;
  }, [tabs]);

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        ...style,
      }}
    >
      {tabs.map((tab, index) => {
        const tabId = `${baseId}-tab-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return cloneElement(tab, {
          __index: index,
          __selected: index === selectedIndex,
          __tabId: tabId,
          __panelId: panelId,
          __tabRef: tabRefs,
          __onSelect: () => setSelectedIndex(index),
          __onFocus: () => {
            if (activationMode === 'automatic' && !tab.props.disabled) {
              setSelectedIndex(index);
            }
          },
          __onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
            if (tab.props.disabled) {
              return;
            }

            const isHorizontal = orientation === 'horizontal';
            const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
            const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

            if (event.key === previousKey) {
              event.preventDefault();
              focusTab(findEnabledTabIndex(tabs, index, -1, loop));
              return;
            }

            if (event.key === nextKey) {
              event.preventDefault();
              focusTab(findEnabledTabIndex(tabs, index, 1, loop));
              return;
            }

            if (event.key === 'Home' && firstEnabledIndex !== -1) {
              event.preventDefault();
              focusTab(firstEnabledIndex);
              return;
            }

            if (event.key === 'End' && lastEnabledIndex !== -1) {
              event.preventDefault();
              focusTab(lastEnabledIndex);
              return;
            }

            if ((event.key === 'Enter' || event.key === ' ') && activationMode === 'manual') {
              event.preventDefault();
              setSelectedIndex(index);
            }
          },
        });
      })}
    </div>
  );
}

/**
 * A tab trigger. Must be a direct child of `TabList`, which injects the wiring.
 *
 * The signature is `TabProps`, not `InternalTabProps` — the internal `__`-prefixed
 * props used to be part of the exported type, so they autocompleted for consumers and
 * could be passed in from outside.
 */
function TabImpl({
  children,
  disabled = false,
  className,
  style,
  __index = 0,
  __selected = false,
  __tabId,
  __panelId,
  __onSelect,
  __onFocus,
  __onKeyDown,
  __tabRef,
}: InternalTabProps) {
  return (
    <button
      ref={(node) => {
        if (__tabRef) {
          __tabRef.current[__index] = node;
        }
      }}
      id={__tabId}
      type="button"
      role="tab"
      aria-selected={__selected}
      aria-controls={__panelId}
      tabIndex={__selected ? 0 : -1}
      data-state={__selected ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      className={className}
      onClick={() => {
        if (!disabled) {
          __onSelect?.();
        }
      }}
      onFocus={() => {
        if (!disabled) {
          __onFocus?.();
        }
      }}
      onKeyDown={__onKeyDown}
      style={{
        padding: '10px 20px',
        border: 'none',
        background: __selected ? '#0f172a' : 'transparent',
        color: __selected ? '#ffffff' : 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function TabPanels({ children, className, style }: TabPanelsProps) {
  const { baseId } = useTabs();
  const panels = Children.toArray(children).filter(isValidElement) as ReactElement<InternalTabPanelProps>[];

  return (
    <div className={className} style={style}>
      {panels.map((panel, index) => cloneElement(panel, { __index: index, key: panel.key ?? `${baseId}-panel-node-${index}` }))}
    </div>
  );
}

function TabPanelImpl({
  children,
  className,
  style,
  forceMount = false,
  __index = 0,
}: InternalTabPanelProps) {
  const { selectedIndex, baseId } = useTabs();
  const isSelected = selectedIndex === __index;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      id={`${baseId}-panel-${__index}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${__index}`}
      hidden={!isSelected}
      tabIndex={0}
      data-state={isSelected ? 'active' : 'inactive'}
      className={className}
      style={{
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Re-exported under the public prop types. `TabList` / `TabPanels` still clone them
// with the internal props, which is invisible to consumers.
export const Tab = TabImpl as (props: TabProps) => ReactElement;
export const TabPanel = TabPanelImpl as (props: TabPanelProps) => ReactElement;

export function useTabsContext() {
  return useTabs();
}
