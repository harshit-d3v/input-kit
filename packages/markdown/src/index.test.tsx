import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown, InlineMarkdown, parseMarkdown, parseInline } from './index';

const html = (md: string) => render(<Markdown content={md} />).container;

describe('URL sanitising', () => {
  it('renders an ordinary https link', () => {
    const c = html('[docs](https://example.com/a)');
    expect(c.querySelector('a')?.getAttribute('href')).toBe('https://example.com/a');
  });

  it('renders a root-relative link', () => {
    const c = html('[home](/dashboard)');
    expect(c.querySelector('a')?.getAttribute('href')).toBe('/dashboard');
  });

  // `//evil.com` is protocol-relative — it navigates off-origin — but the sanitiser
  // waved through anything starting with a slash as "internal". Excluding it from
  // that branch alone was not enough either: `new URL('//evil.com', base)` resolves
  // to a valid https: URL, so the absolute-URL branch approved it anyway.
  it.each(['//evil.com', '//evil.com/path', '\\\\evil.com'])(
    'rejects the protocol-relative URL %s',
    (url) => {
      const c = html(`[click](${url})`);
      expect(c.querySelector('a')).toBeNull();
      expect(c.textContent).toContain('click');
    }
  );

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
  ])('rejects %s', (url) => {
    const c = html(`[x](${url})`);
    expect(c.querySelector('a')).toBeNull();
  });

  it('applies the same rules to images', () => {
    expect(html('![alt](//evil.com/x.png)').querySelector('img')).toBeNull();
    expect(html('![alt](https://example.com/x.png)').querySelector('img')).toBeTruthy();
  });

  it('opens external links safely', () => {
    const a = html('[x](https://example.com)').querySelector('a')!;
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.getAttribute('target')).toBe('_blank');
  });
});

describe('tables', () => {
  // Both header and body were split on `|` then `.filter(Boolean)`, which stripped
  // the leading/trailing empties AND deleted genuinely empty cells, shifting every
  // column after them.
  it('keeps an empty cell so later columns stay aligned', () => {
    const md = ['| a | b | c |', '| --- | --- | --- |', '| 1 |  | 3 |'].join('\n');
    const c = html(md);
    const cells = c.querySelectorAll('tbody td');
    expect(cells).toHaveLength(3);
    expect(cells[0].textContent).toBe('1');
    expect(cells[1].textContent).toBe('');
    expect(cells[2].textContent).toBe('3');
  });

  it('parses headers and rows', () => {
    const md = ['| name | qty |', '| --- | --- |', '| apple | 3 |'].join('\n');
    const c = html(md);
    expect(c.querySelectorAll('thead th')).toHaveLength(2);
    expect(c.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('handles rows without outer pipes', () => {
    const md = ['a | b', '--- | ---', '1 | 2'].join('\n');
    expect(html(md).querySelectorAll('thead th')).toHaveLength(2);
  });
});

describe('inline emphasis', () => {
  it('renders bold and italic', () => {
    expect(html('**bold**').querySelector('strong')?.textContent).toBe('bold');
    expect(html('*em*').querySelector('em')?.textContent).toBe('em');
  });

  // CommonMark requires a non-space after the opening delimiter, so arithmetic is
  // not an emphasis run.
  it('does not italicise arithmetic', () => {
    const c = html('2 * 3 * 4');
    expect(c.querySelector('em')).toBeNull();
    expect(c.textContent).toContain('2 * 3 * 4');
  });

  it('renders strikethrough and inline code', () => {
    expect(html('~~gone~~').querySelector('del')?.textContent).toBe('gone');
    expect(html('`code`').querySelector('code')?.textContent).toBe('code');
  });
});

describe('block elements', () => {
  it('renders headings at the right level', () => {
    expect(html('# One').querySelector('h1')?.textContent).toBe('One');
    expect(html('### Three').querySelector('h3')?.textContent).toBe('Three');
  });

  it('renders lists', () => {
    expect(html('- a\n- b').querySelectorAll('ul li')).toHaveLength(2);
    expect(html('1. a\n2. b').querySelectorAll('ol li')).toHaveLength(2);
  });

  it('renders fenced code blocks', () => {
    const c = html('```js\nconst x = 1;\n```');
    expect(c.querySelector('pre')).toBeTruthy();
    expect(c.textContent).toContain('const x = 1;');
  });

  it('renders blockquotes and rules', () => {
    expect(html('> quoted').querySelector('blockquote')).toBeTruthy();
    expect(html('---').querySelector('hr')).toBeTruthy();
  });
});

describe('custom components', () => {
  it('uses an override for a tag', () => {
    render(
      <Markdown
        content="# Title"
        components={{ h1: ({ children }) => <h1 data-custom="yes">{children}</h1> }}
      />
    );
    expect(screen.getByText('Title').getAttribute('data-custom')).toBe('yes');
  });
});

describe('parsers', () => {
  it('parseMarkdown returns block tokens', () => {
    const tokens = parseMarkdown('# Hi\n\ntext');
    expect(tokens.map((t) => t.type)).toContain('h1');
    expect(tokens.map((t) => t.type)).toContain('p');
  });

  it('parseInline returns inline tokens only', () => {
    expect(parseInline('**b**').map((t) => t.type)).toEqual(['strong']);
  });

  it('InlineMarkdown renders without block wrappers', () => {
    const { container } = render(<InlineMarkdown content="**b**" />);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('strong')).toBeTruthy();
  });
});
