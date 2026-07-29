import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from './Table';
import type { Column, TableRow } from './types';

interface TestRow extends TableRow {
  id: number;
  name: string;
  email: string;
  age: number;
}

const testData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@test.com', age: 25 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 },
];

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', filterable: true },
  { key: 'age', header: 'Age', sortable: true },
];

describe('Table', () => {
  describe('basic rendering', () => {
    it('should render table with data', () => {
      render(<Table data={testData} columns={columns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render empty message when no data', () => {
      render(<Table data={[]} columns={columns} emptyMessage="No data found" />);
      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should render custom loading component', () => {
      render(
        <Table
          data={testData}
          columns={columns}
          loading={true}
          loadingComponent={<div>Custom Loading...</div>}
        />
      );
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Table data={testData} columns={columns} className="custom-table" />
      );
      expect(container.firstChild).toHaveClass('custom-table');
    });
  });

  describe('sorting', () => {
    it('should sort when clicking sortable header', () => {
      render(<Table data={testData} columns={columns} sortable={true} />);

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader!);

      // First row should be Alice (ascending)
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice');
    });

    it('should toggle sort direction', () => {
      render(<Table data={testData} columns={columns} sortable={true} />);

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader!);
      fireEvent.click(nameHeader!);

      // First row should be Charlie (descending - Charlie comes before David alphabetically in reverse)
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Charlie');
    });
  });

  describe('filtering', () => {
    it('should render filter inputs when filterable', () => {
      render(<Table data={testData} columns={columns} filterable={true} />);

      const filterInputs = screen.getAllByPlaceholderText('Filter...');
      expect(filterInputs).toHaveLength(1); // Only email is filterable
    });

    it('should filter rows when typing in filter input', () => {
      render(<Table data={testData} columns={columns} filterable={true} />);

      const filterInput = screen.getByPlaceholderText('Filter...');
      fireEvent.change(filterInput, { target: { value: 'example' } });

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('should render pagination when enabled', () => {
      render(
        <Table
          data={testData}
          columns={columns}
          pagination={{ pageSize: 2 }}
        />
      );

      expect(screen.getByText('Showing 1 to 2 of 3 entries')).toBeInTheDocument();
    });

    it('should change page when clicking pagination button', () => {
      render(
        <Table
          data={testData}
          columns={columns}
          pagination={{ pageSize: 2 }}
        />
      );

      // First page
      expect(screen.getByText('Alice')).toBeInTheDocument();

      // Go to next page
      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);

      // Second page
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should render selection checkboxes when selectable with multiSelect', () => {
      render(<Table data={testData} columns={columns} selectable={true} multiSelect={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should select row when clicking checkbox', () => {
      render(<Table data={testData} columns={columns} selectable={true} multiSelect={true} />);

      const checkbox = screen.getAllByRole('checkbox')[1]; // First data row
      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('expandable rows', () => {
    it('should render expand buttons when expandable', () => {
      render(<Table data={testData} columns={columns} expandable={true} />);

      const expandButtons = screen.getAllByRole('button', { name: /expand/i }) || screen.getAllByTestId('expand-button');
      expect(expandButtons.length).toBe(3);
    });

    it('should expand row when clicking expand button', () => {
      render(
        <Table
          data={testData}
          columns={columns}
          expandable={true}
          renderExpandedRow={(row) => <div>Details: {row.name}</div>}
        />
      );

      const expandButton = (screen.getAllByRole('button', { name: /expand/i }) || screen.getAllByTestId('expand-button'))[0];
      fireEvent.click(expandButton);

      expect(screen.getByText('Details: Alice')).toBeInTheDocument();
    });
  });

  describe('custom cell rendering', () => {
    it('should render custom cell content', () => {
      const customColumns: Column<TestRow>[] = [
        {
          key: 'name',
          header: 'Name',
          cell: ({ value }) => <span className="custom-name">{String(value)}</span>,
        },
      ];

      render(<Table data={testData} columns={customColumns} />);

      expect(screen.getByText('Alice')).toHaveClass('custom-name');
    });

    it('should render custom header content', () => {
      const customColumns: Column<TestRow>[] = [
        {
          key: 'name',
          header: 'Name',
          headerCell: ({ column }) => <span className="custom-header">{column.header}</span>,
        },
      ];

      render(<Table data={testData} columns={customColumns} />);

      expect(screen.getByText('Name')).toHaveClass('custom-header');
    });
  });

  describe('row styling', () => {
    it('should apply row className function', () => {
      const { container } = render(
        <Table
          data={testData}
          columns={columns}
          rowClassName={(row) => (row.age > 30 ? 'senior' : 'junior')}
        />
      );

      const rows = container.querySelectorAll('.table-row');
      expect(rows[2]).toHaveClass('senior'); // Charlie is 35
    });

    it('should apply row style function', () => {
      const { container } = render(
        <Table
          data={testData}
          columns={columns}
          rowStyle={(row) => ({ backgroundColor: row.age > 30 ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)' })}
        />
      );

      const rows = container.querySelectorAll('.table-row');
      expect(rows[2]).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
    });
  });
});
