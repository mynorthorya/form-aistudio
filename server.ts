/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { storage } from './src/server/storage.ts';
import { generateFormFromText } from './src/server/ai-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', platform: 'Northorya Forms Studio', timestamp: new Date().toISOString() });
});

// Forms
app.get('/api/forms', (_req: Request, res: Response) => {
  const forms = storage.getForms();
  res.json(forms);
});

app.get('/api/forms/:id', (req: Request, res: Response) => {
  const form = storage.getFormById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Formulário não encontrado' });
  }
  res.json(form);
});

app.post('/api/forms', (req: Request, res: Response) => {
  const newForm = storage.createForm(req.body);
  res.status(201).json(newForm);
});

// AI Automatic Form Generation (Gemini 3.8 Flash)
app.post('/api/ai/generate-form', async (req: Request, res: Response) => {
  const { text, title } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto não fornecido para geração' });
  }

  try {
    const generated = await generateFormFromText(text, title);
    const newForm = storage.createForm(generated);
    res.status(201).json(newForm);
  } catch (err: any) {
    console.error('[API] Error in generate-form:', err);
    res.status(500).json({ error: 'Falha ao gerar formulário com IA' });
  }
});

// AI Parse Fields for existing forms
app.post('/api/ai/parse-fields', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto não fornecido para análise' });
  }

  try {
    const generated = await generateFormFromText(text);
    // Keep only input question fields (excluding standalone welcome/thank you screens if appending)
    const questionFields = (generated.fields || []).filter(
      (f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen'
    );
    res.json({ fields: questionFields.length > 0 ? questionFields : generated.fields });
  } catch (err: any) {
    console.error('[API] Error in parse-fields:', err);
    res.status(500).json({ error: 'Falha ao analisar campos com IA' });
  }
});

app.put('/api/forms/:id', (req: Request, res: Response) => {
  const updated = storage.updateForm(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Formulário não encontrado' });
  }
  res.json(updated);
});

app.post('/api/forms/:id/publish', (req: Request, res: Response) => {
  const published = storage.publishForm(req.params.id);
  if (!published) {
    return res.status(404).json({ error: 'Formulário não encontrado' });
  }
  res.json(published);
});

app.post('/api/forms/:id/duplicate', (req: Request, res: Response) => {
  const duplicated = storage.duplicateForm(req.params.id);
  if (!duplicated) {
    return res.status(404).json({ error: 'Formulário não encontrado' });
  }
  res.status(201).json(duplicated);
});

app.delete('/api/forms/:id', (req: Request, res: Response) => {
  const success = storage.deleteForm(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Formulário não encontrado' });
  }
  res.json({ success: true });
});

// Public Forms
app.get('/api/public/forms/:slug', (req: Request, res: Response) => {
  const form = storage.getFormBySlug(req.params.slug);
  if (!form) {
    return res.status(404).json({ error: 'Formulário público não encontrado ou desativado' });
  }
  storage.recordEvent({
    formId: form.id,
    formSlug: form.slug,
    type: 'view',
    sessionId: `sess_${Date.now()}`,
  });
  res.json(form);
});

app.post('/api/public/forms/:slug/event', (req: Request, res: Response) => {
  const { type, fieldId, sessionId } = req.body;
  const form = storage.getFormBySlug(req.params.slug);
  if (form) {
    storage.recordEvent({
      formId: form.id,
      formSlug: form.slug,
      type: type || 'start',
      fieldId,
      sessionId: sessionId || `sess_${Date.now()}`,
    });
  }
  res.json({ success: true });
});

app.post('/api/public/forms/:slug/submit', (req: Request, res: Response) => {
  const { answers, startedAt, completedAt, durationSeconds, utmSource } = req.body;
  const submission = storage.createSubmission({
    formSlug: req.params.slug,
    answers,
    startedAt: startedAt || new Date().toISOString(),
    completedAt: completedAt || new Date().toISOString(),
    durationSeconds: Number(durationSeconds) || 60,
    utmSource,
  });

  if (!submission) {
    return res.status(400).json({ error: 'Falha ao registrar submissão' });
  }

  res.status(201).json({ success: true, submission });
});

// Submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  const formId = req.query.formId as string | undefined;
  const submissions = storage.getSubmissions(formId);
  res.json(submissions);
});

app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const success = storage.deleteSubmission(req.params.id);
  res.json({ success });
});

// Contacts / CRM
app.get('/api/contacts', (_req: Request, res: Response) => {
  const contacts = storage.getContacts();
  res.json(contacts);
});

app.get('/api/contacts/:id', (req: Request, res: Response) => {
  const contact = storage.getContactById(req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contato não encontrado' });
  }
  res.json(contact);
});

app.patch('/api/contacts/:id', (req: Request, res: Response) => {
  const updated = storage.updateContact(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Contato não encontrado' });
  }
  res.json(updated);
});

app.delete('/api/contacts/:id', (req: Request, res: Response) => {
  const success = storage.deleteContact(req.params.id);
  res.json({ success });
});

// Templates
app.get('/api/templates', (_req: Request, res: Response) => {
  const templates = storage.getTemplates();
  res.json(templates);
});

// Global Export
app.get('/api/export', (_req: Request, res: Response) => {
  const state = storage.getState();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="northorya-forms-backup.json"');
  res.json(state);
});

// Export Full Source Code Archive (.tar.gz)
app.get('/api/export-project', (_req: Request, res: Response) => {
  const archivePath = path.resolve(__dirname, 'public', 'northorya-forms-studio.tar.gz');
  if (fs.existsSync(archivePath)) {
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="northorya-forms-studio.tar.gz"');
    return res.sendFile(archivePath);
  }
  res.status(404).json({ error: 'Arquivo do projeto não encontrado' });
});

// Stats overview
app.get('/api/stats', (_req: Request, res: Response) => {
  const state = storage.getState();
  const totalForms = state.forms.length;
  const publishedForms = state.forms.filter((f) => f.status === 'published').length;
  const totalSubmissions = state.submissions.length;
  const totalContacts = state.contacts.length;
  const totalViews = state.forms.reduce((acc, f) => acc + (f.stats?.views || 0), 0);
  const totalStarts = state.forms.reduce((acc, f) => acc + (f.stats?.starts || 0), 0);
  const conversionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  res.json({
    totalForms,
    publishedForms,
    totalSubmissions,
    totalContacts,
    totalViews,
    totalStarts,
    conversionRate,
    recentSubmissions: state.submissions.slice(0, 5),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Northorya Forms Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
