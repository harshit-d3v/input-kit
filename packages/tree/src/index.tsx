// @input-kit/tree - Tree view component with expand/collapse functionality

import { useState, useCallback, useMemo, createContext, useContext, useRef, useEffect } from 'react';

// ============================================================================
// SVG Icon Components (Lucide-style)
// ============================================================================

const ChevronRightIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const FolderIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const FolderOpenIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v2" />
  </svg>
);

const FileIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export interface TreeNode<T = unknown> {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Child nodes */
  children?: TreeNode<T>[];
  /** Custom icon */
  icon?: React.ReactNode;
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Whether the node is selectable */
  selectable?: boolean;
  /** Whether the node is a leaf (cannot have children) */
  isLeaf?: boolean;
  /** Custom data associated with this node */
  data?: T;
}

export interface FlatTreeNode<T = unknown> extends Omit<TreeNode<T>, 'children'> {
  /** Parent node ID (null for root nodes) */
  parentId: string | null;
  /** Depth level (0 for root nodes) */
  depth: number;
  /** Whether the node has children */
  hasChildren: boolean;
  /** Array of child IDs */
  childIds: string[];
}

export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox';

export interface TreeContextValue {
  /** Expanded node IDs */
  expandedIds: Set<string>;
  /** Selected node IDs */
  selectedIds: Set<string>;
  /** Checked node IDs (for checkbox mode) */
  checkedIds: Set<string>;
  /** Currently focused node ID */
  focusedId: string | null;
  /** Selection mode */
  selectionMode: TreeSelectionMode;
  /** Whether to show checkboxes */
  showCheckbox: boolean;
  /** Whether to show icons */
  showIcon: boolean;
  /** Indentation per level in pixels */
  indent: number;
  /** Enable animations */
  animate: boolean;
  /** IDs of currently visible nodes in keyboard order */
  visibleIds: string[];
  /** Toggle expand state */
  toggleExpand: (id: string) => void;
  /** Toggle selection */
  toggleSelect: (id: string) => void;
  /** Toggle checkbox */
  toggleCheck: (id: string) => void;
  /** Set focused node */
  setFocusedId: (id: string | null) => void;
  /** Get parent node ID */
  getParentId: (id: string) => string | null;
  /** Check if node is expanded */
  isExpanded: (id: string) => boolean;
  /** Check if node is selected */
  isSelected: (id: string) => boolean;
  /** Check if node is checked */
  isChecked: (id: string) => boolean;
  /** Check if node is indeterminate (some children checked) */
  isIndeterminate: (id: string) => boolean;
}

export interface UseTreeOptions<T = unknown> {
  /** Tree data */
  nodes: TreeNode<T>[];
  /** Initially expanded node IDs */
  defaultExpandedIds?: string[];
  /** Initially selected node IDs */
  defaultSelectedIds?: string[];
  /** Initially checked node IDs */
  defaultCheckedIds?: string[];
  /** Selection mode */
  selectionMode?: TreeSelectionMode;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when expansion changes */
  onExpansionChange?: (expandedIds: string[]) => void;
  /** Callback when checked state changes */
  onCheckedChange?: (checkedIds: string[]) => void;
  /** Callback when a node is clicked */
  onNodeClick?: (node: TreeNode<T>) => void;
  /** Cascade check state to children */
  cascadeCheck?: boolean;
  /** Controlled expanded node IDs. When set, internal expansion state is not used. */
  expandedIds?: string[];
  /** Controlled selected node IDs. When set, internal selection state is not used. */
  selectedIds?: string[];
}

