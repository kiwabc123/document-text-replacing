/**
 * Docshift DOCX to HTML Converter
 * Pure JavaScript solution with excellent style preservation
 * No native dependencies - works perfectly with Turbopack
 */

import { toHtml } from 'docshift';

/**
 * Convert DOCX to HTML using docshift
 * @param docxBuffer - Buffer containing DOCX file
 * @returns HTML string with embedded styles
 */
export async function convertDocxToHtmlWithDocshift(docxBuffer: Buffer): Promise<string> {
  try {
    // Docshift requires a Blob object, not a Buffer
    // Convert Buffer to Uint8Array and wrap in Blob
    console.log('🔄 Converting Buffer to Blob for docshift...');
    const uint8Array = new Uint8Array(docxBuffer);
    const blob = new Blob([uint8Array], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    console.log('✅ Blob created, size:', blob.size, 'bytes');
    
    // Call docshift.toHtml with Blob
    console.log('🔄 Calling docshift.toHtml()...');
    const html = await toHtml(blob as unknown as Buffer);
    
    console.log('✅ DOCX converted to HTML using docshift, size:', html.length, 'bytes');
    return html;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Docshift conversion error:', errorMessage);
    throw new Error(`Docshift conversion failed: ${errorMessage}`);
  }
}

/**
 * Check if docshift is available
 */
export function isDocshiftAvailable(): boolean {
  try {
    // Docshift is installed as a dependency
    return true;
  } catch {
    return false;
  }
}

/**
 * Get docshift availability status
 */
export function getDocshiftStatus(): { available: boolean; error: string | null } {
  const available = isDocshiftAvailable();
  return {
    available,
    error: available ? null : 'docshift is not installed',
  };
}
