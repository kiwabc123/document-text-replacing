/**
 * Convert DOCX file to PDF
 * Uses LibreOffice for best formatting preservation, falls back to Mammoth if unavailable
 */

import mammoth from 'mammoth';
import { generatePdfFromHtml } from '@/lib/pdfGenerator';
import { convertDocxToPdfWithLibreOffice, isLibreOfficeAvailable } from '@/lib/libreOfficeConverter';

/**
 * Convert DOCX buffer to PDF buffer
 * @param docxBuffer - Buffer containing DOCX file content
 * @returns Buffer containing PDF file content
 */
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  try {
    // Step 1: Try LibreOffice first (best formatting preservation)
    const libreOfficeAvailable = await isLibreOfficeAvailable();
    
    if (libreOfficeAvailable) {
      console.log('Using LibreOffice for DOCX to PDF conversion');
      return await convertDocxToPdfWithLibreOffice(docxBuffer);
    }

    console.log('LibreOffice not available, falling back to Mammoth + Puppeteer');

    // Step 2: Fallback to Mammoth + Puppeteer if LibreOffice not available
    const result = await mammoth.convertToHtml({ 
      buffer: docxBuffer
    });
    const html = result.value;
    console.log(html , result.messages);
    
    if (!html || html.trim().length === 0) {
      throw new Error('Failed to extract content from DOCX file');
    }

    // Step 3: Wrap HTML with proper styling
    const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table td, table th {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
`;

    // Step 3: Convert HTML to PDF using Puppeteer
    const pdfBuffer = await generatePdfFromHtml(styledHtml);

    return pdfBuffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error converting DOCX to PDF:', errorMessage, error);
    throw new Error(`Failed to convert DOCX to PDF: ${errorMessage}`);
  }
}
