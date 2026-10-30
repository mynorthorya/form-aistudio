/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Form, FormField, FormSubmission, Contact, DatabaseState } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Forms
  async getForms(): Promise<Form[]> {
    const res = await fetch(`${API_BASE}/forms`);
    if (!res.ok) throw new Error('Falha ao carregar formulários');
    return res.json();
  },

  async getForm(id: string): Promise<Form> {
    const res = await fetch(`${API_BASE}/forms/${id}`);
    if (!res.ok) throw new Error('Formulário não encontrado');
    return res.json();
  },

  async createForm(form: Partial<Form>): Promise<Form> {
    const res = await fetch(`${API_BASE}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Falha ao criar formulário');
    return res.json();
  },

  async generateFormWithAI(text: string, title?: string): Promise<Form> {
    const res = await fetch(`${API_BASE}/ai/generate-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title }),
    });
    if (!res.ok) throw new Error('Falha ao gerar formulário com IA');
    return res.json();
  },

  async parseFieldsWithAI(text: string): Promise<FormField[]> {
    const res = await fetch(`${API_BASE}/ai/parse-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Falha ao analisar campos com IA');
    const data = await res.json();
    return data.fields;
  },

  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    const res = await fetch(`${API_BASE}/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Falha ao atualizar formulário');
    return res.json();
  },

  async publishForm(id: string): Promise<Form> {
    const res = await fetch(`${API_BASE}/forms/${id}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Falha ao publicar formulário');
    return res.json();
  },

  async duplicateForm(id: string): Promise<Form> {
    const res = await fetch(`${API_BASE}/forms/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Falha ao duplicar formulário');
    return res.json();
  },

  async deleteForm(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/forms/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao excluir formulário');
  },

  // Public Form
  async getPublicForm(slug: string): Promise<Form> {
    const res = await fetch(`${API_BASE}/public/forms/${slug}`);
    if (!res.ok) throw new Error('Formulário não encontrado ou inativo');
    return res.json();
  },

  async submitPublicForm(
    slug: string,
    data: {
      answers: Record<string, any>;
      startedAt: string;
      completedAt: string;
      durationSeconds: number;
      utmSource?: string;
    }
  ): Promise<{ success: boolean; submission: FormSubmission }> {
    const res = await fetch(`${API_BASE}/public/forms/${slug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao enviar respostas');
    return res.json();
  },

  async recordPublicEvent(slug: string, type: string, fieldId?: string, sessionId?: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/public/forms/${slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fieldId, sessionId }),
      });
    } catch {
      // Non-blocking tracking
    }
  },

  // Submissions
  async getSubmissions(formId?: string): Promise<FormSubmission[]> {
    const url = formId ? `${API_BASE}/submissions?formId=${encodeURIComponent(formId)}` : `${API_BASE}/submissions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar submissões');
    return res.json();
  },

  async deleteSubmission(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/submissions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir submissão');
  },

  // Contacts / CRM
  async getContacts(): Promise<Contact[]> {
    const res = await fetch(`${API_BASE}/contacts`);
    if (!res.ok) throw new Error('Falha ao carregar contatos');
    return res.json();
  },

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Falha ao atualizar contato');
    return res.json();
  },

  async deleteContact(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir contato');
  },

  // Templates
  async getTemplates(): Promise<Form[]> {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error('Falha ao carregar templates');
    return res.json();
  },

  // Stats
  async getStats(): Promise<{
    totalForms: number;
    publishedForms: number;
    totalSubmissions: number;
    totalContacts: number;
    totalViews: number;
    totalStarts: number;
    conversionRate: number;
    recentSubmissions: FormSubmission[];
  }> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Falha ao carregar estatísticas');
    return res.json();
  },

  // Export
  async exportDatabase(): Promise<DatabaseState> {
    const res = await fetch(`${API_BASE}/export`);
    if (!res.ok) throw new Error('Falha ao exportar dados');
    return res.json();
  },
};
