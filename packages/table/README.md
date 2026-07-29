# @input-kit/table

Headless React table primitives for sorting, filtering, pagination, selection, expansion, and virtualized scrolling.

## Features

- Sorting, filtering, and pagination state via `useTable`
- Expandable rows and single or multi-row selection
- Sticky headers and resizable columns
- Virtualized body rendering for larger datasets
- Headless API with typed column definitions and custom cells

## Installation

```bash
npm install @input-kit/table
```

## Quick Start

### Using the Table Component

```tsx
import { Table } from '@input-kit/table';

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', filterable: true },
  { key: 'age', header: 'Age', sortable: true },
];

const data = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  // ...
];

function App() {
  return (
    <Table
      data={data}
      columns={columns}
      sortable
      filterable
      pagination={{ pageSize: 10 }}
      selectable
    />
  );
}
```

### Using the useTable Hook

```tsx
import { useTable } from '@input-kit/table';

function CustomTable() {
  const {
    rows,
    headers,
    sortBy,
    filters,
    pagination,
    toggleSort,
    setFilter,
    setPage,
    selectedRows,
    toggleRowSelection,
  } = useTable({
    data,
    columns,
    sortable: true,
    filterable: true,
    pagination: { pageSize: 10 },
    selectable: true,
  });

  return (
    <table>
      <thead>
        <tr>
          {headers.map((col) => (
            <th key={col.key} onClick={() => toggleSort(col.key)}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {headers.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## API Reference

### Table Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of data objects |
| `columns` | `Column<T>[]` | required | Column definitions |
| `sortable` | `boolean` | `false` | Enable sorting |
| `filterable` | `boolean` | `false` | Enable filtering |
| `pagination` | `{ pageSize: number } \| false` | `false` | Pagination config |
| `selectable` | `boolean` | `false` | Enable row selection |
| `multiSelect` | `boolean` | `false` | Allow multiple selection |
| `expandable` | `boolean` | `false` | Enable expandable rows |
| `virtualized` | `boolean` | `false` | Enable virtualization |
| `stickyHeader` | `boolean` | `false` | Make header sticky |
| `rowHeight` | `number` | `48` | Row height for virtualization |
| `maxHeight` | `number \| string` | `400` | Max height for virtualized table |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `ReactNode` | `'No data available'` | Empty state message |
| `renderExpandedRow` | `(row: T) => ReactNode` | - | Render expanded content |
| `getRowId` | `(row: T, index: number) => string \| number` | `(row) => row.id \|\| index` | Get unique row ID |

### Column Definition

```ts
interface Column<T> {
  key: string;                    // Unique column key
  header: ReactNode;              // Header content
  width?: number | string;        // Column width
  minWidth?: number;              // Minimum width
  maxWidth?: number;              // Maximum width
  sortable?: boolean;             // Enable sorting
  filterable?: boolean;           // Enable filtering
  resizable?: boolean;            // Enable resizing
  accessor?: (row: T) => unknown; // Custom value accessor
  cell?: (props: {               // Custom cell renderer
    row: T;
    value: unknown;
  }) => ReactNode;
  headerCell?: (props: {         // Custom header renderer
    column: Column<T>;
  }) => ReactNode;
}
```

### useTable Hook

```ts
const table = useTable({
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: { pageSize: number } | false;
  selectable?: boolean;
  multiSelect?: boolean;
  expandable?: boolean;
  getRowId?: (row: T, index: number) => string | number;
  initialSort?: SortState;
  initialFilters?: FilterState;
  initialPage?: number;
});
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `rows` | `T[]` | Current page of rows |
| `originalData` | `T[]` | Original unmodified data |
| `headers` | `Column<T>[]` | Column definitions |
| `sortBy` | `SortState` | Current sort state |
| `toggleSort(key)` | `(key: string) => void` | Toggle sort on column |
| `setSortBy(sort)` | `(sort: SortState) => void` | Set sort directly |
| `filters` | `FilterState` | Current filters |
| `setFilter(key, value)` | `(key: string, value: string) => void` | Set filter |
| `clearFilter(key)` | `(key: string) => void` | Clear single filter |
| `clearAllFilters()` | `() => void` | Clear all filters |
| `pagination` | `PaginationState` | Pagination info |
| `setPage(page)` | `(page: number) => void` | Go to page |
| `nextPage()` | `() => void` | Next page |
| `prevPage()` | `() => void` | Previous page |
| `selectedRows` | `(string \| number)[]` | Selected row IDs |
| `selectedRowIds` | `Set<string \| number>` | Selected IDs as Set |
| `toggleRowSelection(id)` | `(id) => void` | Toggle selection |
| `selectAll()` | `() => void` | Select all visible rows |
| `deselectAll()` | `() => void` | Deselect all |
| `isSelected(id)` | `(id) => boolean` | Check if selected |
| `expandedRows` | `(string \| number)[]` | Expanded row IDs |
| `toggleRowExpansion(id)` | `(id) => void` | Toggle expansion |
| `isExpanded(id)` | `(id) => boolean` | Check if expanded |
| `columnWidths` | `Record<string, number>` | Column widths |
| `setColumnWidth(key, width)` | `(key, width) => void` | Set column width |
| `isFiltered` | `boolean` | Has active filters |
| `isSorted` | `boolean` | Has active sort |

## Examples

### Custom Cell Rendering

```tsx
const columns = [
  {
    key: 'status',
    header: 'Status',
    cell: ({ value }) => (
      <span className={`badge badge-${value}`}>
        {value}
      </span>
    ),
  },
  {
    key: 'salary',
    header: 'Salary',
    accessor: (row) => row.salary,
    cell: ({ value }) => `$${Number(value).toLocaleString()}`,
  },
];
```

### Expandable Rows

```tsx
<Table
  data={data}
  columns={columns}
  expandable
  renderExpandedRow={(row) => (
    <div>
      <h4>Details for {row.name}</h4>
      <p>Email: {row.email}</p>
      <p>Department: {row.department}</p>
    </div>
  )}
/>
```

### Virtualization for Large Datasets

```tsx
<Table
  data={largeData} // 10,000+ rows
  columns={columns}
  virtualized
  rowHeight={48}
  maxHeight={600}
  overscan={5}
/>
```

### Column Resizing

```tsx
const columns = [
  { key: 'name', header: 'Name', resizable: true, width: 200 },
  { key: 'email', header: 'Email', resizable: true, minWidth: 150 },
];

<Table data={data} columns={columns} />;
```

### Custom Styling

```tsx
<Table
  data={data}
  columns={columns}
  className="my-table"
  tableClassName="table-content"
  headerClassName="table-header"
  bodyClassName="table-body"
  rowClassName={(row) => (row.active ? 'active-row' : '')}
  cellClassName="table-cell"
/>
```

## Styling

The components are headless and don't include built-in styles. Here's a basic CSS template:

```css
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: #f8f9fa;
}

.table-header-cell {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table-header-cell.sortable {
  cursor: pointer;
}

.table-row {
  border-bottom: 1px solid #dee2e6;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.selected {
  background: #e3f2fd;
}

.table-cell {
  padding: 12px;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
```

## Demo

Open `test-demo/index.html` in a browser to see interactive examples of all features.

## License

MIT
