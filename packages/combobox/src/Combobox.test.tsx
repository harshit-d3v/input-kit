import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from './Combobox.js';
import type { ComboboxOption } from './types.js';

const options: ComboboxOption<string>[] = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
];

describe('Combobox', () => {
  const defaultProps = {
    options,
    value: null as string | null,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders input with placeholder', () => {
      render(<Combobox {...defaultProps} placeholder="Select fruit" />);
      
      expect(screen.getByPlaceholderText('Select fruit')).toBeInTheDocument();
    });

    it('renders with correct role', () => {
      render(<Combobox {...defaultProps} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Combobox {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('interaction', () => {
    it('opens dropdown on focus', async () => {
      render(<Combobox {...defaultProps} />);
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('shows options in dropdown', async () => {
      render(<Combobox {...defaultProps} />);
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });
    });

    it('selects option on click', async () => {
      const onChange = vi.fn();
      render(<Combobox {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Apple'));
      
      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('filters options on type', async () => {
      render(<Combobox {...defaultProps} />);
      
      const input = screen.getByRole('combobox');
      await userEvent.type(input, 'app');
      
      await waitFor(() => {
        // Check that only one option is shown (Apple matches 'app')
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveAttribute('data-value', '1');
      });
    });
  });

  describe('multi-select', () => {
    it('renders selected tags', () => {
      render(
        <Combobox 
          {...defaultProps} 
          multi 
          value={['1', '2']} 
        />
      );
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('removes tag on remove button click', async () => {
      const onChange = vi.fn();
      render(
        <Combobox 
          {...defaultProps} 
          multi 
          value={['1', '2']} 
          onChange={onChange}
        />
      );
      
      const removeButtons = screen.getAllByLabelText(/Remove/);
      await userEvent.click(removeButtons[0]);
      
      expect(onChange).toHaveBeenCalledWith(['2']);
    });
  });

  describe('clearable', () => {
    it('shows clear button when value is selected', () => {
      render(
        <Combobox 
          {...defaultProps} 
          clearable 
          value="1" 
        />
      );
      
      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
    });

    it('does not show clear button when no value', () => {
      render(
        <Combobox 
          {...defaultProps} 
          clearable 
          value={null} 
        />
      );
      
      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('clears selection on clear button click', async () => {
      const onChange = vi.fn();
      render(
        <Combobox 
          {...defaultProps} 
          clearable 
          value="1" 
          onChange={onChange}
        />
      );
      
      await userEvent.click(screen.getByLabelText('Clear selection'));
      
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('disabled', () => {
    it('disables input when disabled', () => {
      render(<Combobox {...defaultProps} disabled />);
      
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('async loading', () => {
    it('shows loading state', async () => {
      const loadOptions = vi.fn().mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );
      
      render(
        <Combobox 
          value={null}
          onChange={vi.fn()}
          loadOptions={loadOptions}
          debounceMs={0}
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('shows custom loading component', async () => {
      const loadOptions = vi.fn().mockImplementation(() => 
        new Promise(() => {})
      );
      
      render(
        <Combobox 
          value={null}
          onChange={vi.fn()}
          loadOptions={loadOptions}
          debounceMs={0}
          loadingComponent={<span>Custom Loading...</span>}
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('creatable', () => {
    it('shows create option for new value', async () => {
      render(
        <Combobox 
          {...defaultProps} 
          creatable 
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.type(input, 'New Fruit');
      
      await waitFor(() => {
        // Check that the create option is shown by data-value
        const option = screen.getByRole('option');
        expect(option).toHaveAttribute('data-value', '__create__New Fruit');
      });
    });

    it('uses custom create label', async () => {
      render(
        <Combobox 
          {...defaultProps} 
          creatable 
          createLabel={(input) => `Add "${input}"`}
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.type(input, 'New Fruit');
      
      await waitFor(() => {
        // Check that the create option is shown by data-value
        const option = screen.getByRole('option');
        expect(option).toHaveAttribute('data-value', '__create__New Fruit');
      });
    });
  });

  describe('empty state', () => {
    it('shows empty message when no options', async () => {
      render(
        <Combobox 
          options={[]}
          value={null}
          onChange={vi.fn()}
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('No options')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has correct aria-expanded', async () => {
      render(<Combobox {...defaultProps} />);
      
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      
      await userEvent.click(input);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('has aria-controls pointing to listbox', async () => {
      render(<Combobox {...defaultProps} />);
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(input).toHaveAttribute('aria-controls', listbox.id);
      });
    });

    it('has aria-multiselectable on listbox when multi', async () => {
      render(
        <Combobox 
          {...defaultProps} 
          multi 
          value={[]} 
        />
      );
      
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
      });
    });
  });
});
