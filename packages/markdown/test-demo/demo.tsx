import React from 'react';
import * as Pkg from '../src/index';

/**
 * Demo for @input-kit/markdown
 * Markdown renderer
 */
export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>@input-kit/markdown</h1>
      <p>Markdown renderer</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Basic Usage</h2>
        {/* Add component usage here */}
        <p>Demo implementation pending...</p>
        <pre>
          <code>{JSON.stringify(Object.keys(Pkg), null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

export default Demo;
