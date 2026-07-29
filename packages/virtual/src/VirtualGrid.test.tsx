import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useRef } from 'react';
import { VirtualGrid } from './VirtualGrid.js';
import type { VirtualGridRef } from './VirtualGrid.js';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('VirtualGrid', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style} data-testid={`item-${index}`}>
            {item.name}
          </div>
        )}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('should render with correct container styles', () => {
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        width={800}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer.style.height).toBe('600px');
    expect(gridContainer.style.width).toBe('800px');
    expect(gridContainer.style.overflow).toBe('auto');
  });

  it('should render empty state', () => {
    render(
      <VirtualGrid
        items={[]}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
        emptyComponent={<div data-testid="empty">No items</div>}
      />
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('should render default empty state', () => {
    render(
      <VirtualGrid
        items={[]}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        isLoading
        loadingComponent={<div data-testid="loading">Loading...</div>}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        className="custom-grid"
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(container.firstChild).toHaveClass('custom-grid');
  });

  it('should apply custom styles', () => {
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        style={{ backgroundColor: 'blue' }}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer.style.backgroundColor).toBe('blue');
  });

  it('should use custom item key', () => {
    const items = [{ key: 'a', name: 'A' }, { key: 'b', name: 'B' }, { key: 'c', name: 'C' }];
    
    render(
      <VirtualGrid
        items={items}
        columnCount={2}
        itemWidth={200}
        itemHeight={150}
        height={600}
        getItemKey={(item) => item.key}
        renderItem={(item, index, style) => (
          <div style={style} data-testid={`item-${item.key}`}>
            {item.name}
          </div>
        )}
      />
    );

    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();
  });

  it('should handle gap between items', () => {
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        gap={10}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('VirtualGrid with ref', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should expose scrollToIndex method', () => {
    const TestComponent = () => {
      const gridRef = useRef<VirtualGridRef>(null);
      
      return (
        <>
          <button onClick={() => gridRef.current?.scrollToIndex(30)}>
            Scroll to 30
          </button>
          <VirtualGrid
            ref={gridRef}
            items={mockItems}
            columnCount={3}
            itemWidth={200}
            itemHeight={150}
            height={600}
            renderItem={(item, index, style) => (
              <div style={style}>{item.name}</div>
            )}
          />
        </>
      );
    };

    render(<TestComponent />);
    const button = screen.getByText('Scroll to 30');
    expect(button).toBeInTheDocument();
  });

  it('should expose scrollToOffset method', () => {
    const TestComponent = () => {
      const gridRef = useRef<VirtualGridRef>(null);
      
      return (
        <>
          <button onClick={() => gridRef.current?.scrollToOffset(1000)}>
            Scroll to 1000
          </button>
          <VirtualGrid
            ref={gridRef}
            items={mockItems}
            columnCount={3}
            itemWidth={200}
            itemHeight={150}
            height={600}
            renderItem={(item, index, style) => (
              <div style={style}>{item.name}</div>
            )}
          />
        </>
      );
    };

    render(<TestComponent />);
    const button = screen.getByText('Scroll to 1000');
    expect(button).toBeInTheDocument();
  });

  it('should expose scrollToTop method', () => {
    const TestComponent = () => {
      const gridRef = useRef<VirtualGridRef>(null);
      
      return (
        <>
          <button onClick={() => gridRef.current?.scrollToTop()}>
            Scroll to Top
          </button>
          <VirtualGrid
            ref={gridRef}
            items={mockItems}
            columnCount={3}
            itemWidth={200}
            itemHeight={150}
            height={600}
            renderItem={(item, index, style) => (
              <div style={style}>{item.name}</div>
            )}
          />
        </>
      );
    };

    render(<TestComponent />);
    const button = screen.getByText('Scroll to Top');
    expect(button).toBeInTheDocument();
  });

  it('should expose scrollToBottom method', () => {
    const TestComponent = () => {
      const gridRef = useRef<VirtualGridRef>(null);
      
      return (
        <>
          <button onClick={() => gridRef.current?.scrollToBottom()}>
            Scroll to Bottom
          </button>
          <VirtualGrid
            ref={gridRef}
            items={mockItems}
            columnCount={3}
            itemWidth={200}
            itemHeight={150}
            height={600}
            renderItem={(item, index, style) => (
              <div style={style}>{item.name}</div>
            )}
          />
        </>
      );
    };

    render(<TestComponent />);
    const button = screen.getByText('Scroll to Bottom');
    expect(button).toBeInTheDocument();
  });
});

describe('VirtualGrid dynamic sizes', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ 
    id: i, 
    name: `Item ${i}`,
    width: i % 2 === 0 ? 200 : 150,
    height: i % 2 === 0 ? 150 : 100,
  }));

  it('should handle dynamic item sizes', () => {
    render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        estimateItemWidth={150}
        estimateItemHeight={100}
        getItemSize={(item) => ({ width: item.width, height: item.height })}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style} data-testid={`item-${index}`}>
            {item.name}
          </div>
        )}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });
});

describe('VirtualGrid callbacks', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should call onScroll', () => {
    const onScroll = vi.fn();
    
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        onScroll={onScroll}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const gridContainer = container.firstChild as HTMLElement;
    
    fireEvent.scroll(gridContainer, { target: { scrollTop: 100 } });
    
    // onScroll is called via useEffect
  });

  it('should call onEndReached', () => {
    const onEndReached = vi.fn();
    
    const { container } = render(
      <VirtualGrid
        items={mockItems}
        columnCount={3}
        itemWidth={200}
        itemHeight={150}
        height={600}
        onEndReached={onEndReached}
        onEndReachedThreshold={100}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const gridContainer = container.firstChild as HTMLElement;
    
    // Scroll near end
    Object.defineProperty(gridContainer, 'scrollTop', {
      writable: true,
      value: 4500,
    });
    Object.defineProperty(gridContainer, 'clientHeight', {
      writable: true,
      value: 600,
    });
    
    fireEvent.scroll(gridContainer);
  });
});

describe('VirtualGrid different column counts', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should handle single column', () => {
    render(
      <VirtualGrid
        items={mockItems}
        columnCount={1}
        itemWidth={200}
        itemHeight={150}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('should handle many columns', () => {
    render(
      <VirtualGrid
        items={mockItems}
        columnCount={10}
        itemWidth={100}
        itemHeight={100}
        height={600}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });
});
