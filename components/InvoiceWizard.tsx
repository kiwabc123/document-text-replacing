'use client';

/**
 * Component: InvoiceWizard
 * Multi-step workflow for creating invoices
 */

import { useState } from 'react';
import { generatePDF } from '@/lib/serverApi';
import { generateInvoicePdf } from '@/lib/reactPdfGenerator';
import { TemplateUploader } from './TemplateUploader';
import { VariableForm } from './VariableForm';
import { CSVImporter } from './CSVImporter';
import { DynamicTableEditor } from './DynamicTableEditor';
import { PDFPreview } from './PDFPreview';
import type { TemplateMetadata, TableRow } from '@/types';

type Step = 'template' | 'data' | 'review' | 'preview';

interface InvoiceWizardState {
  template: TemplateMetadata | null;
  variables: Record<string, string | number>;
  tableData: Record<string, TableRow[]>;
  pdfUrl: string | null;
  isGenerating: boolean;
  error: string | null;
}

export function InvoiceWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [state, setState] = useState<InvoiceWizardState>({
    template: null,
    variables: {},
    tableData: {},
    pdfUrl: null,
    isGenerating: false,
    error: null,
  });
  console.log(state);
  
  function handleTemplateUpload(template: TemplateMetadata) {
    console.log(template);
    
    setState((prev) => ({
      ...prev,
      template,
      variables: {},
      tableData: {},
    }));
    setCurrentStep('data');
  }

  function handleTemplateUploadError(error: string) {
    setState((prev) => ({ ...prev, error }));
  }

  function handleVariablesSubmit(variables: Record<string, string | number>) {
    setState((prev) => ({ ...prev, variables }));
    setCurrentStep('review');
  }

  function handleTableDataChange(tableName: string, rows: TableRow[]) {
    console.log('handleTableDataChange called', {
      tableName,
      rowsLength: rows.length,
      currentVariables: state.variables,
    });
    
    setState((prev) => {
      const newState = {
        ...prev,
        tableData: {
          ...prev.tableData,
          [tableName]: rows,
        },
      };
      
      console.log('After handleTableDataChange:', {
        variables: newState.variables,
        tableData: newState.tableData,
      });
      
      return newState;
    });
  }

  async function generatePdf() {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    console.log('generatePdf called with state:', {
      variables: state.variables,
      tableData: state.tableData,
      templateType: (state.template as any)?.templateType,
    });

    try {
      const isJsonTemplate = (state.template as any)?.templateType === 'json';

      if (isJsonTemplate) {
        // JSON templates: generate PDF client-side using React PDF
        console.log('Generating PDF from JSON template (client-side)');
        const pdfBuffer = await generateInvoicePdf({
          invoiceNumber: String(state.variables.invoiceNumber || `INV-${Date.now()}`),
          variables: state.variables,
          tableData: state.tableData || {},
        });

        const blob = new Blob([pdfBuffer as any], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          pdfUrl,
          isGenerating: false,
        }));
      } else {
        // DOCX templates: generate PDF server-side using LibreOffice
        console.log('Generating PDF from DOCX template (server-side)');
        const result = await generatePDF({
          variables: state.variables,
          templateContent: state.template?.content || '',
          tableData: state.tableData,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || 'PDF generation failed');
        }

        // Decode base64 PDF and create blob
        const pdfBytes = Uint8Array.from(atob(result.data.pdf), (c) => c.charCodeAt(0));
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          pdfUrl,
          isGenerating: false,
        }));
      }

      setCurrentStep('preview');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'PDF generation failed';
      console.error('PDF generation error:', errorMsg);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMsg,
      }));
    }
  }

  function handleReset() {
    setState({
      template: null,
      variables: {},
      tableData: {},
      pdfUrl: null,
      isGenerating: false,
      error: null,
    });
    setCurrentStep('template');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between">
        {(['template', 'data', 'review', 'preview'] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : ['template', 'data', 'review', 'preview'].indexOf(currentStep) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < 3 && (
              <div
                className={`h-1 w-12 mx-2 ${
                  ['template', 'data', 'review', 'preview'].indexOf(currentStep) > index
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {state.error}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {currentStep === 'template' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Step 1: Upload Template</h2>
            <TemplateUploader
              onUploadSuccess={handleTemplateUpload}
              onUploadError={handleTemplateUploadError}
            />
          </>
        )}

        {currentStep === 'data' && state.template && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Step 2: Fill Invoice Data</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Variables</h3>
                <VariableForm
                  variables={state.template.variables}
                  onSubmit={handleVariablesSubmit}
                  isLoading={state.isGenerating}
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Import (Optional)</h3>
                <CSVImporter
                  templateVariables={state.template.variables.map((v) => v.name)}
                  templateTables={state.template.tables}
                  onImportSuccess={(data) => {
                    if (data.rows && data.rows.length > 0 && state.template) {
                      // Extract variables from first row (using template variable names)
                      const firstRow = data.rows[0];
                      const variables: Record<string, string | number> = {};
                      const variableNames = new Set(state.template.variables.map((v) => v.name));
                      
                      Object.entries(firstRow).forEach(([key, value]) => {
                        if (variableNames.has(key)) {
                          variables[key] = isNaN(Number(value)) ? value : Number(value);
                        }
                      });
                      
                      // Submit variables and move to step 3
                      handleVariablesSubmit(variables);
                      
                      // Extract table data from all rows (columns that aren't variables)
                      if (state.template.tables && state.template.tables.length > 0) {
                        const firstTable = state.template.tables[0];
                        const tableRowData: Record<string, string | number>[] = [];
                        
                        // Process all rows, extract columns for this table
                        data.rows.forEach((row) => {
                          const tableRow: Record<string, string | number> = {};
                          let hasTableData = false;
                          
                          Object.entries(row).forEach(([key, value]) => {
                            // Check if this column belongs to the table
                            const matchingColumn = firstTable.columns.find(
                              (col) => col.name.toLowerCase() === key.toLowerCase() ||
                                      col.id.toLowerCase() === key.toLowerCase()
                            );
                            
                            if (matchingColumn) {
                              tableRow[matchingColumn.id] = 
                                matchingColumn.type === 'currency' || matchingColumn.type === 'number'
                                  ? Number(value)
                                  : value;
                              hasTableData = true;
                            }
                          });
                          
                          if (hasTableData) {
                            tableRowData.push(tableRow);
                          }
                        });
                        
                        // Populate table data
                        if (tableRowData.length > 0) {
                          handleTableDataChange(firstTable.id, tableRowData);
                        }
                      }
                    }
                  }}
                  onImportError={handleTemplateUploadError}
                />
              </div>
            </div>
          </>
        )}

        {currentStep === 'review' && state.template && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Step 3: Review & Tables</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Entered Variables</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {Object.entries(state.variables).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {state.template.tables.map((table) => (
                <div key={table.id}>
                  <DynamicTableEditor
                    tableName={table.name}
                    columns={table.columns}
                    initialRows={state.tableData[table.id] || []}
                    onRowsChange={(rows) => handleTableDataChange(table.id, rows)}
                  />
                </div>
              ))}

              <button
                onClick={generatePdf}
                disabled={state.isGenerating}
                className="w-full rounded-md bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"
              >
                {state.isGenerating ? 'Generating PDF...' : 'Generate PDF'}
              </button>
            </div>
          </>
        )}

        {currentStep === 'preview' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Step 4: PDF Preview</h2>
            <PDFPreview pdfUrl={state.pdfUrl || undefined} isLoading={state.isGenerating} />
            <button
              onClick={handleReset}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              Create Another Invoice
            </button>
          </>
        )}
      </div>
    </div>
  );
}
