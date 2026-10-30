/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseState, Form, FormSubmission, Contact, AnalyticsEvent } from '../types/index.ts';
import { getInitialDatabaseState } from './seed.ts';
import { extractContactFromSubmission, findMatchingContact } from '../lib/contact-engine.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'northorya-db.json');
const BACKUP_FILE = path.join(DATA_DIR, 'northorya-db.backup.json');

class StorageManager {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.state = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[StorageManager] Error reading DB file, trying backup:', err);
      try {
        if (fs.existsSync(BACKUP_FILE)) {
          const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
          return JSON.parse(raw);
        }
      } catch (backupErr) {
        console.error('[StorageManager] Error reading backup file:', backupErr);
      }
    }

    const initial = getInitialDatabaseState();
    this.persist(initial);
    return initial;
  }

  private persist(state: DatabaseState) {
    try {
      const serialized = JSON.stringify(state, null, 2);
      // Atomic write using temp file
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, serialized, 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
      // Write backup
      fs.writeFileSync(BACKUP_FILE, serialized, 'utf-8');
    } catch (err) {
      console.error('[StorageManager] Error persisting DB state:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getForms(): Form[] {
    return this.state.forms;
  }

  public getFormById(id: string): Form | undefined {
    return this.state.forms.find((f) => f.id === id);
  }

  public getFormBySlug(slug: string): Form | undefined {
    return this.state.forms.find((f) => f.slug === slug);
  }

  public createForm(form: Partial<Form>): Form {
    const id = `form_${Date.now()}`;
    const slug = form.slug || `form-${Math.random().toString(36).substring(2, 7)}`;
    const newForm: Form = {
      id,
      slug,
      title: form.title || 'Novo Formulário Northorya',
      description: form.description || 'Preencha este formulário para prosseguir.',
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { views: 0, starts: 0, completions: 0 },
      theme: form.theme || {
        id: 'theme_default',
        name: 'Northorya Dark',
        primaryColor: '#D97706',
        backgroundColor: '#09090b',
        textColor: '#f4f4f5',
        cardColor: '#18181b',
        borderRadius: 'rounded-xl',
        fontFamily: 'Plus Jakarta Sans',
      },
      settings: form.settings || {
        mode: 'conversational',
        showProgressBar: true,
        allowKeyboardNavigation: true,
      },
      rules: form.rules || [],
      fields: form.fields || [
        {
          id: `f_welcome_${Date.now()}`,
          type: 'welcome_screen',
          title: form.title || 'Bem-vindo ao Formulário',
          description: 'Clique abaixo para iniciar seu preenchimento.',
          validation: {},
          properties: { buttonText: 'Iniciar' },
        },
        {
          id: `f_nome_${Date.now()}`,
          type: 'full_name',
          title: 'Qual o seu nome completo?',
          validation: { required: true },
        },
        {
          id: `f_email_${Date.now()}`,
          type: 'email',
          title: 'Qual o seu e-mail?',
          validation: { required: true },
        },
        {
          id: `f_thanks_${Date.now()}`,
          type: 'thank_you_screen',
          title: 'Obrigado!',
          description: 'Suas respostas foram registradas com sucesso.',
          validation: {},
        },
      ],
    };

    this.state.forms.unshift(newForm);
    this.persist(this.state);
    return newForm;
  }

  public updateForm(id: string, updates: Partial<Form>): Form | undefined {
    const index = this.state.forms.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    const existing = this.state.forms[index];
    const updated: Form = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.forms[index] = updated;
    this.persist(this.state);
    return updated;
  }

  public publishForm(id: string): Form | undefined {
    const index = this.state.forms.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    const existing = this.state.forms[index];
    const newVersion = existing.version + 1;
    const published: Form = {
      ...existing,
      status: 'published',
      version: newVersion,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.forms[index] = published;
    this.persist(this.state);
    return published;
  }

  public duplicateForm(id: string): Form | undefined {
    const existing = this.getFormById(id);
    if (!existing) return undefined;

    const copyId = `form_${Date.now()}`;
    const copySlug = `${existing.slug}-copia-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: Form = {
      ...JSON.parse(JSON.stringify(existing)),
      id: copyId,
      slug: copySlug,
      title: `${existing.title} (Cópia)`,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      stats: { views: 0, starts: 0, completions: 0 },
    };

    this.state.forms.unshift(duplicated);
    this.persist(this.state);
    return duplicated;
  }

  public deleteForm(id: string): boolean {
    const index = this.state.forms.findIndex((f) => f.id === id);
    if (index === -1) return false;

    this.state.forms.splice(index, 1);
    this.persist(this.state);
    return true;
  }

  public recordEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    this.state.events.push(fullEvent);

    // Update form counters
    const form = this.state.forms.find((f) => f.id === event.formId || f.slug === event.formSlug);
    if (form) {
      if (event.type === 'view') form.stats.views++;
      else if (event.type === 'start') form.stats.starts++;
      else if (event.type === 'complete') form.stats.completions++;
    }

    this.persist(this.state);
  }

  public createSubmission(submissionData: {
    formSlug: string;
    answers: Record<string, any>;
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    utmSource?: string;
  }): FormSubmission | null {
    const form = this.getFormBySlug(submissionData.formSlug);
    if (!form) return null;

    // Structured answers mapping
    const structuredAnswers = form.fields
      .filter((f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen')
      .map((f) => ({
        fieldId: f.id,
        fieldTitle: f.title,
        fieldType: f.type,
        value: submissionData.answers[f.id] ?? null,
      }));

    // Extract Contact
    const extracted = extractContactFromSubmission(form.fields, submissionData.answers);

    // Deduplication check
    let contact = findMatchingContact(this.state.contacts, extracted);

    const now = new Date().toISOString();

    if (!contact) {
      contact = {
        id: `contact_${Date.now()}`,
        name: extracted.name,
        email: extracted.email,
        phone: extracted.phone,
        whatsapp: extracted.whatsapp,
        instagram: extracted.instagram,
        status: 'novo_lead',
        tags: [form.title],
        source: form.title,
        createdAt: now,
        updatedAt: now,
        consentGiven: extracted.consentGiven,
        consentDate: extracted.consentGiven ? now : undefined,
        submissionsCount: 1,
        activities: [
          {
            id: `act_${Date.now()}`,
            type: 'form_submitted',
            title: `Respondeu ${form.title}`,
            description: `Duração: ${Math.round(submissionData.durationSeconds)} segundos.`,
            createdAt: now,
          },
        ],
      };
      this.state.contacts.unshift(contact);
    } else {
      contact.submissionsCount++;
      contact.updatedAt = now;
      if (!contact.tags.includes(form.title)) {
        contact.tags.push(form.title);
      }
      if (extracted.instagram && !contact.instagram) {
        contact.instagram = extracted.instagram;
      }
      contact.activities.unshift({
        id: `act_${Date.now()}`,
        type: 'form_submitted',
        title: `Nova submissão: ${form.title}`,
        description: `Duração: ${Math.round(submissionData.durationSeconds)} segundos.`,
        createdAt: now,
      });
    }

    const subId = `sub_${Date.now()}`;
    contact.latestSubmissionId = subId;

    const submission: FormSubmission = {
      id: subId,
      formId: form.id,
      formVersion: form.version,
      formSlug: form.slug,
      formTitle: form.title,
      contactId: contact.id,
      contactName: contact.name,
      contactEmail: contact.email,
      contactPhone: contact.phone,
      answers: submissionData.answers,
      structuredAnswers,
      startedAt: submissionData.startedAt,
      completedAt: submissionData.completedAt,
      durationSeconds: submissionData.durationSeconds,
      utmSource: submissionData.utmSource || 'direct',
    };

    this.state.submissions.unshift(submission);

    // Update stats
    form.stats.completions++;
    this.recordEvent({
      formId: form.id,
      formSlug: form.slug,
      type: 'complete',
      sessionId: `sess_${Date.now()}`,
    });

    this.persist(this.state);
    return submission;
  }

  public getSubmissions(formId?: string): FormSubmission[] {
    if (formId) {
      return this.state.submissions.filter((s) => s.formId === formId);
    }
    return this.state.submissions;
  }

  public deleteSubmission(id: string): boolean {
    const idx = this.state.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.state.submissions.splice(idx, 1);
    this.persist(this.state);
    return true;
  }

  public getContacts(): Contact[] {
    return this.state.contacts;
  }

  public getContactById(id: string): Contact | undefined {
    return this.state.contacts.find((c) => c.id === id);
  }

  public updateContact(id: string, updates: Partial<Contact>): Contact | undefined {
    const idx = this.state.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const existing = this.state.contacts[idx];
    const updated: Contact = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status && updates.status !== existing.status) {
      updated.activities = updated.activities || [];
      updated.activities.unshift({
        id: `act_${Date.now()}`,
        type: 'status_changed',
        title: `Status comercial alterado`,
        description: `De "${existing.status}" para "${updates.status}".`,
        createdAt: new Date().toISOString(),
      });
    }

    this.state.contacts[idx] = updated;
    this.persist(this.state);
    return updated;
  }

  public deleteContact(id: string): boolean {
    const idx = this.state.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.state.contacts.splice(idx, 1);
    this.persist(this.state);
    return true;
  }

  public getTemplates(): Form[] {
    return this.state.templates;
  }
}

export const storage = new StorageManager();
