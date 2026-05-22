/**
 * Table validation and calculation utilities
 */

import type { TableRow } from '@/types';

export interface TableValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate table rows against schema
 */
export function validateTableRows(
  rows: TableRow[],
  columnTypes: Record<string, 'text' | 'number' | 'currency' | 'date' | 'email' | 'phone'>
): TableValidationResult {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    Object.entries(columnTypes).forEach(([column, type]) => {
      const value = row[column];

      if (type === 'number' || type === 'currency') {
        if (value !== '' && value !== null && value !== undefined) {
          if (isNaN(Number(value))) {
            errors.push(`Row ${index + 1}, Column "${column}": Invalid number format`);
          }
        }
      }

      if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push(`Row ${index + 1}, Column "${column}": Invalid email format`);
        }
      }

      if (type === 'phone' && value) {
        const phoneRegex = /^[\d\s\-+()]+$/;
        if (!phoneRegex.test(String(value))) {
          errors.push(`Row ${index + 1}, Column "${column}": Invalid phone format`);
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate totals for numeric columns
 */
export function calculateColumnTotals(
  rows: TableRow[],
  numericColumns: string[]
): Record<string, number> {
  const totals: Record<string, number> = {};

  numericColumns.forEach((column) => {
    totals[column] = rows.reduce((sum, row) => {
      const value = row[column];
      return sum + (value ? Number(value) : 0);
    }, 0);
  });

  return totals;
}

/**
 * Format table row for display
 */
export function formatTableRow(row: TableRow, columnFormats?: Record<string, (v: any) => string>): TableRow {
  const formatted: TableRow = {};

  Object.entries(row).forEach(([key, value]) => {
    if (columnFormats && columnFormats[key]) {
      formatted[key] = columnFormats[key](value);
    } else {
      formatted[key] = value;
    }
  });

  return formatted;
}
