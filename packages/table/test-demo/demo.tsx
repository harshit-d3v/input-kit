import React from 'react';
import { Table } from '../src/index';
import type { Column } from '../src/types';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const sampleUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joinDate: '2023-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', joinDate: '2023-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', joinDate: '2023-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active', joinDate: '2023-04-05' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'active', joinDate: '2023-05-12' },
  { id: 6, name: 'Diana Martinez', email: 'diana@example.com', role: 'Viewer', status: 'inactive', joinDate: '2023-06-18' },
  { id: 7, name: 'Eve Anderson', email: 'eve@example.com', role: 'Editor', status: 'active', joinDate: '2023-07-22' },
  { id: 8, name: 'Frank Thomas', email: 'frank@example.com', role: 'Viewer', status: 'active', joinDate: '2023-08-30' },
  { id: 9, name: 'Grace Lee', email: 'grace@example.com', role: 'Admin', status: 'inactive', joinDate: '2023-09-14' },
  { id: 10, name: 'Henry Davis', email: 'henry@example.com', role: 'Editor', status: 'active', joinDate: '2023-10-25' },
];

// Built once at module scope rather than inline in JSX: 250 rows regenerated on
// every render would defeat the point of the virtualization being demonstrated.
const virtualizedUsers: User[] = Array.from({ length: 250 }, (_, index) => ({
  id: index + 1,
  name: `Row ${index + 1}`,
  email: `row-${index + 1}@example.com`,
  role: index % 3 === 0 ? 'Admin' : index % 3 === 1 ? 'Editor' : 'Viewer',
  status: index % 4 === 0 ? 'inactive' : 'active',
  joinDate: `2024-01-${String((index % 28) + 1).padStart(2, '0')}`,
}));

const columns: Column<User>[] = [
  { key: 'id', header: 'ID', width: 60, sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true, filterable: true },
  { key: 'role', header: 'Role', sortable: true, filterable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    cell: ({ value }) => (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '12px',
          background: value === 'active' ? '#dcfce7' : '#fef2f2',
          color: value === 'active' ? '#166534' : '#991b1b',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {String(value)}
      </span>
    ),
  },
  { key: 'joinDate', header: 'Join Date', sortable: true },
];

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/table</h1>
      <p>Headless table primitives for sorting, filtering, selection, expansion, and virtualized scrolling.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Interactive Table</h2>
        <Table
          data={sampleUsers}
          columns={columns}
          sortable
          filterable
          pagination={{ pageSize: 5 }}
          selectable
          multiSelect
          expandable
          stickyHeader
          renderExpandedRow={(row) => (
            <div style={{ padding: '0.75rem 0', color: '#475569' }}>
              <strong>{row.name}</strong>
              <div>Email: {row.email}</div>
              <div>Joined: {row.joinDate}</div>
            </div>
          )}
          rowStyle={(row) => row.status === 'inactive' ? { opacity: 0.75 } : {}}
        />
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Virtualized Dataset</h2>
        <Table
          data={virtualizedUsers}
          columns={columns}
          sortable
          virtualized
          rowHeight={52}
          maxHeight={360}
          pagination={false}
        />
      </section>
    </div>
  );
}

export default Demo;
