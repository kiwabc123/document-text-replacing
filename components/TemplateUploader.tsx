'use client';

/**
 * Component: TemplateUploader
 * Allows users to upload template files (.docx or .json)
 * Supports both Word documents and JSON template format
 */

import { useState } from 'react';
import { uploadTemplate } from '@/lib/serverApi';
import { parseJsonTemplate as parseJsonTemplateFile, createSampleJsonTemplate } from '@/lib/jsonTemplateParser';
import type { TemplateMetadata } from '@/types';

interface TemplateUploaderProps {
  onUploadSuccess: (template: TemplateMetadata) => void;
  onUploadError: (error: string) => void;
}

type UploadMode = 'docx' | 'json';

export function TemplateUploader({ onUploadSuccess, onUploadError }: TemplateUploaderProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>('json');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type based on upload mode
    const validExtensions = uploadMode === 'json' ? ['.json'] : ['.docx'];
    const isValidFile = validExtensions.some((ext) => file.name.endsWith(ext));

    if (!isValidFile) {
      onUploadError(`Only ${validExtensions.join(', ')} files are supported for this mode`);
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      let metadata: TemplateMetadata;

      if (uploadMode === 'json') {
        // Parse JSON template client-side
        console.log('Parsing JSON template:', file.name);
        const jsonText = await file.text();
        const template = parseJsonTemplateFile(jsonText);

        metadata = {
          id: `template_${Date.now()}`,
          name: template.name,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          variables: template.variables,
          tables: template.tables || [],
          content: '',
          templateJson: template,
          templateType: 'json',
        };
      } else {
        // Upload DOCX to server
        console.log('Uploading DOCX template:', file.name);
        metadata = await uploadTemplate(file);
      }

      onUploadSuccess(metadata);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
      setFileName(null);
    }
  }

  async function downloadSampleTemplate() {
    try {
      const template = createSampleJsonTemplate();
      const blob = new Blob([JSON.stringify(template, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample-template.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      onUploadError('Failed to download sample template');
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setUploadMode('json')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            uploadMode === 'json'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📄 JSON Template (Recommended)
        </button>
        <button
          onClick={() => setUploadMode('docx')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            uploadMode === 'docx'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📄 Word Document (.docx)
        </button>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <label htmlFor="template-upload" className="cursor-pointer">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a2 2 0 00-2.828 0L28 8m0 0L14 22"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {fileName
                ? `Uploading: ${fileName}`
                : uploadMode === 'json'
                  ? 'Upload a JSON template (.json)'
                  : 'Upload a Word template (.docx)'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {uploadMode === 'json'
                ? 'JSON format provides better styling control'
                : 'File will be converted to PDF automatically'}
            </p>
          </div>
          <input
            id="template-upload"
            type="file"
            accept={uploadMode === 'json' ? '.json' : '.docx'}
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>
        {isLoading && <p className="mt-2 text-center text-sm text-blue-600">Uploading...</p>}
      </div>

      {/* Sample template download for JSON */}
      {uploadMode === 'json' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            📌 <strong>New to JSON templates?</strong> Download a sample template to see the format:
          </p>
          <button
            onClick={downloadSampleTemplate}
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ⬇️ Download Sample Template
          </button>
        </div>
      )}
    </div>
  );
}
