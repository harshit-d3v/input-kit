import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PinInput } from './PinInput';
import { useState } from 'react';

describe('PinInput', () => {
  const defaultProps = {
    length: 4,
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of inputs', () => {
    render(<PinInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('renders with initial value', () => {
    render(<PinInput {...defaultProps} value="1234" />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
  });

  it('calls onChange when input changes', () => {
    const onChange = vi.fn();
    render(<PinInput {...defaultProps} onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('calls onComplete when all inputs filled', () => {
    const onComplete = vi.fn();
    
    // Create a wrapper component to handle state
    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <PinInput
          {...defaultProps}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            defaultProps.onChange(newValue);
          }}
          onComplete={onComplete}
        />
      );
    }
    
    render(<Wrapper />);
    
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.change(inputs[3], { target: { value: '4' } });
    
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('renders password input when mask is true', () => {
    render(<PinInput {...defaultProps} mask />);
    
    const inputs = screen.getAllByDisplayValue('');
    expect(inputs[0]).toHaveAttribute('type', 'password');
  });

  it('renders text input when mask is false', () => {
    render(<PinInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('type', 'text');
  });

  it('disables inputs when disabled is true', () => {
    render(<PinInput {...defaultProps} disabled />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
  });

  it('sets readOnly when readOnly is true', () => {
    render(<PinInput {...defaultProps} readOnly />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('readonly');
  });

  it('has correct aria labels', () => {
    render(<PinInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('aria-label', 'PIN digit 1 of 4');
    expect(inputs[1]).toHaveAttribute('aria-label', 'PIN digit 2 of 4');
  });

  it('has correct inputMode', () => {
    render(<PinInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('inputMode', 'numeric');
  });

  it('has correct autoComplete', () => {
    render(<PinInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <PinInput {...defaultProps} className="custom-container" />
    );
    
    expect(container.firstChild).toHaveClass('custom-container');
    expect(container.firstChild).toHaveClass('pin-input-container');
  });

  it('accepts custom inputClassName', () => {
    render(<PinInput {...defaultProps} inputClassName="custom-input" />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveClass('custom-input');
    expect(inputs[0]).toHaveClass('pin-input-field');
  });

  it('handles backspace key', () => {
    const onChange = vi.fn();
    render(<PinInput {...defaultProps} value="1234" onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[3], { key: 'Backspace' });
    
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('handles paste event', () => {
    const onChange = vi.fn();
    render(<PinInput {...defaultProps} onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '1234',
      },
    });
    
    expect(onChange).toHaveBeenCalledWith('1234');
  });
});
