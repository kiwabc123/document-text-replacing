'use client';

/**
 * Component: VariableForm
 * Dynamic form for user input based on template variables
 */

import { useState } from 'react';
import type { TemplateVariable } from '@/types';

interface VariableFormProps {
  variables: TemplateVariable[];
  onSubmit: (data: Record<string, string | number>) => void;
  isLoading?: boolean;
}

export function VariableForm({ variables, onSubmit, isLoading = false }: VariableFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    variables.forEach((variable) => {
      const value = formData[variable.name];

      if (variable.required && (!value || value === '')) {
        newErrors[variable.name] = `${variable.label} is required`;
      }

      if (value && variable.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          newErrors[variable.name] = 'Invalid email format';
        }
      }

      if (value && variable.type === 'number') {
        if (isNaN(Number(value))) {
          newErrors[variable.name] = 'Must be a valid number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  }

  function getInputType(variable: TemplateVariable): string {
    switch (variable.type) {
      case 'email':
        return 'email';
      case 'number':
      case 'currency':
        return 'number';
      case 'date':
        return 'date';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variables.map((variable) => (
        <div key={variable.name}>
          <label htmlFor={variable.name} className="block text-sm font-medium text-gray-700">
            {variable.label}
            {variable.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={getInputType(variable)}
            id={variable.name}
            name={variable.name}
            placeholder={variable.placeholder}
            value={formData[variable.name] || ''}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
          {errors[variable.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[variable.name]}</p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Generating...' : 'Generate Invoice'}
      </button>
    </form>
  );
}
