/**
 * CSV parsing utilities
 */

import Papa from 'papaparse';

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse CSV content and return headers and rows
 */
export async function parseCsv(content: string): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      complete: (results: any) => {
        const [headerRow, ...dataRows] = results.data as string[][];
        
        if (!headerRow || headerRow.length === 0) {
          reject(new Error('Invalid CSV format'));
          return;
        }

        const headers = headerRow.map((h) => h.trim());
        const rows = dataRows
          .filter((row) => row.some((cell) => cell.trim())) // Filter out empty rows
          .map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((header, index) => {
              obj[header] = row[index]?.trim() || '';
            });
            return obj;
          });

        resolve({ headers, rows });
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Map CSV columns to template variables
 */
export function mapCsvToVariables(
  headers: string[],
  templateVariables: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};

  templateVariables.forEach((variable) => {
    // Try exact match first
    let matched = headers.find((h) => h.toLowerCase() === variable.toLowerCase());
    
    // If no match, try partial match
    if (!matched) {
      matched = headers.find((h) =>
        h.toLowerCase().includes(variable.toLowerCase()) ||
        variable.toLowerCase().includes(h.toLowerCase())
      );
    }

    if (matched) {
      mapping[variable] = matched;
    }
  });

  return mapping;
}
