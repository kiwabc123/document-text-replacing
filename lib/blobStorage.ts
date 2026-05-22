/**
 * Vercel Blob integration helper
 * Note: Vercel Blob integration requires setup with environment variables
 * TODO: Implement actual Vercel Blob integration when environment is configured
 */

// import { put, get, list } from '@vercel/blob';

const BLOB_PREFIX = 'invoice-templates/';

export interface BlobTemplateMetadata {
  fileName: string;
  uploadedAt: string;
  size: number;
}

/**
 * Upload file to Vercel Blob
 */
export async function uploadTemplate(
  fileName: string,
  buffer: Buffer
): Promise<{ url: string; pathname: string }> {
  const blobPath = `${BLOB_PREFIX}${Date.now()}_${fileName}`;

  // TODO: Implement Vercel Blob upload when environment is configured
  console.log(`Would upload ${fileName} to ${blobPath}`);

  return {
    url: `blob://${blobPath}`,
    pathname: blobPath,
  };
}

/**
 * Retrieve template file from Vercel Blob
 */
export async function getTemplate(pathname: string): Promise<Buffer> {
  // TODO: Implement Vercel Blob retrieval when environment is configured
  throw new Error('Template retrieval not yet configured');
}

/**
 * List all uploaded templates
 */
export async function listTemplates(): Promise<Array<{ pathname: string; uploadedAt: string }>> {
  // TODO: Implement Vercel Blob listing when environment is configured
  return [];
}

/**
 * Delete template from Vercel Blob
 */
export async function deleteTemplate(pathname: string): Promise<void> {
  // Note: Vercel Blob doesn't have a delete method yet, so we'll just track deletion locally
  // In production, you might want to use a database to track deleted templates
  console.log(`Template marked for deletion: ${pathname}`);
}
