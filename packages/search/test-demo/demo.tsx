import React, { useMemo, useState } from 'react';
import { SearchInput } from '../src/index';

const products = [
  { name: 'MacBook Pro', category: 'Electronics', price: 2499 },
  { name: 'Apple Watch', category: 'Electronics', price: 399 },
  { name: 'Running Shoes', category: 'Clothing', price: 129 },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 129 },
  { name: 'Coffee Maker', category: 'Kitchen', price: 89 },
  { name: 'Backpack', category: 'Accessories', price: 79 },
  { name: 'Yoga Mat', category: 'Sports', price: 39 },
  { name: 'Guitar', category: 'Music', price: 399 },
];

export function Demo() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(searchTerm)
    );
  }, [query]);

  return (
    <div style={{ padding: '2rem', maxWidth: '880px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>@input-kit/search</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        A compact debounced search input with immediate change events and delayed search callbacks.
      </p>

      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={setDebouncedQuery}
        debounceMs={250}
        placeholder="Search products or categories"
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          borderRadius: 16,
          border: '2px solid #cbd5e1',
          fontSize: 18,
          marginBottom: 20,
        }}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', minWidth: 180 }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Immediate Value</div>
          <div style={{ fontWeight: 700 }}>{query || 'Empty'}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 16, background: '#eef2ff', minWidth: 180 }}>
          <div style={{ fontSize: 12, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Debounced Search</div>
          <div style={{ fontWeight: 700 }}>{debouncedQuery || 'Waiting'}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', minWidth: 180 }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Matches</div>
          <div style={{ fontWeight: 700 }}>{filteredProducts.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filteredProducts.map((product) => (
          <div
            key={product.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 18,
              borderRadius: 18,
              border: '1px solid #e2e8f0',
              background: '#fff',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{product.name}</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>{product.category}</div>
            </div>
            <div style={{ fontWeight: 800, color: '#4f46e5' }}>${product.price}</div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b', borderRadius: 18, background: '#f8fafc' }}>
            No products matched the current search.
          </div>
        )}
      </div>
    </div>
  );
}

export default Demo;
