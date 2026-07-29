import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorInput, useColorInput, defaultPresets } from './ColorInput';

describe('ColorInput', () => {
  it('renders with default props', () => {
    render(<ColorInput />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle color picker')).toBeInTheDocument();
  });

  it('renders with custom value', () => {
    render(<ColorInput value="#ff0000" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('#ff0000');
  });

  it('calls onChange when color changes', () => {
    const onChange = vi.fn();
    render(<ColorInput value="#ff0000" onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '#00ff00' } });
    
    expect(onChange).toHaveBeenCalled();
  });

  it('opens color picker when toggle button is clicked', () => {
    render(<ColorInput />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes color picker when Escape is pressed', () => {
    render(<ColorInput />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens color picker with ArrowDown', () => {
    render(<ColorInput />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('toggles color picker with Enter', () => {
    render(<ColorInput />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders color presets', () => {
    render(<ColorInput />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    // Should have preset buttons
    const presetButtons = screen.getAllByLabelText(/Select .* color/);
    expect(presetButtons.length).toBeGreaterThan(0);
  });

  it('selects preset color when clicked', () => {
    const onChange = vi.fn();
    render(<ColorInput onChange={onChange} />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    const redPreset = screen.getByLabelText('Select Red color');
    fireEvent.click(redPreset);
    
    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('shows alpha slider when showAlpha is true', () => {
    render(<ColorInput showAlpha />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.getByLabelText('Alpha transparency')).toBeInTheDocument();
  });

  it('does not show alpha slider when showAlpha is false', () => {
    render(<ColorInput showAlpha={false} />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.queryByLabelText('Alpha transparency')).not.toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<ColorInput disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByLabelText('Toggle color picker')).toBeDisabled();
  });

  it('has correct ARIA attributes', () => {
    render(<ColorInput aria-label="Choose a color" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Choose a color');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates aria-expanded when picker is open', () => {
    render(<ColorInput />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('displays color info in picker', () => {
    render(<ColorInput value="#ff0000" />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/HEX:/)).toBeInTheDocument();
    expect(screen.getByText(/RGB:/)).toBeInTheDocument();
    expect(screen.getByText(/HSL:/)).toBeInTheDocument();
  });

  it('resets to valid color on blur if invalid', () => {
    const onChange = vi.fn();
    render(<ColorInput value="#ff0000" onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid-color' } });
    fireEvent.blur(input);
    
    // Should reset to valid color
    expect(input).not.toHaveValue('invalid-color');
  });

  it('uses custom placeholder', () => {
    render(<ColorInput placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('uses custom presets', () => {
    const customPresets = [
      { name: 'Custom Red', value: '#ff0000' },
      { name: 'Custom Blue', value: '#0000ff' },
    ];
    
    render(<ColorInput presets={customPresets} />);
    
    const toggleButton = screen.getByLabelText('Toggle color picker');
    fireEvent.click(toggleButton);
    
    expect(screen.getByLabelText('Select Custom Red color')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Custom Blue color')).toBeInTheDocument();
  });
});

describe('useColorInput', () => {
  it('provides all necessary state and methods', () => {
    function TestComponent() {
      const colorInput = useColorInput({});
      return (
        <div>
          <span data-testid="color">{colorInput.color}</span>
          <span data-testid="alpha">{colorInput.alpha}</span>
          <span data-testid="isOpen">{colorInput.isOpen ? 'open' : 'closed'}</span>
          <button onClick={() => colorInput.setIsOpen(true)}>Open</button>
        </div>
      );
    }
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('color')).toHaveTextContent('#');
    expect(screen.getByTestId('alpha')).toHaveTextContent('1');
    expect(screen.getByTestId('isOpen')).toHaveTextContent('closed');
  });
});

describe('defaultPresets', () => {
  it('contains expected preset colors', () => {
    const presetValues = defaultPresets.map(p => p.value);
    
    expect(presetValues).toContain('#000000');
    expect(presetValues).toContain('#ffffff');
    expect(presetValues).toContain('#ff0000');
    expect(presetValues).toContain('#00ff00');
    expect(presetValues).toContain('#0000ff');
  });
});
