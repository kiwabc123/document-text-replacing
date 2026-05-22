/**
 * Library for parsing PDF files and extracting template variables
 * Uses pdf-parse for server-side text extraction
 */


import type { ParsedTemplate, TemplateVariable, TableSchema } from '@/types';

const VARIABLE_PATTERN = /\{\{\s*([^}]+?)\s*\}\}/g;

/**
 * Extract text and variables from PDF file
 * Note: This requires pdf-parse to be installed
 */
export async function parsePdfContent(buffer: Buffer): Promise<ParsedTemplate> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid file: buffer is empty');
    }

    // Polyfill for DOMMatrix (required for pdf-parse on server)
    if (typeof (global as any).DOMMatrix === 'undefined') {
      (global as any).DOMMatrix = class DOMMatrix {
        constructor(init?: any) {
          if (init) {
            const values = typeof init === 'string' ? init.split(',').map(parseFloat) : init;
            this.a = values[0] || 1;
            this.b = values[1] || 0;
            this.c = values[2] || 0;
            this.d = values[3] || 1;
            this.e = values[4] || 0;
            this.f = values[5] || 0;
          } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
          }
        }
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;
        multiply(m: any) {
          return new (global as any).DOMMatrix([
            this.a * m.a + this.c * m.b,
            this.b * m.a + this.d * m.b,
            this.a * m.c + this.c * m.d,
            this.b * m.c + this.d * m.d,
            this.a * m.e + this.c * m.f + this.e,
            this.b * m.e + this.d * m.f + this.f,
          ]);
        }
        inverse() {
          const det = this.a * this.d - this.b * this.c;
          if (det === 0) return null;
          return new (global as any).DOMMatrix([
            this.d / det,
            -this.b / det,
            -this.c / det,
            this.a / det,
            (this.c * this.f - this.d * this.e) / det,
            (this.b * this.e - this.a * this.f) / det,
          ]);
        }
      };
    }

    const pdfParseModule = require('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    // Parse PDF to extract text
    const pdfData = await pdfParse(buffer);
    const fullText = pdfData.text;

    console.log('Extracted PDF text:', fullText);

    // Extract tables first to identify table columns
    const tables = extractTables(fullText);
    const tableColumns = new Set<string>();
    tables.forEach((table) => {
      table.columns.forEach((col) => {
        tableColumns.add(col.name.toLowerCase());
        tableColumns.add(col.id.toLowerCase());
      });
    });

    // Extract variables (excluding table columns)
    const variables = extractVariables(fullText, tableColumns);

    return {
      variables,
      tables,
      content: fullText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error parsing PDF:', errorMessage, error);
    throw new Error(`Failed to parse PDF file: ${errorMessage}`);
  }
}

/**
 * Extract variable names from content using regex pattern
 */
function extractVariables(content: string, tableColumns: Set<string>): TemplateVariable[] {
  const variableNames = new Set<string>();
  let match;

  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    const varName = match[1].trim();
    if (varName && !tableColumns.has(varName.toLowerCase())) {
      variableNames.add(varName);
    }
  }

  return Array.from(variableNames).map((name) => ({
    name,
    type: inferVariableType(name),
    label: formatLabel(name),
    required: true,
    placeholder: `Enter ${formatLabel(name).toLowerCase()}`,
  }));
}

/**
 * Infer variable type based on naming conventions
 */
function inferVariableType(name: string): TemplateVariable['type'] {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes('amount') ||
    lowerName.includes('price') ||
    lowerName.includes('total')
  ) {
    return 'currency';
  }
  if (lowerName.includes('date') || lowerName.includes('time')) {
    return 'date';
  }
  if (lowerName.includes('email')) {
    return 'email';
  }
  if (lowerName.includes('phone')) {
    return 'phone';
  }
  if (
    lowerName.includes('quantity') ||
    lowerName.includes('count') ||
    lowerName.includes('number')
  ) {
    return 'number';
  }

  return 'text';
}

/**
 * Format variable name to human-readable label
 */
function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Extract table schemas from PDF content
 */
function extractTables(content: string): TableSchema[] {
  const tables: TableSchema[] = [];

  // Check for explicit {{TABLE:tableName}} markers
  const tablePattern = /\{\{TABLE:(\w+)\}\}/g;
  let match;

  while ((match = tablePattern.exec(content)) !== null) {
    const tableName = match[1];
    tables.push({
      id: tableName,
      name: tableName,
      columns: [
        {
          id: 'description',
          name: 'description',
          type: 'text',
          label: 'Description',
          required: true,
        },
        {
          id: 'amount',
          name: 'amount',
          type: 'currency',
          label: 'Amount',
          required: true,
        },
      ],
    });
  }

  // Auto-detect table from common column patterns
  if (tables.length === 0) {
    const contentLower = content.toLowerCase();
    const hasDescription = contentLower.includes('description');
    const hasAmount =
      contentLower.includes('amount') ||
      contentLower.includes('price') ||
      contentLower.includes('total');

    if (hasDescription && hasAmount) {
      tables.push({
        id: 'items',
        name: 'Items',
        columns: [
          {
            id: 'description',
            name: 'description',
            type: 'text',
            label: 'Description',
            required: true,
          },
          {
            id: 'amount',
            name: 'amount',
            type: 'currency',
            label: 'Amount',
            required: true,
          },
        ],
      });
    }
  }

  return tables;
}



