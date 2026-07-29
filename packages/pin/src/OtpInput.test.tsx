import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OtpInput } from './OtpInput';
import { useState } from 'react';

describe('OtpInput', () => {
  const defaultProps = {
    length: 6,
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of inputs', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders with initial value', () => {
    render(<OtpInput {...defaultProps} value="ABC123" />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('A');
    expect(inputs[1]).toHaveValue('B');
    expect(inputs[2]).toHaveValue('C');
    expect(inputs[3]).toHaveValue('1');
    expect(inputs[4]).toHaveValue('2');
    expect(inputs[5]).toHaveValue('3');
  });

  it('calls onChange when input changes', () => {
    const onChange = vi.fn();
    render(<OtpInput {...defaultProps} alphanumeric onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('calls onComplete when all inputs filled', () => {
    const onComplete = vi.fn();
    
    // Create a wrapper component to handle state
    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <OtpInput
          {...defaultProps}
          alphanumeric
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
    
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });
    fireEvent.change(inputs[2], { target: { value: 'C' } });
    fireEvent.change(inputs[3], { target: { value: '1' } });
    fireEvent.change(inputs[4], { target: { value: '2' } });
    fireEvent.change(inputs[5], { target: { value: '3' } });
    
    expect(onComplete).toHaveBeenCalledWith('ABC123');
  });

  it('renders password input when mask is true', () => {
    render(<OtpInput {...defaultProps} mask />);
    
    const inputs = screen.getAllByDisplayValue('');
    expect(inputs[0]).toHaveAttribute('type', 'password');
  });

  it('renders text input when mask is false', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('type', 'text');
  });

  it('disables inputs when disabled is true', () => {
    render(<OtpInput {...defaultProps} disabled />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
  });

  it('sets readOnly when readOnly is true', () => {
    render(<OtpInput {...defaultProps} readOnly />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('readonly');
  });

  it('has correct aria labels', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('aria-label', 'OTP character 1 of 6');
    expect(inputs[1]).toHaveAttribute('aria-label', 'OTP character 2 of 6');
  });

  it('has numeric inputMode when alphanumeric is false', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('inputMode', 'numeric');
  });

  it('has text inputMode when alphanumeric is true', () => {
    render(<OtpInput {...defaultProps} alphanumeric />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('inputMode', 'text');
  });

  it('has correct autoComplete', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <OtpInput {...defaultProps} className="custom-container" />
    );
    
    expect(container.firstChild).toHaveClass('custom-container');
    expect(container.firstChild).toHaveClass('otp-input-container');
  });

  it('accepts custom inputClassName', () => {
    render(<OtpInput {...defaultProps} inputClassName="custom-input" />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveClass('custom-input');
    expect(inputs[0]).toHaveClass('otp-input-field');
  });

  it('handles alphanumeric paste event', () => {
    const onChange = vi.fn();
    render(<OtpInput {...defaultProps} alphanumeric onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => 'ABC123',
      },
    });
    
    expect(onChange).toHaveBeenCalledWith('ABC123');
  });

  it('filters non-alphanumeric characters', () => {
    const onChange = vi.fn();
    render(<OtpInput {...defaultProps} alphanumeric onChange={onChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => 'AB!@12#$34',
      },
    });
    
    expect(onChange).toHaveBeenCalledWith('AB1234');
  });

  it('has uppercase text transform when alphanumeric', () => {
    render(<OtpInput {...defaultProps} alphanumeric />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveStyle({ textTransform: 'uppercase' });
  });

  it('has no text transform when not alphanumeric', () => {
    render(<OtpInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveStyle({ textTransform: 'none' });
  });
});
