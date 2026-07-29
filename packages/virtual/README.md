# @input-kit/virtual

React virtualization primitives for large lists and grids with dynamic sizing, imperative scrolling, and end-reached callbacks.

## Installation

```bash
npm install @input-kit/virtual
```

## Features

- `VirtualList` for long feeds and dashboards
- `VirtualGrid` for card galleries and dense layouts
- Dynamic item sizing with `getItemSize`
- `onEndReached` support for infinite-loading lists
- Imperative refs for jump navigation and measurement
- `useVirtual()` hook for custom renderers

## Quick Start

```tsx
import { VirtualList } from '@input-kit/virtual';

const items = Array.from({ length: 5000 }, (_, index) => ({
  id: index,
  title: `Item ${index + 1}`,
}));

<VirtualList
  items={items}
  itemSize={56}
  height={400}
  renderItem={(item) => <div>{item.title}</div>}
/>
```

## Infinite Feed Example

```tsx
<VirtualList
  items={items}
  estimateSize={88}
  getItemSize={(index) => items[index].height}
  height={420}
  onEndReached={loadMore}
  onEndReachedThreshold={180}
  renderItem={(item) => <Card item={item} />}
/>
```

## Grid Example

```tsx
import { VirtualGrid } from '@input-kit/virtual';

<VirtualGrid
  items={cards}
  columnCount={3}
  cellWidth={220}
  cellHeight={150}
  height={360}
  gap={16}
  renderItem={(card) => <CardPreview card={card} />}
/>
```

## Hook Example

```tsx
import { useVirtual } from '@input-kit/virtual';

function CustomList() {
  const { containerRef, containerProps, contentProps, virtualItems, getItemProps } = useVirtual({
    count: 10000,
    estimateSize: 64,
    height: 480,
  });

  return (
    <div ref={containerRef} {...containerProps}>
      <div {...contentProps}>
        {virtualItems.map((item) => (
          <div key={item.key} {...getItemProps(item.index)}>
            Row {item.index}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Notes

- Use `itemSize` for fixed-height rows and `getItemSize` when content varies.
- `VirtualListRef` exposes `scrollToIndex`, `scrollTo`, `measure`, and `measureAll`.
- `VirtualGridRef` exposes imperative scroll helpers for large galleries.

## License

MIT © Input Kit
