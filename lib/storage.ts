/**
 * Storage utilities for managing templates and drafts
 */

export interface DraftInvoice {
  id: string;
  templateId: string;
  variables: Record<string, string | number>;
  tableData: Record<string, Record<string, string | number>[]>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save draft to localStorage
 */
export function saveDraft(draft: DraftInvoice): void {
  if (typeof window === 'undefined') return; // SSR check

  const drafts = loadAllDrafts();
  const index = drafts.findIndex((d) => d.id === draft.id);

  const updatedDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    drafts[index] = updatedDraft;
  } else {
    drafts.push(updatedDraft);
  }

  localStorage.setItem('invoiceDrafts', JSON.stringify(drafts));
}

/**
 * Load draft from localStorage
 */
export function loadDraft(id: string): DraftInvoice | null {
  if (typeof window === 'undefined') return null; // SSR check

  const drafts = loadAllDrafts();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Load all drafts from localStorage
 */
export function loadAllDrafts(): DraftInvoice[] {
  if (typeof window === 'undefined') return []; // SSR check

  const stored = localStorage.getItem('invoiceDrafts');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Delete draft from localStorage
 */
export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return; // SSR check

  const drafts = loadAllDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  localStorage.setItem('invoiceDrafts', JSON.stringify(filtered));
}

/**
 * Generate unique ID for draft
 */
export function generateDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
