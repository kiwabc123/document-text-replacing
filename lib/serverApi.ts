import { TemplateMetadata as SharedTemplateMetadata } from "@/types";
/**
 * API client for server-side service
 * All requests go to http://localhost:5000 (development) or backend server (production)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type TemplateMetadata = SharedTemplateMetadata;

export interface PDFGenerationRequest {
  variables: Record<string, string | number>;
  templateContent: string;
  tableData?: Record<string, Array<Record<string, string | number>>>;
}

export interface PDFGenerationResponse {
  success: boolean;
  data?: {
    pdf: string;
    size: number;
  };
  error?: string;
}

/**
 * Upload template file to server
 */
export async function uploadTemplate(file: File): Promise<TemplateMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/templates/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate PDF from template with variables
 */
export async function generatePDF(
  request: PDFGenerationRequest
): Promise<PDFGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/pdf/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || 'PDF generation failed',
    };
  }

  return await response.json();
}

/**
 * Check if server is healthy
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
