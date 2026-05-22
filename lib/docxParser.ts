/**
 * Library for parsing .docx files and extracting template variables
 */

import mammoth from 'mammoth';
import type { TemplateVariable, TableSchema, ParsedTemplate } from '@/types';

const VARIABLE_PATTERN = /\{\{\s*([^}]+?)\s*\}\}/g;

/**
 * Extract HTML with styling from .docx file
 * Preserves Word document formatting and layout - extracts and includes original styles
 */
export async function extractDocxAsHtml(buffer: Buffer): Promise<string> {
  try {
    // Configure Mammoth to preserve all Word document styles and formatting
    const options = {
      // Map Word styles to HTML elements - preserve semantic meaning
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
      // Include default style mappings to preserve built-in Word styles
      includeDefaultStyleMap: true,
      // Preserve all character formatting (bold, italic, color, font, etc.)
      preserveEmphasis: true,
    };

    const result = await mammoth.convertToHtml({ buffer }, options);
    let html = result.value;
    
    // Extract style information if available
    const styleElements = (result as any).styleElements || [];
    let stylesCss = '';
    
    if (styleElements.length > 0) {
      stylesCss = styleElements.map((style: any) => style.value).join('\n');
    }
    
    // Include any warnings from Mammoth (useful for debugging)
    if (result.messages && result.messages.length > 0) {
      console.log('Mammoth conversion messages:', result.messages);
    }

    // Return original HTML from Mammoth with embedded styles to preserve Word formatting
    const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
/* Word document styles - preserves all formatting from the original document */
${stylesCss}
/* Minimal base styles */
body { margin: 0; padding: 10px; font-family: 'Calibri', 'Arial', sans-serif; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
</style>
</head>
<body>
${html}
</body>
</html>`;
    
    return wrappedHtml;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract HTML from DOCX: ${errorMessage}`);
  }
}

/**
 * Extract plain text and variables from .docx file
 */
export async function parseDocxContent(buffer: Buffer): Promise<ParsedTemplate> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid file: buffer is empty');
    }

    const result = await mammoth.extractRawText({ buffer });
    const content = result.value;

    if (!content) {
      throw new Error('Failed to extract text from .docx file');
    }
    
    // Extract table schemas first to identify table columns
    const tables = extractTables(content);
    const tableColumns = new Set<string>();
    tables.forEach((table) => {
      table.columns.forEach((col) => {
        tableColumns.add(col.name.toLowerCase());
        tableColumns.add(col.id.toLowerCase());
      });
    });
    
    // Extract all variables matching {{variableName}} pattern (excluding table columns)
    const variables = extractVariables(content, tableColumns);

    return {
      variables,
      tables,
      content,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error parsing .docx:', errorMessage, error);
    throw new Error(`Failed to parse .docx file: ${errorMessage}`);
  }
}

/**
 * Extract variable names from content using regex pattern
 * Excludes columns that are part of table schemas
 */
function extractVariables(content: string, tableColumns: Set<string>): TemplateVariable[] {
  const variableNames = new Set<string>();
  let match;

  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    // Trim whitespace from captured variable name
    const varName = match[1].trim();
    // Skip if this variable is a table column
    if (varName && !tableColumns.has(varName.toLowerCase())) {
      variableNames.add(varName);
    }
  }

  // Convert to TemplateVariable objects with sensible defaults
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
  
  if (lowerName.includes('amount') || lowerName.includes('price') || lowerName.includes('total')) {
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
  if (lowerName.includes('quantity') || lowerName.includes('count') || lowerName.includes('number')) {
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
 * Extract table schemas from content
 * Looks for {{TABLE:tableName}} markers, or auto-detects tables from common patterns
 */
function extractTables(content: string): TableSchema[] {
  // First, check for explicit {{TABLE:tableName}} markers
  const tablePattern = /\{\{TABLE:(\w+)\}\}/g;
  const tables: TableSchema[] = [];
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
          id: 'quantity',
          name: 'quantity',
          type: 'number',
          label: 'Quantity',
          required: true,
        },
        {
          id: 'unitPrice',
          name: 'unitPrice',
          type: 'currency',
          label: 'Unit Price',
          required: true,
        },
        {
          id: 'total',
          name: 'total',
          type: 'currency',
          label: 'Total',
          required: false,
        },
      ],
    });
  }

  // Auto-detect table from common column patterns if no explicit tables found
  if (tables.length === 0) {
    // Check if content has common table columns like Description, Amount, etc.
    const commonTableColumns = [
      { id: 'description', name: 'description', label: 'Description', type: 'text' as const },
      { id: 'amount', name: 'amount', label: 'Amount', type: 'currency' as const },
    ];
    
    const contentLower = content.toLowerCase();
    const hasDescription = contentLower.includes('description');
    const hasAmount = contentLower.includes('amount') || contentLower.includes('price') || contentLower.includes('total');
    
    // If both Description and Amount-like fields exist, create a default "Items" table
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

/**
 * Replace variables in content with provided values
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string | number>
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    // Match {{variableName}} with optional spaces around the variable name
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, String(value));
  }

  return result;
}

