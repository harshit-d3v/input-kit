// @input-kit/menu - Context menu component

import React, {
  useState,
  useCallback,
  useId,
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
  
  // Idempotent: `Menu` now owns outside-click and Escape dismissal too, so `close`
  // can arrive twice for one gesture. Only the first should notify.
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const close = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
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
  isSubmenu = false,
  onDismissSubmenu,
}: MenuProps & { isSubmenu?: boolean; onDismissSubmenu?: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
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

  // Keyboard navigation is bound to the menu element and driven by REAL focus.
  //
  // It used to be a document-level listener moving a background colour: nothing was
  // ever focused, so assistive tech was told nothing about the active item, and every
  // mounted Menu listened at once — with a submenu open, ArrowDown advanced the
  // parent and the child simultaneously. Focus living inside one menu at a time fixes
  // both: only the focused menu's handler fires.
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Focus the first selectable item on open, so the keyboard has somewhere to start.
  useEffect(() => {
    const first = navigableItems.findIndex((item) => !item.disabled);
    if (first === -1) {
      menuRef.current?.focus();
      return;
    }
    setFocusedIndex(first);
    itemRefs.current[first]?.focus();
    // Deliberately keyed on nothing: this runs once per mounted menu (and each
    // submenu is a fresh mount), which is exactly when focus should enter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusIndex = useCallback((index: number) => {
    if (index < 0) return;
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const openSubmenuFor = useCallback((item: MenuItem, index: number) => {
    if (!item.children) return;
    const itemEl = menuRef.current?.querySelector(`[data-index="${index}"]`);
    if (!itemEl) return;
    const rect = itemEl.getBoundingClientRect();
    setSubmenuItem(item);
    setSubmenuPosition(clampMenuPosition({ x: rect.right, y: rect.top }, item.children.length));
  }, []);

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusIndex(getNextEnabledIndex(focusedIndex, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusIndex(getNextEnabledIndex(focusedIndex === -1 ? 0 : focusedIndex, -1));
        break;
      case 'Home':
        e.preventDefault();
        focusIndex(navigableItems.findIndex((item) => !item.disabled));
        break;
      case 'End': {
        e.preventDefault();
        for (let i = navigableItems.length - 1; i >= 0; i--) {
          if (!navigableItems[i].disabled) { focusIndex(i); break; }
        }
        break;
      }
      case 'ArrowRight': {
        if (focusedIndex < 0) return;
        const item = navigableItems[focusedIndex];
        if (!item?.children) return;
        e.preventDefault();
        openSubmenuFor(item, focusedIndex);
        break;
      }
      case 'ArrowLeft':
        // In a submenu this hands control back to the parent; in a root menu with a
        // submenu showing it closes that submenu.
        e.preventDefault();
        if (isSubmenu) onDismissSubmenu?.();
        else setSubmenuItem(null);
        break;
      case 'Enter':
      case ' ': {
        if (focusedIndex < 0) return;
        const item = navigableItems[focusedIndex];
        if (!item || item.disabled) return;
        e.preventDefault();
        if (item.children) { openSubmenuFor(item, focusedIndex); return; }
        item.onClick?.();
        onSelect?.(item);
        onClose();
        break;
      }
      default:
        return;
    }
  };

  // Dismiss on outside click and on Escape.
  //
  // This used to live only in `useContextMenu`, which `DropdownMenu` does not use —
  // so a dropdown could not be closed by clicking away from it. Owning it here means
  // every way of opening a `Menu` gets the behaviour. Submenus skip it: the root menu
  // already covers the whole chain, and the root's own `onClose` is passed down.
  useEffect(() => {
    if (isSubmenu || typeof document === 'undefined') return;

    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Deferred so the click that opened the menu does not immediately close it.
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmenu, onClose]);


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
        tabIndex={-1}
        onKeyDown={handleMenuKeyDown}
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
            <button
              key={item.id}
              type="button"
              ref={(el) => { itemRefs.current[navIndex] = el; }}
              id={`${menuId}-item-${item.id}`}
              data-id={item.id}
              data-index={navIndex}
              role="menuitem"
              aria-disabled={item.disabled || undefined}
              aria-haspopup={item.children ? 'menu' : undefined}
              aria-expanded={item.children ? submenuItem?.id === item.id : undefined}
              // Roving tabindex: one item in the tab order, the rest reachable by
              // arrow keys. `aria-disabled` rather than the native attribute keeps
              // disabled entries discoverable instead of skipping them silently.
              tabIndex={isFocused ? 0 : -1}
              onClick={() => handleItemClick(item)}
              onFocus={() => setFocusedIndex(navIndex)}
              onMouseEnter={() => handleItemHover(item, navIndex)}
              style={{
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                border: 'none',
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
                <span style={{ fontSize: '12px', color: '#9ca3af' }} aria-hidden="true">›</span>
              )}
            </button>
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
          isSubmenu
          onDismissSubmenu={() => {
            // ArrowLeft in the submenu returns control here, and focus goes back to
            // the parent item it came from rather than being dropped on the body.
            const parentIndex = navigableItems.findIndex((i) => i.id === submenuItem.id);
            setSubmenuItem(null);
            if (parentIndex >= 0) focusIndex(parentIndex);
          }}
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