export interface UseTreeReturn<T = unknown> {
  /** Flattened tree nodes */
  flatNodes: Map<string, FlatTreeNode<T>>;
  /** Root node IDs */
  rootIds: string[];
  /** Expanded node IDs */
  expandedIds: Set<string>;
  /** Selected node IDs */
  selectedIds: Set<string>;
  /** Checked node IDs */
  checkedIds: Set<string>;
  /** Currently focused node ID */
  focusedId: string | null;
  /** Toggle expand state */
  toggleExpand: (id: string) => void;
  /** Expand a node */
  expand: (id: string) => void;
  /** Collapse a node */
  collapse: (id: string) => void;
  /** Expand all nodes */
  expandAll: () => void;
  /** Collapse all nodes */
  collapseAll: () => void;
  /** Toggle selection */
  toggleSelect: (id: string) => void;
  /** Select a node */
  select: (id: string) => void;
  /** Deselect a node */
  deselect: (id: string) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Toggle checkbox */
  toggleCheck: (id: string) => void;
  /** Check a node */
  check: (id: string) => void;
  /** Uncheck a node */
  uncheck: (id: string) => void;
  /** Clear all checks */
  clearChecked: () => void;
  /** Set focused node */
  setFocusedId: (id: string | null) => void;
  /** Get node by ID */
  getNode: (id: string) => FlatTreeNode<T> | undefined;
  /** Get children of a node */
  getChildren: (id: string) => FlatTreeNode<T>[];
  /** Get parent of a node */
  getParent: (id: string) => FlatTreeNode<T> | undefined;
  /** Get all ancestors of a node */
  getAncestors: (id: string) => FlatTreeNode<T>[];
  /** Get all descendants of a node */
  getDescendants: (id: string) => FlatTreeNode<T>[];
  /** Check if node is visible (all ancestors expanded) */
  isVisible: (id: string) => boolean;
  /** Check if node is indeterminate */
  isIndeterminate: (id: string) => boolean;
  /** Search nodes by label */
  search: (query: string) => FlatTreeNode<T>[];
  /** Filter nodes */
  filter: (predicate: (node: FlatTreeNode<T>) => boolean) => FlatTreeNode<T>[];
}

export interface TreeProps<T = unknown> {
  /** Tree data */
  nodes: TreeNode<T>[];
  /** Children (for custom rendering) */
  children?: React.ReactNode;
  /** Selection mode */
  selectionMode?: TreeSelectionMode;
  /** Show checkboxes */
  showCheckbox?: boolean;
  /** Show icons */
  showIcon?: boolean;
  /** Indentation per level in pixels */
  indent?: number;
  /** Enable animations */
  animate?: boolean;
  /** Initially expanded node IDs */
  defaultExpandedIds?: string[];
  /** Initially selected node IDs */
  defaultSelectedIds?: string[];
  /** Controlled expanded IDs */
  expandedIds?: string[];
  /** Controlled selected IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when expansion changes */
  onExpansionChange?: (expandedIds: string[]) => void;
  /** Callback when a node is clicked */
  onNodeClick?: (node: TreeNode<T>) => void;
  /** Cascade check state to children */
  cascadeCheck?: boolean;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface TreeNodeProps<T = unknown> {
  /** Node data */
  node: TreeNode<T>;
  /** Depth level */
  depth?: number;
  /** Whether this is the last child */
  isLast?: boolean;
  /** Position in the current sibling set */
  positionInSet?: number;
  /** Total siblings in the current set */
  setSize?: number;
  /** Custom render function for label */
  renderLabel?: (node: TreeNode<T>) => React.ReactNode;
  /** Custom render function for icon */
  renderIcon?: (node: TreeNode<T>, expanded: boolean) => React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Context
// ============================================================================

const TreeContext = createContext<TreeContextValue | null>(null);

function useTreeContext(): TreeContextValue {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('Tree components must be used within a Tree provider');
  }
  return context;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Flatten a tree structure into a map
 */
export function flattenTree<T>(
  nodes: TreeNode<T>[],
  parentId: string | null = null,
  depth: number = 0
): Map<string, FlatTreeNode<T>> {
  const result = new Map<string, FlatTreeNode<T>>();

  for (const node of nodes) {
    const childIds = node.children?.map((c) => c.id) || [];
    
    result.set(node.id, {
      id: node.id,
      label: node.label,
      icon: node.icon,
      disabled: node.disabled,
      selectable: node.selectable,
      isLeaf: node.isLeaf ?? !node.children?.length,
      data: node.data,
      parentId,
      depth,
      hasChildren: childIds.length > 0,
      childIds,
    });

    if (node.children) {
      const childNodes = flattenTree(node.children, node.id, depth + 1);
      childNodes.forEach((value, key) => result.set(key, value));
    }
  }

  return result;
}

/**
 * Get all descendant IDs of a node
 */
export function getDescendantIds<T>(
  nodeId: string,
  flatNodes: Map<string, FlatTreeNode<T>>
): string[] {
  const node = flatNodes.get(nodeId);
  if (!node) return [];

  const descendants: string[] = [];
  
  const traverse = (id: string) => {
    const n = flatNodes.get(id);
    if (!n) return;
    
    for (const childId of n.childIds) {
      descendants.push(childId);
      traverse(childId);
    }
  };

  traverse(nodeId);
  return descendants;
}

/**
 * Get all ancestor IDs of a node
 */
export function getAncestorIds<T>(
  nodeId: string,
  flatNodes: Map<string, FlatTreeNode<T>>
): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = flatNodes.get(currentId);
    if (!node || !node.parentId) break;
    ancestors.push(node.parentId);
    currentId = node.parentId;
  }

