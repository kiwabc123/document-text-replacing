/**
 * Template-related TypeScript types
 */

export type VariableType = 'text' | 'number' | 'date' | 'currency' | 'email' | 'phone';

export interface TemplateVariable {
  name: string;
  type: VariableType;
  label: string;
  required: boolean;
  placeholder?: string;
  pattern?: string; // regex pattern for validation
}

export interface TableColumn {
  id: string;
  name: string;
  type: VariableType;
  label: string;
  required: boolean;
}

export interface TableSchema {
  id: string;
  name: string;
  columns: TableColumn[];
}

export interface TemplateMetadata {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  variables: TemplateVariable[];
  tables: TableSchema[];
  content?: string; // base64 encoded PDF content
  templateHtml?: string; // original Word template HTML (for style preservation)
  templateJson?: JsonTemplate; // JSON template config
  templateType?: 'json' | 'docx'; // template type
}

export interface ParsedTemplate {
  variables: TemplateVariable[];
  tables: TableSchema[];
  content: string;
}

/**
 * JSON Template Format - New format with built-in styling
 */

export type JsonSectionType = 'heading' | 'subheading' | 'field' | 'field-group' | 'table' | 'spacer' | 'divider' | 'text';

export interface JsonTemplateSection {
  type: JsonSectionType;
  content?: string; // for heading, text
  label?: string; // for field
  variable?: string; // variable name for field
  fields?: string[]; // multiple fields for field-group
  tableId?: string; // for table sections
  style?: {
    fontSize?: number;
    fontWeight?: 'bold' | 'normal';
    color?: string;
    marginTop?: number;
    marginBottom?: number;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    padding?: number;
  };
}

export interface JsonTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  variables: TemplateVariable[];
  tables: TableSchema[];
  sections: JsonTemplateSection[];
  styling?: {
    primaryColor?: string;
    fontFamily?: string;
    fontSize?: number;
    headerHeight?: number;
    footerHeight?: number;
  };
}

export interface JsonTemplateMetadata extends Omit<TemplateMetadata, 'templateHtml' | 'content'> {
  templateType: 'json' | 'docx';
  jsonTemplate?: JsonTemplate;
}
