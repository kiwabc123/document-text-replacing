'use client';

/**
 * Component: PDFPreview
 * Display PDF in-browser using react-pdf
 */

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import PDF components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false });

// Set up worker URL using local file instead of CDN
if (typeof window !== 'undefined') {
  const pdfjs = require('react-pdf');
  pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-js/pdf.worker.min.mjs`;
}

interface PDFPreviewProps {
  pdfUrl?: string;
  fileName?: string;
  isLoading?: boolean;
}

export function PDFPreview({ pdfUrl, fileName = 'invoice.pdf', isLoading = false }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    setNumPages(nextNumPages);
    setError(null);
  }

  function onDocumentLoadError() {
    setError('Failed to load PDF');
  }

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
      <div className="bg-white border border-gray-300 rounded-lg overflow-auto flex flex-col items-center justify-center min-h-[600px] bg-gray-50 p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<p className="p-4 text-gray-500">Loading PDF...</p>}
        >
          <Page pageNumber={currentPage} width={800} />
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            ← Previous
          </button>
          <p className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {numPages}
          </p>
          <button
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage === numPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Next →
          </button>
        </div>
      )}

      <a
        href={pdfUrl}
        download={fileName}
        className="block w-full text-center rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 transition"
      >
        ⬇️ Download PDF
      </a>
    </div>
  );
}
