'use client';

import '@/lib/suppressPdfWarnings';
import { InvoiceWizard } from '@/components/InvoiceWizard';

// Force dynamic rendering since this page uses browser APIs
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Invoice Automation</h1>
          <p className="text-xl text-gray-600">
            Create professional invoices from templates in minutes
          </p>
        </div>

        <InvoiceWizard />
      </div>
    </div>
  );
}
