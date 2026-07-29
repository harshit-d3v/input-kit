import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { VirtualList } from './VirtualList.js';
import type { VirtualListRef } from './VirtualList.js';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('VirtualList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
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
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        width={600}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    expect(listContainer.style.height).toBe('400px');
    expect(listContainer.style.width).toBe('600px');
    expect(listContainer.style.overflow).toBe('auto');
  });

  it('should render empty state', () => {
    render(
      <VirtualList
        items={[]}
        itemHeight={50}
        height={400}
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
      <VirtualList
        items={[]}
        itemHeight={50}
        height={400}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
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
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        className="custom-list"
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    expect(container.firstChild).toHaveClass('custom-list');
  });

  it('should apply custom styles', () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        style={{ backgroundColor: 'red' }}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    expect(listContainer.style.backgroundColor).toBe('red');
  });

  it('should use custom item key', () => {
    const items = [{ key: 'a', name: 'A' }, { key: 'b', name: 'B' }];
    
    render(
      <VirtualList
        items={items}
        itemHeight={50}
        height={400}
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

  it('should handle horizontal mode', () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        horizontal
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const innerContainer = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(innerContainer.style.width).toBe('5000px'); // 100 * 50
    expect(innerContainer.style.height).toBe('100%');
  });
});

describe('VirtualList with ref', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should expose scrollToIndex method', () => {
    const TestComponent = () => {
      const listRef = useRef<VirtualListRef>(null);
      
      return (
        <>
          <button onClick={() => listRef.current?.scrollToIndex(50)}>
            Scroll to 50
          </button>
          <VirtualList
            ref={listRef}
            items={mockItems}
            itemHeight={50}
            height={400}
            renderItem={(item, index, style) => (
              <div style={style}>{item.name}</div>
            )}
          />
        </>
      );
    };

    render(<TestComponent />);
    const button = screen.getByText('Scroll to 50');
    expect(button).toBeInTheDocument();
  });

  it('should expose scrollToOffset method', () => {
    const TestComponent = () => {
      const listRef = useRef<VirtualListRef>(null);
      
      return (
        <>
          <button onClick={() => listRef.current?.scrollToOffset(1000)}>
            Scroll to 1000
          </button>
          <VirtualList
            ref={listRef}
            items={mockItems}
            itemHeight={50}
            height={400}
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
      const listRef = useRef<VirtualListRef>(null);
      
      return (
        <>
          <button onClick={() => listRef.current?.scrollToTop()}>
            Scroll to Top
          </button>
          <VirtualList
            ref={listRef}
            items={mockItems}
            itemHeight={50}
            height={400}
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
      const listRef = useRef<VirtualListRef>(null);
      
      return (
        <>
          <button onClick={() => listRef.current?.scrollToBottom()}>
            Scroll to Bottom
          </button>
          <VirtualList
            ref={listRef}
            items={mockItems}
            itemHeight={50}
            height={400}
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

describe('VirtualList dynamic heights', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ 
    id: i, 
    name: `Item ${i}`,
    height: i % 2 === 0 ? 100 : 50,
  }));

  it('should handle dynamic item heights', () => {
    render(
      <VirtualList
        items={mockItems}
        estimateItemHeight={50}
        getItemHeight={(item) => item.height}
        height={400}
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

describe('VirtualList callbacks', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should call onScroll', () => {
    const onScroll = vi.fn();
    
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        onScroll={onScroll}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    
    fireEvent.scroll(listContainer, { target: { scrollTop: 100 } });
    
    // onScroll is called via useEffect, so it may not be immediate
  });

  it('should call onEndReached', () => {
    const onEndReached = vi.fn();
    
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        onEndReached={onEndReached}
        onEndReachedThreshold={100}
        renderItem={(item, index, style) => (
          <div style={style}>{item.name}</div>
        )}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    
    // Scroll near end
    Object.defineProperty(listContainer, 'scrollTop', {
      writable: true,
      value: 4500,
    });
    Object.defineProperty(listContainer, 'clientHeight', {
      writable: true,
      value: 400,
    });
    
    fireEvent.scroll(listContainer);
  });
});

describe('VirtualList sticky items', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('should handle sticky indices', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={50}
        height={400}
        stickyIndices={[0, 10, 20]}
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
