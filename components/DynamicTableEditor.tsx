'use client';

/**
 * Component: DynamicTableEditor
 * Edit table rows dynamically
 */

import { useState } from 'react';
import type { TableRow, TableColumn } from '@/types';

interface DynamicTableEditorProps {
  tableName: string;
  columns: TableColumn[];
  initialRows?: TableRow[];
  onRowsChange: (rows: TableRow[]) => void;
}

export function DynamicTableEditor({
  tableName,
  columns,
  initialRows = [],
  onRowsChange,
}: DynamicTableEditorProps) {
  const [rows, setRows] = useState<TableRow[]>(initialRows);

  function addRow() {
    const newRow: TableRow = {};
    columns.forEach((col) => {
      newRow[col.id] = '';
    });
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    onRowsChange(updatedRows);
  }

  function deleteRow(index: number) {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    onRowsChange(updatedRows);
  }

  function updateCell(rowIndex: number, columnId: string, value: string | number) {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnId]: value,
    };
    setRows(updatedRows);
    onRowsChange(updatedRows);
  }

  function getInputType(column: TableColumn): string {
    switch (column.type) {
      case 'number':
      case 'currency':
        return 'number';
      case 'date':
        return 'date';
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{tableName}</h3>
        <button
          onClick={addRow}
          className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
        >
          Add Row
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No rows added yet. Click "Add Row" to start.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={`${rowIndex}_${col.id}`} className="border border-gray-300 px-4 py-2">
                      <input
                        type={getInputType(col)}
                        value={row[col.id] || ''}
                        onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
                        className="w-full rounded border border-gray-200 px-2 py-1 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
