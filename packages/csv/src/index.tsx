// @input-kit/csv - CSV parser and formatter

export interface ParseOptions {
  delimiter?: string;
  newline?: string;
  quoteChar?: string;
  escapeChar?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
}

export interface ParseResult<T = Record<string, string>> {
  data: T[];
  errors: Array<{ row: number; message: string }>;
  meta: {
    fields?: string[];
    rowCount: number;
  };
}

export function parseCSV<T = Record<string, string>>(
  csv: string,
  options: ParseOptions = {}
): ParseResult<T> {
  const {
    delimiter = ',',
    newline = '\n',
    quoteChar = '"',
    header = true,
    skipEmptyLines = true,
  } = options;

  const errors: Array<{ row: number; message: string }> = [];
  
  // Split into lines
  let lines = csv.split(newline);
  
  if (skipEmptyLines) {
    lines = lines.filter(line => line.trim() !== '');
  }

  if (lines.length === 0) {
    return { data: [], errors, meta: { rowCount: 0 } };
  }

  // Parse header
  let fields: string[] = [];
  let dataStartIndex = 0;

  if (header) {
    fields = parseLine(lines[0], delimiter, quoteChar);
    dataStartIndex = 1;
  }

  // Parse data rows
  const data: T[] = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter, quoteChar);
    
    if (header) {
      const row: Record<string, string> = {};
      fields.forEach((field, index) => {
        row[field] = values[index] ?? '';
      });
      data.push(row as T);
    } else {
      data.push(values as unknown as T);
    }
  }

  return {
    data,
    errors,
    meta: {
      fields: header ? fields : undefined,
      rowCount: data.length,
    },
  };
}

function parseLine(line: string, delimiter: string, quoteChar: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === quoteChar) {
      if (inQuotes && nextChar === quoteChar) {
        // Escaped quote
        current += quoteChar;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export interface StringifyOptions {
  delimiter?: string;
  newline?: string;
  quoteChar?: string;
  header?: boolean;
}

export function stringifyCSV<T = Record<string, string>>(
  data: T[],
  options: StringifyOptions = {}
): string {
  const {
    delimiter = ',',
    newline = '\n',
    quoteChar = '"',
    header = true,
  } = options;

  if (data.length === 0) return '';

  const lines: string[] = [];

  // Header
  if (header) {
    const fields = Object.keys(data[0] as object);
    lines.push(fields.join(delimiter));
  }

  // Data rows
  for (const row of data) {
    const values = Object.values(row as object).map(value => {
      const str = String(value ?? '');
      // Quote if contains delimiter, newline, or quote char
      if (str.includes(delimiter) || str.includes(newline) || str.includes(quoteChar)) {
        return quoteChar + str.split(quoteChar).join(quoteChar + quoteChar) + quoteChar;
      }
      return str;
    });
    lines.push(values.join(delimiter));
  }

  return lines.join(newline);
}

// Stream parsing for large files
export async function* parseCSVStream(
  stream: ReadableStream<string>,
  options: ParseOptions = {}
): AsyncGenerator<Record<string, string>, void, unknown> {
  const reader = stream.getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += value;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const result = parseCSV(line, { ...options, header: false });
        if (result.data.length > 0) {
          yield result.data[0];
        }
      }
    }

    if (buffer) {
      const result = parseCSV(buffer, { ...options, header: false });
      if (result.data.length > 0) {
        yield result.data[0];
      }
    }
  } finally {
    reader.releaseLock();
  }
}