  return ancestors;
}

/**
 * Build tree from flat nodes
 */
export function buildTree<T>(
  flatNodes: Map<string, FlatTreeNode<T>>
): TreeNode<T>[] {
  const nodeMap = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // First pass: create all nodes
  flatNodes.forEach((flat) => {
    nodeMap.set(flat.id, {
      id: flat.id,
      label: flat.label,
      icon: flat.icon,
      disabled: flat.disabled,
      selectable: flat.selectable,
      isLeaf: flat.isLeaf,
      data: flat.data,
      children: [],
    });
  });

  // Second pass: connect children to parents
  flatNodes.forEach((flat) => {
    const node = nodeMap.get(flat.id)!;
    if (flat.parentId) {
      const parent = nodeMap.get(flat.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function getVisibleNodeIds<T>(
  nodes: TreeNode<T>[],
  expandedIds: Set<string>
): string[] {
  const ids: string[] = [];

  const traverse = (nodeList: TreeNode<T>[]) => {
    nodeList.forEach((node) => {
      ids.push(node.id);
      if (node.children && expandedIds.has(node.id)) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return ids;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for managing tree state
 */
export function useTree<T = unknown>(options: UseTreeOptions<T>): UseTreeReturn<T> {
  const {
    nodes,
    defaultExpandedIds = [],
    defaultSelectedIds = [],
    defaultCheckedIds = [],
    selectionMode = 'single',
    onSelectionChange,
    onExpansionChange,
    onCheckedChange,
    onNodeClick,
    cascadeCheck = true,
    expandedIds: controlledExpandedIds,
    selectedIds: controlledSelectedIds,
  } = options;

  const flatNodes = useMemo(() => flattenTree(nodes), [nodes]);
  const rootIds = useMemo(
    () => nodes.map((n) => n.id),
    [nodes]
  );

  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  );
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedIds)
  );

  // Controlled expansion/selection is resolved here rather than in `Tree`. It used to
  // be layered on top afterwards, which meant the mutators still derived their next
  // state — and therefore the argument handed to onExpansionChange — from the
  // internal set the parent never updated. `expandedIds={['a']}` plus a click on `b`
  // reported `['b']` instead of `['a','b']`.
  const isExpansionControlled = controlledExpandedIds !== undefined;
  const isSelectionControlled = controlledSelectedIds !== undefined;

  const expandedIds = useMemo(
    () => (controlledExpandedIds ? new Set(controlledExpandedIds) : internalExpandedIds),
    [controlledExpandedIds, internalExpandedIds]
  );
  const selectedIds = useMemo(
    () => (controlledSelectedIds ? new Set(controlledSelectedIds) : internalSelectedIds),
    [controlledSelectedIds, internalSelectedIds]
  );
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(defaultCheckedIds)
  );
  const [focusedId, setFocusedId] = useState<string | null>(
    () => defaultSelectedIds[0] ?? nodes[0]?.id ?? null
  );

  // Every mutator below computes its next state from a ref rather than from a
  // `setState` updater, then notifies. Notifying *inside* an updater — which is what
  // this hook used to do throughout — breaks the purity React requires: StrictMode
  // invokes updaters twice, so each consumer callback fired twice per interaction,
  // and React may re-run them again when rebasing concurrent updates.
  const expandedRef = useRef(expandedIds);
  expandedRef.current = expandedIds;
  const selectedRef = useRef(selectedIds);
  selectedRef.current = selectedIds;
  const checkedRef = useRef(checkedIds);
  checkedRef.current = checkedIds;

  const commitExpanded = useCallback((next: Set<string>) => {
    expandedRef.current = next;
    if (!isExpansionControlled) setInternalExpandedIds(next);
    onExpansionChange?.(Array.from(next));
  }, [isExpansionControlled, onExpansionChange]);

  const commitSelected = useCallback((next: Set<string>) => {
    selectedRef.current = next;
    if (!isSelectionControlled) setInternalSelectedIds(next);
    onSelectionChange?.(Array.from(next));
  }, [isSelectionControlled, onSelectionChange]);

  const commitChecked = useCallback((next: Set<string>) => {
    checkedRef.current = next;
    setCheckedIds(next);
    onCheckedChange?.(Array.from(next));
  }, [onCheckedChange]);

  // Expansion
  const toggleExpand = useCallback((id: string) => {
    const next = new Set(expandedRef.current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    commitExpanded(next);
  }, [commitExpanded]);

  const expand = useCallback((id: string) => {
    if (expandedRef.current.has(id)) return;
    const next = new Set(expandedRef.current);
    next.add(id);
    commitExpanded(next);
  }, [commitExpanded]);

  const collapse = useCallback((id: string) => {
    if (!expandedRef.current.has(id)) return;
    const next = new Set(expandedRef.current);
    next.delete(id);
    commitExpanded(next);
  }, [commitExpanded]);

  const expandAll = useCallback(() => {
    const allIds = Array.from(flatNodes.keys()).filter(
      (id) => flatNodes.get(id)?.hasChildren
    );
    commitExpanded(new Set(allIds));
  }, [flatNodes, commitExpanded]);

  const collapseAll = useCallback(() => {
    commitExpanded(new Set());
  }, [commitExpanded]);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    const node = flatNodes.get(id);
    if (node?.disabled || node?.selectable === false) return;

    const prev = selectedRef.current;
    const next = new Set(selectionMode === 'single' ? [] : prev);
    if (prev.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    commitSelected(next);

    if (onNodeClick) {
      const originalNode = findNodeById(nodes, id);
      if (originalNode) onNodeClick(originalNode);
    }
  }, [flatNodes, selectionMode, commitSelected, onNodeClick, nodes]);

  const select = useCallback((id: string) => {
    const next = new Set(
      selectionMode === 'single' ? [id] : [...selectedRef.current, id]
    );
    commitSelected(next);
  }, [selectionMode, commitSelected]);

  const deselect = useCallback((id: string) => {
    const next = new Set(selectedRef.current);
    next.delete(id);
    commitSelected(next);
  }, [commitSelected]);

  const clearSelection = useCallback(() => {
    commitSelected(new Set());
  }, [commitSelected]);

  // Checkbox.
  //
  // `setChecked` is shared by toggle/check/uncheck so all three reconcile ancestors
  // the same way. They previously disagreed: only `toggleCheck` walked back up, so
  // calling `check` on every child left the parent unchecked while the equivalent
  // clicks marked it checked.
  const setChecked = useCallback((id: string, shouldCheck: boolean) => {
    const next = new Set(checkedRef.current);

    if (shouldCheck) {
      next.add(id);
      if (cascadeCheck) {
        getDescendantIds(id, flatNodes).forEach((d) => next.add(d));
      }
    } else {
      next.delete(id);
      if (cascadeCheck) {
        getDescendantIds(id, flatNodes).forEach((d) => next.delete(d));
      }
    }

    if (cascadeCheck) {
      getAncestorIds(id, flatNodes).forEach((ancestorId) => {
        const ancestor = flatNodes.get(ancestorId);
        if (!ancestor) return;

        const allChildrenChecked = ancestor.childIds.every((c) => next.has(c));
        if (allChildrenChecked) {
          next.add(ancestorId);
        } else {
          next.delete(ancestorId);
        }
      });
    }

    commitChecked(next);
  }, [flatNodes, cascadeCheck, commitChecked]);

  const toggleCheck = useCallback((id: string) => {
    const node = flatNodes.get(id);
    if (node?.disabled) return;
    setChecked(id, !checkedRef.current.has(id));
  }, [flatNodes, setChecked]);

  const check = useCallback((id: string) => {
    setChecked(id, true);
  }, [setChecked]);

  const uncheck = useCallback((id: string) => {
    setChecked(id, false);
  }, [setChecked]);

  const clearChecked = useCallback(() => {
    commitChecked(new Set());
  }, [commitChecked]);

  // Getters
  const getNode = useCallback(
    (id: string) => flatNodes.get(id),
    [flatNodes]
  );

  const getChildren = useCallback(
    (id: string) => {
      const node = flatNodes.get(id);
      if (!node) return [];
      return node.childIds.map((c) => flatNodes.get(c)!).filter(Boolean);
    },
    [flatNodes]
  );

  const getParent = useCallback(
    (id: string) => {
      const node = flatNodes.get(id);
      if (!node?.parentId) return undefined;
      return flatNodes.get(node.parentId);
    },
    [flatNodes]
  );

  const getAncestors = useCallback(
    (id: string) => {
      return getAncestorIds(id, flatNodes)
        .map((a) => flatNodes.get(a)!)
        .filter(Boolean);
    },
    [flatNodes]
  );

  const getDescendants = useCallback(
    (id: string) => {
      return getDescendantIds(id, flatNodes)
        .map((d) => flatNodes.get(d)!)
        .filter(Boolean);
    },
    [flatNodes]
  );

  const isVisible = useCallback(
    (id: string) => {
      const ancestors = getAncestorIds(id, flatNodes);
      return ancestors.every((a) => expandedIds.has(a));
    },
    [flatNodes, expandedIds]
  );

  const isIndeterminate = useCallback(
    (id: string) => {
      const node = flatNodes.get(id);
      if (!node?.hasChildren) return false;

      const descendants = getDescendantIds(id, flatNodes);
      const checkedCount = descendants.filter((d) => checkedIds.has(d)).length;
      
      return checkedCount > 0 && checkedCount < descendants.length;
    },
    [flatNodes, checkedIds]
  );

  const search = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return Array.from(flatNodes.values()).filter((n) =>
        n.label.toLowerCase().includes(lowerQuery)
      );
    },
    [flatNodes]
  );

  const filter = useCallback(
    (predicate: (node: FlatTreeNode<T>) => boolean) => {
      return Array.from(flatNodes.values()).filter(predicate);
    },
    [flatNodes]
  );

  return {
    flatNodes,
    rootIds,
    expandedIds,
    selectedIds,
    checkedIds,
    focusedId,
    toggleExpand,
    expand,
    collapse,
    expandAll,
    collapseAll,
    toggleSelect,
    select,
    deselect,
    clearSelection,
    toggleCheck,
    check,
    uncheck,
    clearChecked,
    setFocusedId,
    getNode,
    getChildren,
    getParent,
    getAncestors,
    getDescendants,
    isVisible,
    isIndeterminate,
    search,
    filter,
  };
}

// Helper to find node by ID in nested structure
function findNodeById<T>(nodes: TreeNode<T>[], id: string): TreeNode<T> | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Expand/collapse toggle button
 */
function TreeToggle({
  expanded,
  hasChildren,
  onToggle,
  animate,
}: {
  expanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  animate: boolean;
}): JSX.Element | null {
  if (!hasChildren) {
    return <span style={{ width: 20, display: 'inline-block' }} />;
  }

  const style: React.CSSProperties = {
    width: 20,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '10px',
    color: '#6b7280',
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: animate ? 'transform 0.15s ease' : undefined,
  };

  return (
    <span
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-hidden="true"
    >
      <ChevronRightIcon size={10} />
    </span>
  );
}

/**
 * Checkbox component for tree
 */
function TreeCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: () => void;
}): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const style: React.CSSProperties = {
    margin: '0 4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      style={style}
    />
  );
}

