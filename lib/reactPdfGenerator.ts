/**
 * React PDF Generator
 * Uses @react-pdf/renderer to generate professional PDFs
 */

import { renderToBuffer } from '@react-pdf/renderer';
import InvoiceDocument from '@/lib/InvoiceDocument';
import type { TableRow } from '@/types';

interface GenerateInvoicePdfOptions {
  invoiceNumber: string;
  variables: Record<string, string | number>;
  tableData?: Record<string, TableRow[]>;
}

/**
 * Generate PDF from invoice data using React PDF
 * @param options - Invoice data
 * @returns Buffer containing PDF
 */
export async function generateInvoicePdf(options: GenerateInvoicePdfOptions): Promise<Buffer> {
  try {
    const { invoiceNumber, variables, tableData = {} } = options;

    console.log('Generating PDF using React PDF');
    console.log('Invoice Number:', invoiceNumber);
    console.log('Variables:', Object.keys(variables));

    // Create React PDF document component
    const document = InvoiceDocument({ invoiceNumber, variables, tableData });

    // Render to PDF buffer
    const pdfBuffer = await renderToBuffer(document as any);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('React PDF generation returned empty buffer');
    }

    console.log(`✓ PDF generated successfully (${pdfBuffer.length} bytes)`);
    return Buffer.from(pdfBuffer);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`React PDF generation failed: ${errorMsg}`);
  }
}
