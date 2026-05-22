/**
 * Aspose Words Integration
 * Converts DOCX to HTML with improved style preservation
 * 
 * Note: This module uses dynamic require to avoid bundling native dependencies
 * It should only be imported on the server side (API routes, server components)
 */

let aw: any;
let asposLoaded = false;
let asposeLoadError: string | null = null;

// Lazy load Aspose Words (optional dependency) - SERVER SIDE ONLY
async function loadAspose() {
  if (asposLoaded) return aw;
  
  // Only run on server side
  if (typeof window !== 'undefined') {
    asposLoaded = true;
    asposeLoadError = 'Aspose Words cannot be loaded on client side';
    return null;
  }
  
  try {
    // Dynamic require to avoid bundling issues with native modules
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    aw = require(/* webpackIgnore: true */ '@aspose/words');
    asposLoaded = true;
    console.log('✓ Aspose Words loaded successfully');
    return aw;
  } catch (error) {
    asposLoaded = true;
    const errorMsg = error instanceof Error ? error.message : String(error);
    asposeLoadError = errorMsg;
    console.debug('ℹ Aspose Words not available, will use Mammoth.js fallback');
    console.debug('  To install Aspose: npm install @aspose/words');
    return null;
  }
}

/**
 * Convert DOCX to HTML using Aspose Words with style preservation
 * @param docxBuffer - Buffer containing DOCX file
 * @returns HTML string with embedded styles
 */
export async function convertDocxToHtmlWithAspose(docxBuffer: Buffer): Promise<string> {
  const aspose = await loadAspose();
  
  if (!aspose) {
    throw new Error(
      'Aspose Words is not installed. ' +
      'Install with: npm install @aspose/words ' +
      'Or use Mammoth.js fallback for basic style preservation.'
    );
  }

  try {
    // Write buffer to temporary file (Aspose requires file path)
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.docx`);
    const outputPath = path.join(tmpDir, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.html`);

    // Write DOCX to temp file
    await fs.writeFile(inputPath, docxBuffer);

    // Load and convert document
    const doc = new aspose.Document(inputPath);

    // Configure HTML save options for style preservation
    const options = new aspose.HtmlSaveOptions();
    options.setExportStylesLines(true);
    options.setExportImagesAsBase64(true); // Embed images as base64
    options.setExportFontsAsBase64(true); // Embed fonts
    options.setCssClassNamesPrefix('docx_'); // Prefix CSS classes to avoid conflicts
    options.setDefaultFontName('Calibri');

    // Save as HTML
    doc.save(outputPath, options);

    // Read HTML output
    const htmlContent = await fs.readFile(outputPath, 'utf-8');

    // Clean up temporary files
    await fs.unlink(inputPath).catch(() => {}); // Ignore errors
    await fs.unlink(outputPath).catch(() => {});

    console.log('✓ DOCX converted to HTML using Aspose Words (superior style preservation)');
    return htmlContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Aspose conversion error:', errorMessage);
    throw new Error(`Aspose Words conversion failed: ${errorMessage}`);
  }
}

/**
 * Check if Aspose Words is available
 */
export async function isAsposAvailable(): Promise<boolean> {
  const aspose = await loadAspose();
  return !!aspose;
}

/**
 * Get Aspose availability status and error details
 */
export function getAsposStatus(): { available: boolean; error: string | null } {
  return {
    available: aw !== null && asposLoaded,
    error: asposeLoadError,
  };
}
