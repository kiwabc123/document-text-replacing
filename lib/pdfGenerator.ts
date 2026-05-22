/**
 * Library for generating PDFs using Puppeteer and pdf-lib
 */

import puppeteer, { Browser } from 'puppeteer';
import { PDFDocument, rgb } from 'pdf-lib';
import type { TableRow } from '@/types';

let browser: Browser | null = null;

/**
 * Get or create Puppeteer browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to launch Puppeteer browser: ${errorMsg}. Ensure Node.js environment supports Chromium.`);
    }
  }
  return browser;
}

/**
 * Close Puppeteer browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Generate PDF from HTML content
 */
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    // Set viewport to A4 dimensions for better rendering
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      scale: 1,
    });

    if (!pdfBuffer) {
      throw new Error('PDF generation returned empty buffer');
    }

    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PDF generation failed: ${errorMsg}`);
  } finally {
    await page.close();
  }
}

/**
 * Convert invoice data to HTML template
 */
export function renderInvoiceHtml(
  invoiceNumber: string,
  variables: Record<string, string | number>,
  tableData: Record<string, TableRow[]>
): string {
  const variablesHtml = Object.entries(variables)
    .map(([key, value]) => `<p><strong>${formatLabel(key)}:</strong> ${value}</p>`)
    .join('');

  const tablesHtml = Object.entries(tableData)
    .map(([tableName, rows]) => renderTableHtml(tableName, rows))
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 14px;
          color: #666;
        }
        .details {
          margin: 20px 0;
        }
        .details p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        table th {
          background-color: #f0f0f0;
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          font-weight: bold;
        }
        table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Invoice</div>
        <div class="invoice-number">Invoice #${invoiceNumber}</div>
      </div>
      
      <div class="details">
        ${variablesHtml}
      </div>

      ${tablesHtml}

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Render table as HTML
 */
function renderTableHtml(tableName: string, rows: TableRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const headerHtml = headers.map((h) => `<th>${formatLabel(h)}</th>`).join('');
  const rowsHtml = rows
    .map((row) => {
      const cells = headers.map((h) => `<td>${row[h]}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <div>
      <h3>${formatLabel(tableName)}</h3>
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
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
 * Fill a PDF template with variable values
 * @param templatePdfBase64 - Base64 encoded PDF template
 * @param variables - Variables to fill into the template
 * @returns Buffer containing the filled PDF
 */
export async function fillPdfTemplate(
  templatePdfBase64: string,
  variables: Record<string, string | number>
): Promise<Buffer> {
  try {
    // Decode base64 PDF
    const pdfBuffer = Buffer.from(templatePdfBase64, 'base64');
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    const { width, height } = firstPage.getSize();
    
    // Simple approach: extract all text on first page and replace {{variables}}
    // Draw replaced text on the PDF
    let yPosition = height - 50; // Start from top
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const text = `${formatLabel(key)}: ${value}`;
      
      firstPage.drawText(text, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
    }
    
    // Save and return the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fill PDF template: ${errorMsg}`);
  }
}