/**
 * Individual tree node component
 */
export function TreeNodeComponent<T = unknown>({
  node,
  depth = 0,
  positionInSet = 1,
  setSize = 1,
  renderLabel,
  renderIcon,
  className,
  style,
}: TreeNodeProps<T>): JSX.Element {
  const context = useTreeContext();
  const rowRef = useRef<HTMLDivElement>(null);
  
  const hasChildren = !node.isLeaf && node.children && node.children.length > 0;
  const isExpanded = context.isExpanded(node.id);
  const isSelected = context.isSelected(node.id);
  const isChecked = context.isChecked(node.id);
  const isIndeterminate = context.isIndeterminate(node.id);
  const isFocused = context.focusedId === node.id;

  useEffect(() => {
    if (isFocused) {
      rowRef.current?.focus();
    }
  }, [isFocused]);

  const handleSelect = () => {
    if (!node.disabled) {
      context.setFocusedId(node.id);
      context.toggleSelect(node.id);
    }
  };

  const handleCheck = () => {
    if (!node.disabled) {
      context.toggleCheck(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = context.visibleIds.indexOf(node.id);

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (context.showCheckbox) {
        handleCheck();
      } else {
        handleSelect();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextId = context.visibleIds[currentIndex + 1];
      if (nextId) {
        context.setFocusedId(nextId);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const previousId = context.visibleIds[currentIndex - 1];
      if (previousId) {
        context.setFocusedId(previousId);
      }
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      const firstId = context.visibleIds[0];
      if (firstId) {
        context.setFocusedId(firstId);
      }
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      const lastId = context.visibleIds[context.visibleIds.length - 1];
      if (lastId) {
        context.setFocusedId(lastId);
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (hasChildren && !isExpanded) {
        context.toggleExpand(node.id);
        return;
      }

      const firstChildId = node.children?.[0]?.id;
      if (firstChildId && isExpanded) {
        context.setFocusedId(firstChildId);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (hasChildren && isExpanded) {
        context.toggleExpand(node.id);
        return;
      }

      const parentId = context.getParentId(node.id);
      if (parentId) {
        context.setFocusedId(parentId);
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    ...style,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    paddingLeft: depth * context.indent + 8,
    cursor: node.disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isSelected ? '#e0e7ff' : isFocused ? '#f3f4f6' : 'transparent',
    opacity: node.disabled ? 0.5 : 1,
    borderRadius: '4px',
    outline: isFocused ? '2px solid #93c5fd' : 'none',
    outlineOffset: '-2px',
    transition: context.animate ? 'background-color 0.15s ease' : undefined,
  };

  const labelStyle: React.CSSProperties = {
    marginLeft: '4px',
    fontSize: '14px',
    color: '#1f2937',
    userSelect: 'none',
  };

  const iconStyle: React.CSSProperties = {
    marginLeft: '4px',
    marginRight: '4px',
    display: 'inline-flex',
    alignItems: 'center',
  };

  // Collapsed children are unmounted rather than clipped. The old `max-height: 0`
  // container left every descendant in the DOM and, worse, in the accessibility
  // tree — so a node marked `aria-expanded="false"` still exposed its whole subtree
  // to a screen reader.
  const childrenContainerStyle: React.CSSProperties = {
    overflow: 'hidden',
  };

  const defaultIcon = hasChildren ? (isExpanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />) : <FileIcon size={16} />;

  return (
    <div className={className} style={containerStyle}>
      <div
        ref={rowRef}
        style={rowStyle}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        onFocus={() => context.setFocusedId(node.id)}
        tabIndex={node.disabled ? -1 : isFocused ? 0 : -1}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-checked={context.showCheckbox ? isChecked : undefined}
        aria-disabled={node.disabled || undefined}
        aria-level={depth + 1}
        aria-posinset={positionInSet}
        aria-setsize={setSize}
      >
        <TreeToggle
          expanded={isExpanded}
          hasChildren={hasChildren || false}
          onToggle={() => {
            context.setFocusedId(node.id);
            context.toggleExpand(node.id);
          }}
          animate={context.animate}
        />
        
        {context.showCheckbox && (
          <TreeCheckbox
            checked={isChecked}
            indeterminate={isIndeterminate}
            disabled={node.disabled}
            onChange={handleCheck}
          />
        )}
        
        {context.showIcon && (
          <span style={iconStyle}>
            {renderIcon
              ? renderIcon(node, isExpanded)
              : node.icon || defaultIcon}
          </span>
        )}
        
        <span style={labelStyle}>
          {renderLabel ? renderLabel(node) : node.label}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div style={childrenContainerStyle} role="group">
          {node.children!.map((child, index) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              positionInSet={index + 1}
              setSize={node.children!.length}
              renderLabel={renderLabel}
              renderIcon={renderIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Tree component
 */
export function Tree<T = unknown>({
  nodes,
  children,
  selectionMode = 'single',
  showCheckbox = false,
  showIcon = true,
  indent = 20,
  animate = true,
  defaultExpandedIds = [],
  defaultSelectedIds = [],
  expandedIds: controlledExpandedIds,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onExpansionChange,
  onNodeClick,
  cascadeCheck = true,
  className,
  style,
}: TreeProps<T>): JSX.Element {
  const tree = useTree({
    nodes,
    defaultExpandedIds,
    defaultSelectedIds,
    selectionMode,
    onSelectionChange,
    onExpansionChange,
    onNodeClick,
    cascadeCheck,
    expandedIds: controlledExpandedIds,
    selectedIds: controlledSelectedIds,
  });

  // `useTree` already resolves controlled vs internal state.
  const { expandedIds, selectedIds, flatNodes, focusedId, setFocusedId } = tree;

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, expandedIds),
    [expandedIds, nodes]
  );

  // Depends on the specific fields it reads, not on `tree` — that is the object
  // literal `useTree` returns fresh every render, so this effect used to run on
  // every single render of the tree.
  useEffect(() => {
    const firstFocusableId = visibleIds.find((id) => !flatNodes.get(id)?.disabled) ?? null;

    if (!firstFocusableId) {
      if (focusedId !== null) {
        setFocusedId(null);
      }
      return;
    }

    if (!focusedId || !visibleIds.includes(focusedId) || flatNodes.get(focusedId)?.disabled) {
      setFocusedId(firstFocusableId);
    }
  }, [flatNodes, focusedId, setFocusedId, visibleIds]);

  const contextValue: TreeContextValue = {
    expandedIds,
    selectedIds,
    checkedIds: tree.checkedIds,
    focusedId: tree.focusedId,
    selectionMode,
    showCheckbox,
    showIcon,
    indent,
    animate,
    visibleIds,
    toggleExpand: tree.toggleExpand,
    toggleSelect: tree.toggleSelect,
    toggleCheck: tree.toggleCheck,
    setFocusedId: tree.setFocusedId,
    getParentId: (id) => tree.flatNodes.get(id)?.parentId ?? null,
    isExpanded: (id) => expandedIds.has(id),
    isSelected: (id) => selectedIds.has(id),
    isChecked: (id) => tree.checkedIds.has(id),
    isIndeterminate: tree.isIndeterminate,
  };

  const containerStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        className={className}
        style={containerStyle}
        role="tree"
        aria-multiselectable={selectionMode !== 'single'}
      >
        {children ||
          nodes.map((node, index) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              isLast={index === nodes.length - 1}
              positionInSet={index + 1}
              setSize={nodes.length}
            />
          ))}
      </div>
    </TreeContext.Provider>
  );
}

/**
 * Virtualized tree for large datasets
 */
export function VirtualTree<T = unknown>({
  nodes,
  height,
  itemHeight = 32,
  ...props
}: TreeProps<T> & {
  height: number;
  itemHeight?: number;
}): JSX.Element {
  const tree = useTree({ nodes, ...props });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const expandedIds = props.expandedIds ? new Set(props.expandedIds) : tree.expandedIds;
  const selectedIds = props.selectedIds ? new Set(props.selectedIds) : tree.selectedIds;

  // Get visible nodes (flattened with expansion considered)
  const visibleNodes = useMemo(() => {
    const result: { node: TreeNode<T>; depth: number }[] = [];
    
    const traverse = (nodeList: TreeNode<T>[], depth: number) => {
      for (const node of nodeList) {
        result.push({ node, depth });
        if (node.children && expandedIds.has(node.id)) {
          traverse(node.children, depth + 1);
        }
      }
    };
    
    traverse(nodes, 0);
    return result;
  }, [expandedIds, nodes]);

  const visibleIds = useMemo(
    () => visibleNodes.map((item) => item.node.id),
    [visibleNodes]
  );

  useEffect(() => {
    const firstFocusableId = visibleIds.find((id) => !tree.flatNodes.get(id)?.disabled) ?? null;

    if (!firstFocusableId) {
      if (tree.focusedId !== null) {
        tree.setFocusedId(null);
      }
      return;
    }

    if (!tree.focusedId || !visibleIds.includes(tree.focusedId) || tree.flatNodes.get(tree.focusedId)?.disabled) {
      tree.setFocusedId(firstFocusableId);
    }
  }, [tree, visibleIds]);

  const totalHeight = visibleNodes.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight) + 1;
  const endIndex = Math.min(startIndex + visibleCount, visibleNodes.length);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const containerStyle: React.CSSProperties = {
    height,
    overflow: 'auto',
    ...props.style,
  };

  const innerStyle: React.CSSProperties = {
    height: totalHeight,
    position: 'relative',
  };

  const contextValue: TreeContextValue = {
    expandedIds,
    selectedIds,
    checkedIds: tree.checkedIds,
    focusedId: tree.focusedId,
    selectionMode: props.selectionMode ?? 'single',
    showCheckbox: props.showCheckbox ?? false,
    showIcon: props.showIcon ?? true,
    indent: props.indent ?? 20,
    animate: props.animate ?? true,
    visibleIds,
    toggleExpand: tree.toggleExpand,
    toggleSelect: tree.toggleSelect,
    toggleCheck: tree.toggleCheck,
    setFocusedId: tree.setFocusedId,
    getParentId: (id) => tree.flatNodes.get(id)?.parentId ?? null,
    isExpanded: (id) => expandedIds.has(id),
    isSelected: (id) => selectedIds.has(id),
    isChecked: (id) => tree.checkedIds.has(id),
    isIndeterminate: tree.isIndeterminate,
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={props.className}
        style={containerStyle}
        onScroll={handleScroll}
        role="tree"
        aria-multiselectable={(props.selectionMode ?? 'single') !== 'single'}
      >
        <div style={innerStyle}>
          {visibleNodes.slice(startIndex, endIndex).map((item, index) => (
            <div
              key={item.node.id}
              style={{
                position: 'absolute',
                top: (startIndex + index) * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
            >
              <TreeNodeComponent
                node={item.node}
                depth={item.depth}
                positionInSet={index + 1}
                setSize={visibleNodes.length}
              />
            </div>
          ))}
        </div>
      </div>
    </TreeContext.Provider>
  );
}

// Re-export TreeNode as TreeItem for naming flexibility
export { TreeNodeComponent as TreeItem };
