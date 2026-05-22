#!/usr/bin/env node
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';

// Create a sample invoice template with variables
const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: 'INVOICE',
          bold: true,
          size: 32,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          text: 'Invoice Number: {{invoiceNumber}}',
          size: 24,
        }),
        new Paragraph({
          text: 'Date: {{invoiceDate}}',
          size: 24,
        }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          text: 'Bill To:',
          bold: true,
          size: 24,
        }),
        new Paragraph({
          text: 'Client Name: {{clientName}}',
          size: 22,
        }),
        new Paragraph({
          text: 'Email: {{clientEmail}}',
          size: 22,
        }),
        new Paragraph({
          text: 'Phone: {{clientPhone}}',
          size: 22,
        }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          text: 'Items:',
          bold: true,
          size: 24,
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Description')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph('Quantity')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph('Price')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Web Development Services')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph('1')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph('${{servicePrice}}')],
                  borders: {
                    top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    left: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                    right: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          text: 'Total Amount: ${{totalAmount}}',
          bold: true,
          size: 26,
        }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          text: 'Payment Terms: {{paymentTerms}}',
          size: 22,
        }),
        new Paragraph({
          text: 'Notes: {{notes}}',
          size: 22,
        }),
      ],
    },
  ],
});

// Save the document
Packer.toBuffer(doc).then(buffer => {
  const templatePath = path.join(process.cwd(), 'sample-template.docx');
  fs.writeFileSync(templatePath, buffer);
  console.log(`✓ Sample template created: ${templatePath}`);
  process.exit(0);
}).catch(error => {
  console.error('Error creating template:', error);
  process.exit(1);
});
