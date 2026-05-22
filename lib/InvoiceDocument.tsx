/**
 * React PDF Invoice Generator
 * Creates professional invoice PDFs using React PDF syntax
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TableRow as TableRowData } from '@/types';

// Create PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    fontSize: 11,
    width: '70%',
  },
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    fontSize: 10,
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    fontSize: 10,
    color: '#666',
  },
});

interface InvoiceProps {
  invoiceNumber: string;
  variables: Record<string, string | number>;
  tableData?: Record<string, TableRowData[]>;
}

/**
 * React PDF Invoice Component
 */
const InvoiceDocument: React.FC<InvoiceProps> = ({ invoiceNumber, variables, tableData = {} }) => {
  const tables = Object.entries(tableData);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>Invoice #{invoiceNumber}</Text>
        </View>

        {/* Variables Section */}
        <View style={styles.section}>
          {Object.entries(variables).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{formatLabel(key)}:</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Tables Section */}
        {tables.length > 0 && tables.map(([tableName, rows]) => (
          <View key={tableName} style={styles.section}>
            <Text style={styles.sectionTitle}>{formatLabel(tableName)}</Text>
            {renderTable(rows)}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Format variable name to human-readable label
 */
function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Render table from array of rows
 */
function renderTable(rows: TableRowData[]) {
  if (!rows || rows.length === 0) {
    return <Text>No data</Text>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <View>
      {/* Table Header */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
        {headers.map((header) => (
          <View key={header} style={{ flex: 1 }}>
            <Text style={styles.tableHeader}>{formatLabel(header)}</Text>
          </View>
        ))}
      </View>
      
      {/* Table Rows */}
      {rows.map((row, idx) => (
        <View key={idx} style={{ flexDirection: 'row' }}>
          {headers.map((header) => (
            <View key={`${idx}-${header}`} style={{ flex: 1 }}>
              <Text style={styles.tableCell}>{row[header]}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default InvoiceDocument;
