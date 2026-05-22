/**
 * Invoice-related TypeScript types
 */

import type { TemplateVariable } from './template';

export interface InvoiceData {
  templateId: string;
  variables: Record<string, string | number>;
  tableData: Record<string, TableRow[]>;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface PDFGenerationRequest {
  templateId: string;
  variables: Record<string, string | number>;
  tableData: Record<string, TableRow[]>;
}

export interface PDFGenerationResponse {
  pdf: string; // base64 encoded PDF
  fileName: string;
}
