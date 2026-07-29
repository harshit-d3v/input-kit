// @input-kit/menu - Context menu component

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

// Types
export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

export interface MenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  items: MenuItem[];
  children: ReactNode;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface MenuProps {
  items: MenuItem[];
  position: MenuPosition;
  onClose: () => void;
  onSelect?: (item: MenuItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseContextMenuOptions {
  onOpen?: (position: MenuPosition) => void;
  onClose?: () => void;
  disabled?: boolean;
}

export interface UseContextMenuReturn {
  isOpen: boolean;
  position: MenuPosition;
  open: (position: MenuPosition) => void;
  close: () => void;
  handleContextMenu: (e: MouseEvent) => void;
}

const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 40;
const VIEWPORT_MARGIN = 8;

function clampMenuPosition(position: MenuPosition, itemCount: number): MenuPosition {
  if (typeof window === 'undefined') {
    return position;
  }

  const estimatedHeight = Math.max(itemCount, 1) * MENU_ITEM_HEIGHT + VIEWPORT_MARGIN * 2;

  return {
    x: Math.max(VIEWPORT_MARGIN, Math.min(position.x, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN)),
    y: Math.max(VIEWPORT_MARGIN, Math.min(position.y, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN)),
  };
}

// Hook
export function useContextMenu(options: UseContextMenuOptions = {}): UseContextMenuReturn {
  const { onOpen, onClose, disabled = false } = options;
  
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  
  const open = useCallback((pos: MenuPosition) => {
    if (disabled) return;
    setPosition(pos);
    setIsOpen(true);
    onOpen?.(pos);
  }, [disabled, onOpen]);
  
  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);
  
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    open({ x: e.clientX, y: e.clientY });
  }, [disabled, open]);
  
  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (_e: globalThis.MouseEvent) => {
      close();
    };
    
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    
    // Delay to prevent immediate close from the same click
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);
  
  return { isOpen, position, open, close, handleContextMenu };
}

// Menu Component
export function Menu({
  items,
  position,
  onClose,
  onSelect,
  className,
  style,
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [submenuItem, setSubmenuItem] = useState<MenuItem | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  
  // Filter out separators for keyboard navigation
  const navigableItems = items.filter(item => item.id !== 'separator');

  const getNextEnabledIndex = useCallback((startIndex: number, direction: 1 | -1) => {
    if (navigableItems.length === 0 || navigableItems.every(item => item.disabled)) {
      return -1;
    }

    let nextIndex = startIndex;

    for (let attempt = 0; attempt < navigableItems.length; attempt++) {
      nextIndex += direction;

      if (nextIndex < 0) {
        nextIndex = navigableItems.length - 1;
      }

      if (nextIndex >= navigableItems.length) {
        nextIndex = 0;
      }

      if (!navigableItems[nextIndex].disabled) {
        return nextIndex;
      }
    }

    return -1;
  }, [navigableItems]);

  useEffect(() => {
    const firstEnabledIndex = navigableItems.findIndex(item => !item.disabled);
    setFocusedIndex(firstEnabledIndex);
  }, [navigableItems]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => getNextEnabledIndex(prev, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => getNextEnabledIndex(prev === -1 ? 0 : prev, -1));
          break;
        case 'ArrowRight':
          if (focusedIndex >= 0) {
            const item = navigableItems[focusedIndex];
            if (item.children) {
              const itemEl = menuRef.current?.querySelector(`[data-index="${focusedIndex}"]`);
              if (itemEl) {
                const rect = itemEl.getBoundingClientRect();
                setSubmenuItem(item);
                setSubmenuPosition(clampMenuPosition({ x: rect.right, y: rect.top }, item.children.length));
              }
            }
          }
          break;
        case 'ArrowLeft':
          setSubmenuItem(null);
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0) {
            const item = navigableItems[focusedIndex];
            if (!item.disabled && !item.children) {
              item.onClick?.();
              onSelect?.(item);
              onClose();
            }
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, getNextEnabledIndex, navigableItems, onClose, onSelect]);
  
  // Adjust position to stay in viewport
  const adjustedPosition = clampMenuPosition(position, items.length);
  
  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    
    if (item.children) {
      // Show submenu
      const itemEl = menuRef.current?.querySelector(`[data-id="${item.id}"]`);
      if (itemEl) {
        const rect = itemEl.getBoundingClientRect();
        setSubmenuItem(item);
        setSubmenuPosition(clampMenuPosition({ x: rect.right, y: rect.top }, item.children.length));
      }
    } else {
      item.onClick?.();
      onSelect?.(item);
      onClose();
    }
  };
  
  const handleItemHover = (item: MenuItem, index: number) => {
    setFocusedIndex(index);
    
    if (item.children) {
      const itemEl = menuRef.current?.querySelector(`[data-id="${item.id}"]`);
      if (itemEl) {
        const rect = itemEl.getBoundingClientRect();
        setSubmenuItem(item);
        setSubmenuPosition(clampMenuPosition({ x: rect.right, y: rect.top }, item.children.length));
      }
    } else {
      setSubmenuItem(null);
    }
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <div
        ref={menuRef}
        role="menu"
        className={className}
        style={{
          position: 'fixed',
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          minWidth: '180px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          padding: '4px',
          zIndex: 10000,
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          if (item.id === 'separator') {
            return (
              <div
                key={`separator-${index}`}
                style={{
                  height: '1px',
                  background: '#e5e7eb',
                  margin: '4px 8px',
                }}
              />
            );
          }
          
          const navIndex = navigableItems.indexOf(item);
          const isFocused = navIndex === focusedIndex;
          
          return (
            <div
              key={item.id}
              data-id={item.id}
              data-index={navIndex}
              role="menuitem"
              aria-disabled={item.disabled || undefined}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => handleItemHover(item, navIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                background: isFocused ? '#f3f4f6' : 'transparent',
                color: item.disabled ? '#9ca3af' : item.danger ? '#ef4444' : '#111827',
                fontSize: '14px',
                transition: 'background 0.1s',
              }}
            >
              {item.icon && (
                <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>
                  {item.icon}
                </span>
              )}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {item.shortcut}
                </span>
              )}
              {item.children && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>›</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Submenu */}
      {submenuItem && submenuItem.children && (
        <Menu
          items={submenuItem.children}
          position={submenuPosition}
          onClose={onClose}
          onSelect={onSelect}
        />
      )}
    </>,
    document.body
  );
}

