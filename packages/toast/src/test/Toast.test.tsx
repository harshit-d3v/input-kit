import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast.js';
import type { Toast as ToastType } from '../types.js';

describe('Toast component', () => {
  const mockToast: ToastType = {
    id: 'test-1',
    type: 'success',
    title: 'Test Title',
    message: 'Test message',
    duration: 3000,
    position: 'bottom-right',
    createdAt: Date.now(),
    progress: 100,
    isPaused: false,
    isExiting: false,
  };

  const mockHandlers = {
    onDismiss: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toast with message', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render toast with title', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render different toast types', () => {
    const types: ToastType['type'][] = ['success', 'error', 'warning', 'info'];

    types.forEach((type) => {
      const { unmount } = render(
        <Toast toast={{ ...mockToast, type }} {...mockHandlers} />
      );

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('data-toast-type', type);

      unmount();
    });
  });

  it('should call onDismiss when close button is clicked', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    expect(mockHandlers.onDismiss).toHaveBeenCalledWith('test-1');
  });

  it('should call onDismiss when Escape key is pressed', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    const toastElement = screen.getByRole('alert');
    fireEvent.keyDown(toastElement, { key: 'Escape' });

    expect(mockHandlers.onDismiss).toHaveBeenCalledWith('test-1');
  });

  it('should call onPause on mouse enter', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    const toastElement = screen.getByRole('alert');
    fireEvent.mouseEnter(toastElement);

    expect(mockHandlers.onPause).toHaveBeenCalledWith('test-1');
  });

  it('should call onResume on mouse leave', () => {
    render(<Toast toast={{ ...mockToast, isPaused: true }} {...mockHandlers} />);

    const toastElement = screen.getByRole('alert');
    fireEvent.mouseLeave(toastElement);

    expect(mockHandlers.onResume).toHaveBeenCalledWith('test-1');
  });

  it('should render action button when provided', () => {
    const actionToast: ToastType = {
      ...mockToast,
      action: {
        label: 'Undo',
        onClick: vi.fn(),
        variant: 'primary',
      },
    };

    render(<Toast toast={actionToast} {...mockHandlers} />);

    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('should call action onClick when action button is clicked', () => {
    const actionClick = vi.fn();
    const actionToast: ToastType = {
      ...mockToast,
      action: {
        label: 'Undo',
        onClick: actionClick,
        variant: 'primary',
      },
    };

    render(<Toast toast={actionToast} {...mockHandlers} />);

    const actionButton = screen.getByText('Undo');
    fireEvent.click(actionButton);

    expect(actionClick).toHaveBeenCalled();
  });

  it('should have correct ARIA attributes', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
    expect(toastElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('should apply exiting animation class', () => {
    render(<Toast toast={{ ...mockToast, isExiting: true }} {...mockHandlers} />);

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveClass('toast--exiting');
  });

  it('should render progress bar when duration > 0 and not paused', () => {
    render(<Toast toast={mockToast} {...mockHandlers} />);

    const progressBar = document.querySelector('.toast__progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should not render progress bar when paused', () => {
    render(<Toast toast={{ ...mockToast, isPaused: true }} {...mockHandlers} />);

    const progressBar = document.querySelector('.toast__progress-bar');
    expect(progressBar).not.toBeInTheDocument();
  });
});
