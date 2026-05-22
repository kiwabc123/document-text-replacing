'use client';

/**
 * Component: CSVImporter
 * Upload and parse CSV files
 */

import { useState } from 'react';

interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  mapping?: Record<string, string>;
}

interface CSVImporterProps {
  templateVariables?: string[];
  templateTables?: Array<{ id: string; name: string; columns: Array<{ name: string; type: string }> }>;
  onImportSuccess: (data: CsvParseResult) => void;
  onImportError: (error: string) => void;
}

export function CSVImporter({
  templateVariables,
  templateTables,
  onImportSuccess,
  onImportError,
}: CSVImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith('.csv')) {
      onImportError('Only .csv files are supported');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (templateVariables) {
        formData.append('templateVariables', JSON.stringify(templateVariables));
      }
      
      if (templateTables) {
        formData.append('templateTables', JSON.stringify(templateTables));
      }

      const response = await fetch('/api/data/parse-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Import failed';
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } else {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      onImportSuccess(result.data);
    } catch (error) {
      onImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50">
      <label htmlFor="csv-import" className="cursor-pointer">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M9 12h30M9 24h30M9 36h30M6 12v24a2 2 0 002 2h28a2 2 0 002-2V12a2 2 0 00-2-2H8a2 2 0 00-2 2z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {fileName ? `Importing: ${fileName}` : 'Import from CSV'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Upload bulk invoice data</p>
        </div>
        <input
          id="csv-import"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>
      {isLoading && <p className="mt-2 text-center text-sm text-green-600">Importing...</p>}
    </div>
  );
}