// Context Menu Component
export function ContextMenu({
  items,
  children,
  disabled = false,
  onOpenChange,
  className,
  style,
}: ContextMenuProps) {
  const { isOpen, position, handleContextMenu, close } = useContextMenu({
    disabled,
    onOpen: () => onOpenChange?.(true),
    onClose: () => onOpenChange?.(false),
  });
  
  return (
    <>
      <div onContextMenu={handleContextMenu} className={className} style={style}>
        {children}
      </div>
      
      {isOpen && (
        <Menu
          items={items}
          position={position}
          onClose={close}
        />
      )}
    </>
  );
}

// Dropdown Menu Component
export function DropdownMenu({
  items,
  trigger,
  align = 'start',
  side = 'bottom',
  disabled = false,
  onOpenChange,
  className,
  style,
}: {
  items: MenuItem[];
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  
  const open = useCallback(() => {
    if (disabled || !triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    let x = rect.left;
    let y = side === 'bottom' ? rect.bottom + 4 : rect.top - (items.length * MENU_ITEM_HEIGHT + 4);
    
    if (align === 'center') {
      x = rect.left + rect.width / 2 - 90; // Assuming 180px menu width
    } else if (align === 'end') {
      x = rect.right - 180;
    }
    
    setPosition(clampMenuPosition({ x, y }, items.length));
    setIsOpen(true);
    onOpenChange?.(true);
  }, [disabled, align, side, items.length, onOpenChange]);
  
  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);
  
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);
  
  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        disabled={disabled}
        className={className}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style,
        }}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <Menu
          items={items}
          position={position}
          onClose={close}
        />
      )}
    </>
  );
}

// Utility to create separator
export function menuSeparator(): MenuItem {
  return { id: 'separator', label: '' };
}

// Utility to create menu item
export function menuItem(
  id: string,
  label: string,
  options?: Partial<Omit<MenuItem, 'id' | 'label'>>
): MenuItem {
  return { id, label, ...options };
}
