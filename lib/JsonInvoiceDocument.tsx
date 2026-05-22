/**
 * JSON Template PDF Document Renderer
 * Renders PDF from JSON template with full styling support
 */

import React, { Fragment } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { JsonTemplate, TableRow } from '@/types';

interface JsonInvoiceDocumentProps {
  template: JsonTemplate;
  variables: Record<string, string | number>;
  tableData?: Record<string, TableRow[]>;
}

// Create PDF styles dynamically based on template styling
function createStyles(template: JsonTemplate) {
  const globalStyle = template.styling || {};
  const fontFamily = globalStyle.fontFamily || 'Helvetica';
  const baseFontSize = globalStyle.fontSize || 11;

  return StyleSheet.create({
    page: {
      padding: 40,
      fontFamily,
      fontSize: baseFontSize,
      color: '#000',
    },
    heading: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 0,
    },
    subheading: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    fieldLabel: {
      fontSize: baseFontSize - 1,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 8,
    },
    fieldValue: {
      fontSize: baseFontSize,
      color: '#000',
      marginBottom: 8,
    },
    fieldGroup: {
      marginBottom: 15,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: '#ccc',
      marginTop: 15,
      marginBottom: 15,
    },
    spacer: {
      height: 10,
    },
    table: {
      marginTop: 15,
      marginBottom: 15,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottomWidth: 2,
      borderBottomColor: '#333',
      paddingBottom: 8,
      marginBottom: 8,
    },
    tableHeaderCell: {
      flex: 1,
      fontWeight: 'bold',
      fontSize: baseFontSize - 1,
      paddingRight: 8,
    },
    tableRow: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tableCell: {
      flex: 1,
      fontSize: baseFontSize - 1,
      paddingRight: 8,
    },
  });
}

/**
 * Render a single section based on JSON template section config
 */
function renderSection(section: any, template: JsonTemplate, variables: Record<string, string | number>, tableData: Record<string, TableRow[]>, styles: any) {
  const { type, content, label, variable, fields, tableId, style } = section;

  const sectionStyle = { ...style };

  switch (type) {
    case 'heading':
      return (
        <View style={[styles.heading, sectionStyle]}>
          <Text>{content}</Text>
        </View>
      );

    case 'subheading':
      return (
        <View style={[styles.subheading, sectionStyle]}>
          <Text>{content}</Text>
        </View>
      );

    case 'text':
      return (
        <View style={sectionStyle}>
          <Text>{content}</Text>
        </View>
      );

    case 'field':
      return (
        <View style={[styles.fieldGroup, sectionStyle]}>
          <Text style={styles.fieldLabel}>{label}:</Text>
          <Text style={styles.fieldValue}>{variables[variable || ''] || ''}</Text>
        </View>
      );

    case 'field-group':
      return (
        <View style={[styles.fieldGroup, sectionStyle]}>
          {fields?.map((fieldName: string) => {
            const variable = template.variables.find((v) => v.name === fieldName);
            if (!variable) return null;
            return (
              <View key={fieldName}>
                <Text style={styles.fieldLabel}>{variable.label}:</Text>
                <Text style={styles.fieldValue}>{variables[fieldName] || ''}</Text>
              </View>
            );
          })}
        </View>
      );

    case 'divider':
      return <View style={[styles.divider, sectionStyle]} />;

    case 'spacer':
      return <View style={[styles.spacer, sectionStyle]} />;

    case 'table':
      const rows = tableData?.[tableId || ''] || [];
      if (rows.length === 0) {
        return <View />;
      }

      const headers = Object.keys(rows[0]);
      return (
        <View style={[styles.table, sectionStyle]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {headers.map((header) => (
              <Text key={header} style={styles.tableHeaderCell}>
                {formatLabel(header)}
              </Text>
            ))}
          </View>

          {/* Table Rows */}
          {rows.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              {headers.map((header) => (
                <Text key={`${idx}-${header}`} style={styles.tableCell}>
                  {row[header]}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}

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
 * JSON Invoice Document Component
 */
const JsonInvoiceDocument: React.FC<JsonInvoiceDocumentProps> = ({ template, variables, tableData = {} }) => {
  const styles = createStyles(template);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {template.sections.map((section, idx) => (
          <Fragment key={idx}>
            {renderSection(section, template, variables, tableData, styles)}
          </Fragment>
        ))}

        {/* Footer */}
        <View style={{ marginTop: 40, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#ddd' }}>
          <Text style={{ fontSize: 9, color: '#666', textAlign: 'center' }}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default JsonInvoiceDocument;
