/**
 * LibreOffice DOCX to PDF converter
 * Uses LibreOffice command-line to convert DOCX to PDF with better formatting preservation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);

/**
 * Convert DOCX buffer to PDF buffer using LibreOffice
 * Preserves original document formatting and layout
 * @param docxBuffer - Buffer containing DOCX file content
 * @returns Buffer containing PDF file content
 */
export async function convertDocxToPdfWithLibreOffice(docxBuffer: Buffer): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const tempDocxFile = path.join(tempDir, `temp_${Date.now()}.docx`);
  const tempPdfFile = path.join(tempDir, `temp_${Date.now()}.pdf`);

  try {
    // Step 1: Write DOCX buffer to temporary file
    fs.writeFileSync(tempDocxFile, docxBuffer);

    // Step 2: Use LibreOffice to convert DOCX to PDF
    const command = `libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${tempDocxFile}"`;
    
    try {
      await execPromise(command, { timeout: 30000 });
    } catch (error: any) {
      // LibreOffice might report success in stderr, so check if PDF was created
      if (!fs.existsSync(tempPdfFile)) {
        throw new Error(`LibreOffice conversion failed: ${error.message}`);
      }
    }

    // Step 3: Read the generated PDF
    if (!fs.existsSync(tempPdfFile)) {
      throw new Error('LibreOffice did not generate output PDF file');
    }

    const pdfBuffer = fs.readFileSync(tempPdfFile);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF file is empty');
    }

    console.log('✓ DOCX converted to PDF successfully using LibreOffice');
    return pdfBuffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`LibreOffice PDF conversion failed: ${errorMessage}`);
  } finally {
    // Cleanup: Remove temporary files
    try {
      if (fs.existsSync(tempDocxFile)) {
        fs.unlinkSync(tempDocxFile);
      }
      if (fs.existsSync(tempPdfFile)) {
        fs.unlinkSync(tempPdfFile);
      }
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError);
    }
  }
}

/**
 * Check if LibreOffice is available on the system
 * @returns true if LibreOffice is installed and available
 */
export async function isLibreOfficeAvailable(): Promise<boolean> {
  try {
    await execPromise('libreoffice --version', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
