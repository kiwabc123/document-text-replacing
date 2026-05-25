'use client';

/**
 * Component: PDFPreview
 * Display PDF in-browser using native browser viewer
 */

import { useState } from 'react';

interface PDFPreviewProps {
  pdfUrl?: string;
  fileName?: string;
  isLoading?: boolean;
}

export function PDFPreview({ pdfUrl, fileName = 'invoice.pdf', isLoading = false }: PDFPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Generating PDF...</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No PDF to preview</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PDF Viewer using native browser */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=1`}
          title={fileName}
          className="w-full h-96 rounded"
          onError={() => setError('Failed to load PDF')}
        />
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 transition"
      >
        ⬇️ Download PDF
      </button>
    </div>
  );
}
