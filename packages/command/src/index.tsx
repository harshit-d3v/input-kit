// @input-kit/command - Command palette component

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// Types
export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  keywords?: string[];
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}

export interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseCommandPaletteOptions {
  commands: Command[];
  onSelect?: (command: Command) => void;
}

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (query: string) => void;
  filteredCommands: Command[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  executeSelected: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

// Fuzzy search
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let textIndex = 0;
  let queryIndex = 0;
  
  while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
    textIndex++;
  }
  
  return queryIndex === lowerQuery.length;
}

function searchCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands;
  
  return commands.filter(cmd => {
    const searchText = [
      cmd.label,
      cmd.description || '',
      ...(cmd.keywords || []),
    ].join(' ');
    
    return fuzzyMatch(searchText, query);
  });
}

// Group commands
function groupCommands(commands: Command[]): CommandGroup[] {
  const grouped = new Map<string, Command[]>();
  const ungrouped: Command[] = [];
  
  commands.forEach(cmd => {
    if (cmd.group) {
      const group = grouped.get(cmd.group) || [];
      group.push(cmd);
      grouped.set(cmd.group, group);
    } else {
      ungrouped.push(cmd);
    }
  });
  
  const result: CommandGroup[] = [];
  
  if (ungrouped.length > 0) {
    result.push({ id: '__ungrouped', label: '', commands: ungrouped });
  }
  
  grouped.forEach((cmds, label) => {
    result.push({ id: label, label, commands: cmds });
  });
  
  return result;
}

// Hook
export function useCommandPalette(options: UseCommandPaletteOptions): UseCommandPaletteReturn {
  const { commands, onSelect } = options;
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const filteredCommands = useMemo(
    () => searchCommands(commands, query),
    [commands, query]
  );
  
  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);
  
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);
  
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);
  
  const selectNext = useCallback(() => {
    setSelectedIndex(prev => 
      prev < filteredCommands.length - 1 ? prev + 1 : 0
    );
  }, [filteredCommands.length]);
  
  const selectPrevious = useCallback(() => {
    setSelectedIndex(prev => 
      prev > 0 ? prev - 1 : filteredCommands.length - 1
    );
  }, [filteredCommands.length]);
  
  const executeSelected = useCallback(() => {
    const command = filteredCommands[selectedIndex];
    if (command && !command.disabled) {
      command.onSelect();
      onSelect?.(command);
      close();
    }
  }, [filteredCommands, selectedIndex, onSelect, close]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectPrevious();
        break;
      case 'Enter':
        e.preventDefault();
        executeSelected();
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }, [selectNext, selectPrevious, executeSelected, close]);
  
  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggle]);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    filteredCommands,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    executeSelected,
    handleKeyDown,
  };
}

// Components
export function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
  className,
  style,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    filteredCommands,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  } = useCommandPalette({ commands, onSelect: onClose });
  
  const groups = useMemo(() => groupCommands(filteredCommands), [filteredCommands]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  // Scroll selected item into view
  useEffect(() => {
    const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);
  
  if (!isOpen) return null;
  
  const content = (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        ...style,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Input */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        </div>
        
        {/* Results */}
        <div
          ref={listRef}
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              {emptyMessage}
            </div>
          ) : (
            groups.map(group => (
              <div key={group.id}>
                {group.label && (
                  <div
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                    }}
                  >
                    {group.label}
                  </div>
                )}
                {group.commands.map((cmd) => {
                  const flatIndex = filteredCommands.indexOf(cmd);
                  const isSelected = flatIndex === selectedIndex;
                  
                  return (
                    <div
                      key={cmd.id}
                      data-index={flatIndex}
                      onClick={() => {
                        if (!cmd.disabled) {
                          cmd.onSelect();
                          onClose();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: cmd.disabled ? 'not-allowed' : 'pointer',
                        background: isSelected ? '#f3f4f6' : 'transparent',
                        opacity: cmd.disabled ? 0.5 : 1,
                      }}
                    >
                      {cmd.icon && (
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>
                          {cmd.icon}
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{cmd.label}</div>
                        {cmd.description && (
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          <span><kbd style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>Up/Down</kbd> Navigate</span>
          <span><kbd style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>↵</kbd> Select</span>
          <span><kbd style={{ background: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
  
  return createPortal(content, document.body);
}

// Context for global command registration
interface CommandContextValue {
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  commands: Command[];
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [commands, setCommands] = useState<Command[]>([]);
  
  const registerCommand = useCallback((command: Command) => {
    setCommands(prev => [...prev.filter(c => c.id !== command.id), command]);
  }, []);
  
  const unregisterCommand = useCallback((id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  }, []);
  
  return (
    <CommandContext.Provider value={{ commands, registerCommand, unregisterCommand }}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommands() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommands must be used within a CommandProvider');
  }
  return context;
}

// Hook to register a command
export function useRegisterCommand(command: Command) {
  const { registerCommand, unregisterCommand } = useCommands();
  // Keep a ref so the registered closure always has the latest command data
  // without re-running the effect every render (avoids infinite re-registration
  // when the caller passes an inline object literal).
  const commandRef = useRef(command);
  commandRef.current = command;

  const { id } = command;

  useEffect(() => {
    registerCommand(commandRef.current);
    return () => unregisterCommand(id);
  }, [id, registerCommand, unregisterCommand]);
}
