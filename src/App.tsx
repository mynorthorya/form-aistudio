/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { FormsListView } from './components/forms/FormsListView.tsx';
import { FormBuilderView } from './components/builder/FormBuilderView.tsx';
import { FormResultsView } from './components/results/FormResultsView.tsx';
import { ContactsView } from './components/contacts/ContactsView.tsx';
import { AnalyticsView } from './components/analytics/AnalyticsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { PublicFormRenderer } from './components/renderer/PublicFormRenderer.tsx';
import { AiFormGeneratorModal } from './components/builder/AiFormGeneratorModal.tsx';
import { ProfileBrandingModal } from './components/branding/ProfileBrandingModal.tsx';
import { api } from './services/api.ts';
import { Form, FormSubmission, Contact, LeadStatus } from './types/index.ts';
import { useBranding } from './contexts/BrandingContext.tsx';

export default function App() {
  const { branding } = useBranding();
  const isLight = branding.themeStyle === 'light';
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Form[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    totalSubmissions: 0,
    totalContacts: 0,
    totalViews: 0,
    totalStarts: 0,
    conversionRate: 0,
    recentSubmissions: [] as FormSubmission[],
  });

  // Active form view modes
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [resultsFormId, setResultsFormId] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Check URL query parameters on mount for public form access (e.g. ?form=auditoria-de-vida)
  const [publicSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('form');
    }
    return null;
  });

  const [publicForm, setPublicForm] = useState<Form | null>(null);

  // Load all data
  const loadData = async () => {
    try {
      const [formsData, subsData, contactsData, templatesData, statsData] = await Promise.all([
        api.getForms(),
        api.getSubmissions(),
        api.getContacts(),
        api.getTemplates(),
        api.getStats(),
      ]);
      setForms(formsData);
      setSubmissions(subsData);
      setContacts(contactsData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load public form if URL contains ?form=<slug>
  useEffect(() => {
    if (publicSlug) {
      api
        .getPublicForm(publicSlug)
        .then((f) => setPublicForm(f))
        .catch((err) => console.error('Error fetching public form:', err));
    }
  }, [publicSlug]);

  // Handler: Create new form
  const handleCreateNewForm = async () => {
    try {
      const created = await api.createForm({
        title: 'Nova Auditoria Comportamental',
        description: 'Questionário reflexivo e diagnóstico de governança pessoal.',
      });
      setForms((prev) => [created, ...prev]);
      setEditingFormId(created.id);
    } catch (err) {
      console.error(err);
      alert('Erro ao criar formulário');
    }
  };

  // Handler: Create form with AI
  const handleCreateWithAI = async (text: string, title?: string) => {
    try {
      const created = await api.generateFormWithAI(text, title);
      setForms((prev) => [created, ...prev]);
      setEditingFormId(created.id);
    } catch (err) {
      console.error('Error generating form with AI:', err);
      throw err;
    }
  };

  // Handler: Use template
  const handleUseTemplate = async (template: Form) => {
    try {
      const created = await api.createForm({
        title: template.title.replace('Template: ', ''),
        description: template.description,
        fields: template.fields,
        rules: template.rules,
        theme: template.theme,
        settings: template.settings,
      });
      setForms((prev) => [created, ...prev]);
      setEditingFormId(created.id);
    } catch (err) {
      console.error(err);
      alert('Erro ao clonar template');
    }
  };

  // Handler: Duplicate
  const handleDuplicateForm = async (formId: string) => {
    try {
      const duplicated = await api.duplicateForm(formId);
      setForms((prev) => [duplicated, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Erro ao duplicar formulário');
    }
  };

  // Handler: Delete form
  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Deseja realmente excluir este formulário?')) return;
    try {
      await api.deleteForm(formId);
      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir formulário');
    }
  };

  // Handler: Save form changes
  const handleSaveForm = async (updates: Partial<Form>) => {
    if (!editingFormId) return;
    try {
      const updated = await api.updateForm(editingFormId, updates);
      setForms((prev) => prev.map((f) => (f.id === editingFormId ? updated : f)));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Publish form
  const handlePublishForm = async (formId: string): Promise<Form> => {
    const published = await api.publishForm(formId);
    setForms((prev) => prev.map((f) => (f.id === formId ? published : f)));
    return published;
  };

  // Handler: Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Deseja excluir esta submissão permanentemente?')) return;
    try {
      await api.deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Update contact status
  const handleUpdateContactStatus = async (contactId: string, status: LeadStatus) => {
    try {
      const updated = await api.updateContact(contactId, { status });
      setContacts((prev) => prev.map((c) => (c.id === contactId ? updated : c)));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Update contact notes
  const handleUpdateContactNotes = async (contactId: string, notes: string) => {
    try {
      const updated = await api.updateContact(contactId, { notes });
      setContacts((prev) => prev.map((c) => (c.id === contactId ? updated : c)));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Delete contact
  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.deleteContact(contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Open public respondent form in tab/preview
  const handleOpenPublicForm = (slug: string) => {
    window.open(`/?form=${slug}`, '_blank');
  };

  // 1. PUBLIC RESPONDENT VIEW (When accessed via ?form=<slug>)
  if (publicSlug && publicForm) {
    return (
      <PublicFormRenderer
        form={publicForm}
        onSubmitSuccess={() => {
          loadData();
        }}
      />
    );
  }

  // 2. BUILDER PREVIEW OVERLAY
  if (previewForm) {
    return (
      <PublicFormRenderer
        form={previewForm}
        isPreview={true}
        onClosePreview={() => setPreviewForm(null)}
      />
    );
  }

  // 3. VISUAL FORM BUILDER FULLSCREEN
  if (editingFormId) {
    const formToEdit = forms.find((f) => f.id === editingFormId);
    if (formToEdit) {
      return (
        <FormBuilderView
          form={formToEdit}
          onSaveForm={handleSaveForm}
          onPublishForm={handlePublishForm}
          onBack={() => {
            setEditingFormId(null);
            loadData();
          }}
          onOpenPreview={(f) => setPreviewForm(f)}
          onOpenPublic={handleOpenPublicForm}
        />
      );
    }
  }

  // 4. FORM RESULTS VIEW
  if (resultsFormId) {
    const targetForm = forms.find((f) => f.id === resultsFormId);
    if (targetForm) {
      const formSubs = submissions.filter((s) => s.formId === targetForm.id);
      return (
        <FormResultsView
          form={targetForm}
          submissions={formSubs}
          onBack={() => setResultsFormId(null)}
          onDeleteSubmission={handleDeleteSubmission}
          onOpenPublicForm={handleOpenPublicForm}
        />
      );
    }
  }

  // 5. MAIN ADMIN PORTAL
  return (
    <div
      className={`flex h-screen ${
        isLight ? 'bg-[#F7F5F0] text-[#1C1917]' : 'bg-neutral-950 text-neutral-100'
      } overflow-hidden font-sans transition-colors duration-200`}
    >
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onCreateNewForm={handleCreateNewForm}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        openPublicDemo={() => handleOpenPublicForm('auditoria-de-vida')}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          title={
            currentTab === 'dashboard'
              ? 'Dashboard Geral'
              : currentTab === 'forms'
              ? 'Formulários & Auditorias'
              : currentTab === 'contacts'
              ? 'Contatos & CRM de Leads'
              : currentTab === 'analytics'
              ? 'Analytics & Métricas'
              : 'Configurações do Sistema'
          }
          subtitle={
            currentTab === 'dashboard'
              ? 'Visão holística de engajamento'
              : currentTab === 'forms'
              ? `${forms.length} formulários ativos`
              : currentTab === 'contacts'
              ? `${contacts.length} contatos registrados`
              : undefined
          }
        />

        {/* View Content */}
        <main className={`flex-1 overflow-y-auto ${isLight ? 'bg-[#F7F5F0]' : 'bg-neutral-950'}`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              forms={forms}
              submissions={submissions}
              contacts={contacts}
              stats={stats}
              onSelectForm={(id) => setResultsFormId(id)}
              onEditForm={(id) => setEditingFormId(id)}
              onCreateNewForm={handleCreateNewForm}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onViewSubmissions={(formId) => {
                if (formId) setResultsFormId(formId);
                else setCurrentTab('contacts');
              }}
              onOpenPublicForm={handleOpenPublicForm}
            />
          )}

          {currentTab === 'forms' && (
            <FormsListView
              forms={forms}
              templates={templates}
              onEditForm={(id) => setEditingFormId(id)}
              onViewResults={(id) => setResultsFormId(id)}
              onCreateNewForm={handleCreateNewForm}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onDuplicateForm={handleDuplicateForm}
              onDeleteForm={handleDeleteForm}
              onUseTemplate={handleUseTemplate}
              onOpenPublicForm={handleOpenPublicForm}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onUpdateStatus={handleUpdateContactStatus}
              onUpdateNotes={handleUpdateContactNotes}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView forms={forms} submissions={submissions} />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* AI Form Generator Modal */}
      <AiFormGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleCreateWithAI}
      />

      {/* Profile, Logo & Theme Customization Modal */}
      <ProfileBrandingModal />
    </div>
  );
};

