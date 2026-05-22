'use client';

/**
 * Suppress react-pdf optional styling warnings
 * These warnings appear when TextLayer and AnnotationLayer CSS is not found,
 * but they are optional features that don't affect PDF display
 */

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const message = args[0]?.toString?.() || '';
    
    // Suppress react-pdf TextLayer and AnnotationLayer warnings
    if (
      message.includes('TextLayer styles not found') ||
      message.includes('AnnotationLayer styles not found')
    ) {
      return; // Suppress this warning
    }
    
    // Call original console.error for all other messages
    originalError(...args);
  };
}
