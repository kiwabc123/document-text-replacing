/**
 * Central export for all TypeScript types
 */

export * from './template';
export * from './invoice';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TableRow {
  [key: string]: string | number;
}
