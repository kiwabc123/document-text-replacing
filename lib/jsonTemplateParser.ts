/**
 * JSON Template Parser
 * Parses and validates JSON template format
 */

import type { JsonTemplate, TemplateVariable, TableSchema } from '@/types';

/**
 * Parse JSON template from JSON string
 */
export function parseJsonTemplate(jsonString: string): JsonTemplate {
  try {
    const template = JSON.parse(jsonString) as JsonTemplate;
    
    // Validate template structure
    if (!template.name || !template.id || !template.variables || !template.sections) {
      throw new Error('Invalid template structure: missing required fields');
    }
    
    return template;
  } catch (error) {
    throw new Error(`Failed to parse JSON template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a sample JSON template for reference
 */
export function createSampleJsonTemplate(): JsonTemplate {
  return {
    id: 'sample-invoice-' + Date.now(),
    name: 'Simple Invoice Template',
    description: 'A clean, professional invoice template',
    version: '1.0',
    createdAt: new Date().toISOString(),
    variables: [
      {
        name: 'invoiceNumber',
        type: 'text',
        label: 'Invoice Number',
        required: true,
        placeholder: 'INV-2024-001',
      },
      {
        name: 'invoiceDate',
        type: 'date',
        label: 'Invoice Date',
        required: true,
      },
      {
        name: 'clientName',
        type: 'text',
        label: 'Client Name',
        required: true,
      },
      {
        name: 'clientEmail',
        type: 'email',
        label: 'Client Email',
        required: true,
      },
      {
        name: 'clientPhone',
        type: 'phone',
        label: 'Client Phone',
        required: true,
      },
      {
        name: 'servicePrice',
        type: 'currency',
        label: 'Service Price',
        required: true,
      },
      {
        name: 'totalAmount',
        type: 'currency',
        label: 'Total Amount',
        required: true,
      },
      {
        name: 'paymentTerms',
        type: 'text',
        label: 'Payment Terms',
        required: true,
      },
      {
        name: 'notes',
        type: 'text',
        label: 'Notes',
        required: false,
      },
    ],
    tables: [
      {
        id: 'items',
        name: 'Items',
        columns: [
          {
            id: 'description',
            name: 'description',
            label: 'Description',
            type: 'text',
            required: true,
          },
          {
            id: 'quantity',
            name: 'quantity',
            label: 'Qty',
            type: 'number',
            required: true,
          },
          {
            id: 'price',
            name: 'price',
            label: 'Price',
            type: 'currency',
            required: true,
          },
        ],
      },
    ],
    sections: [
      {
        type: 'heading',
        content: 'INVOICE',
        style: {
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'left',
        },
      },
      {
        type: 'field',
        label: 'Invoice #',
        variable: 'invoiceNumber',
        style: {
          marginBottom: 10,
        },
      },
      {
        type: 'field',
        label: 'Date',
        variable: 'invoiceDate',
        style: {
          marginBottom: 20,
        },
      },
      {
        type: 'subheading',
        content: 'Bill To',
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          marginTop: 20,
          marginBottom: 10,
        },
      },
      {
        type: 'field-group',
        fields: ['clientName', 'clientEmail', 'clientPhone'],
        style: {
          marginBottom: 20,
        },
      },
      {
        type: 'table',
        tableId: 'items',
        style: {
          marginTop: 20,
          marginBottom: 20,
        },
      },
      {
        type: 'divider',
        style: {
          marginTop: 15,
          marginBottom: 15,
        },
      },
      {
        type: 'field-group',
        fields: ['totalAmount', 'paymentTerms'],
        style: {
          marginBottom: 20,
        },
      },
      {
        type: 'field',
        label: 'Notes',
        variable: 'notes',
      },
    ],
    styling: {
      primaryColor: '#000000',
      fontFamily: 'Helvetica',
      fontSize: 11,
    },
  };
}

/**
 * Export template as JSON string (for download)
 */
export function exportTemplateAsJson(template: JsonTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Validate that all required variables are defined in sections
 */
export function validateTemplateVariables(template: JsonTemplate): string[] {
  const errors: string[] = [];
  const definedVariables = new Set(template.variables.map((v) => v.name));

  // Check sections for undefined variables
  template.sections.forEach((section, idx) => {
    if (section.variable && !definedVariables.has(section.variable)) {
      errors.push(`Section ${idx}: Variable "${section.variable}" not defined in variables array`);
    }
    if (section.fields) {
      section.fields.forEach((field) => {
        if (!definedVariables.has(field)) {
          errors.push(`Section ${idx}: Variable "${field}" not defined in variables array`);
        }
      });
    }
  });

  // Check required variables are used somewhere
  template.variables.forEach((variable) => {
    if (variable.required) {
      const isUsed = template.sections.some(
        (s) => s.variable === variable.name || s.fields?.includes(variable.name)
      );
      if (!isUsed) {
        console.warn(`Variable "${variable.name}" is marked required but not used in any section`);
      }
    }
  });

  return errors;
}
