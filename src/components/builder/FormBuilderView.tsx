/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Play,
  Palette,
  GitFork,
  Share2,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  CopyPlus,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sliders,
  Type,
  Radio,
  Eye,
} from 'lucide-react';
import { Form, FormField, FormFieldType, FormRule, FormSettings, FormTheme } from '../../types/index.ts';
import { FieldCatalogModal } from './FieldCatalogModal.tsx';
import { FieldPropertiesPanel } from './FieldPropertiesPanel.tsx';
import { ConditionalLogicModal } from './ConditionalLogicModal.tsx';
import { ThemeCustomizerModal } from './ThemeCustomizerModal.tsx';
import { SharePublishModal } from './SharePublishModal.tsx';
import { AiFormGeneratorModal } from './AiFormGeneratorModal.tsx';
import { api } from '../../services/api.ts';

interface FormBuilderViewProps {
  form: Form;
  onSaveForm: (updated: Partial<Form>) => Promise<void>;
  onPublishForm: (formId: string) => Promise<Form>;
  onBack: () => void;
  onOpenPreview: (form: Form) => void;
  onOpenPublic: (slug: string) => void;
}

export const FormBuilderView: React.FC<FormBuilderViewProps> = ({
  form,
  onSaveForm,
  onPublishForm,
  onBack,
  onOpenPreview,
  onOpenPublic,
}) => {
  const [currentForm, setCurrentForm] = useState<Form>(form);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    form.fields[0]?.id || ''
  );
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeDevicePreview, setActiveDevicePreview] = useState<'desktop' | 'mobile'>('desktop');

  // Refs to manage debounce and prevent parent prop overwrite during typing
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const latestFormRef = React.useRef<Form>(form);
  const isDirtyRef = React.useRef(false);
  const formIdRef = React.useRef(form.id);

  // Auto-resize refs for slide canvas
  const titleTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const descTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync internal state when external prop changes ONLY if switching forms
  // or when there are no dirty uncommitted local typing edits
  useEffect(() => {
    if (form.id !== formIdRef.current) {
      formIdRef.current = form.id;
      setCurrentForm(form);
      latestFormRef.current = form;
      isDirtyRef.current = false;
      if (form.fields.length > 0) {
        setSelectedFieldId(form.fields[0].id);
      }
    } else if (!isDirtyRef.current) {
      // Safe background update of status/version without interrupting active inputs
      setCurrentForm((prev) => ({
        ...prev,
        version: form.version,
        status: form.status,
        slug: form.slug,
      }));
      latestFormRef.current = form;
    }
  }, [form]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Rock-solid Debounced Autosave: never creates orphan timers or swaps letters
  const triggerAutosave = (updated: Form) => {
    setCurrentForm(updated);
    latestFormRef.current = updated;
    isDirtyRef.current = true;
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        const toSave = latestFormRef.current;
        await onSaveForm({
          title: toSave.title,
          description: toSave.description,
          fields: toSave.fields,
          rules: toSave.rules,
          theme: toSave.theme,
          settings: toSave.settings,
        });

        // Only mark clean if no newer keystrokes arrived during network round-trip
        if (latestFormRef.current === toSave) {
          isDirtyRef.current = false;
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Error autosaving form:', err);
        setSaveStatus('saved');
      }
    }, 1000);
  };

  const selectedField =
    currentForm.fields.find((f) => f.id === selectedFieldId) || null;

  // Dynamically auto-expand canvas textareas to fit multiline content without clipping
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${Math.max(titleTextareaRef.current.scrollHeight, 36)}px`;
    }
    if (descTextareaRef.current) {
      descTextareaRef.current.style.height = 'auto';
      descTextareaRef.current.style.height = `${Math.max(descTextareaRef.current.scrollHeight, 44)}px`;
    }
  }, [selectedFieldId, selectedField?.title, selectedField?.description]);

  // Add field handler
  const handleAddField = (type: FormFieldType) => {
    const newId = `f_${type}_${Date.now()}`;
    let newField: FormField = {
      id: newId,
      type,
      title: 'Nova Pergunta',
      description: '',
      validation: { required: type !== 'info_text' && type !== 'section_divider' },
    };

    if (type === 'multiple_choice' || type === 'multi_select' || type === 'dropdown') {
      newField.options = [
        { id: `opt_1_${Date.now()}`, label: 'Primeira Opção', value: 'Primeira Opção' },
        { id: `opt_2_${Date.now()}`, label: 'Segunda Opção', value: 'Segunda Opção' },
      ];
    } else if (type === 'opinion_scale') {
      newField.properties = { minScale: 0, maxScale: 10, minScaleLabel: 'Mínimo', maxScaleLabel: 'Máximo' };
    } else if (type === 'consent') {
      newField.title = 'Termo de Consentimento & LGPD';
      newField.properties = { consentText: 'Concordo com o tratamento dos dados pessoais informados.' };
    }

    // Insert before thank you screen if it exists
    const fieldsCopy = [...currentForm.fields];
    const thankYouIdx = fieldsCopy.findIndex((f) => f.type === 'thank_you_screen');
    if (thankYouIdx !== -1) {
      fieldsCopy.splice(thankYouIdx, 0, newField);
    } else {
      fieldsCopy.push(newField);
    }

    const updated = { ...currentForm, fields: fieldsCopy };
    setSelectedFieldId(newId);
    triggerAutosave(updated);
  };

  // Import fields using AI parser from raw text
  const handleImportAiFields = async (text: string) => {
    const newFields = await api.parseFieldsWithAI(text);
    if (!newFields || newFields.length === 0) return;

    const fieldsCopy = [...currentForm.fields];
    const thankYouIdx = fieldsCopy.findIndex((f) => f.type === 'thank_you_screen');
    if (thankYouIdx !== -1) {
      fieldsCopy.splice(thankYouIdx, 0, ...newFields);
    } else {
      fieldsCopy.push(...newFields);
    }

    const updated = { ...currentForm, fields: fieldsCopy };
    if (newFields[0]?.id) {
      setSelectedFieldId(newFields[0].id);
    }
    triggerAutosave(updated);
  };

  // Reorder fields
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentForm.fields.length) return;

    const fieldsCopy = [...currentForm.fields];
    const [moved] = fieldsCopy.splice(index, 1);
    fieldsCopy.splice(targetIndex, 0, moved);

    const updated = { ...currentForm, fields: fieldsCopy };
    triggerAutosave(updated);
  };

  // Duplicate field
  const handleDuplicateField = (fieldId: string) => {
    const idx = currentForm.fields.findIndex((f) => f.id === fieldId);
    if (idx === -1) return;

    const original = currentForm.fields[idx];
    const copyId = `f_${original.type}_${Date.now()}`;
    const duplicated: FormField = {
      ...JSON.parse(JSON.stringify(original)),
      id: copyId,
      title: `${original.title} (Cópia)`,
    };

    const fieldsCopy = [...currentForm.fields];
    fieldsCopy.splice(idx + 1, 0, duplicated);

    const updated = { ...currentForm, fields: fieldsCopy };
    setSelectedFieldId(copyId);
    triggerAutosave(updated);
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    if (currentForm.fields.length <= 1) return;
    const fieldsCopy = currentForm.fields.filter((f) => f.id !== fieldId);
    const updated = { ...currentForm, fields: fieldsCopy };
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(fieldsCopy[0]?.id || '');
    }
    triggerAutosave(updated);
  };

  // Update single field
  const handleUpdateField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    const fieldsCopy = currentForm.fields.map((f) =>
      f.id === selectedFieldId ? { ...f, ...updates } : f
    );
    const updated = { ...currentForm, fields: fieldsCopy };
    triggerAutosave(updated);
  };

  // Publish
  const handlePublish = async () => {
    setSaveStatus('saving');
    const published = await onPublishForm(currentForm.id);
    setCurrentForm(published);
    setSaveStatus('saved');
    setIsShareOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 select-none overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-950 px-4 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left: Back button + Form title & status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={currentForm.title}
              onChange={(e) => {
                const updated = { ...currentForm, title: e.target.value };
                triggerAutosave(updated);
              }}
              className="bg-transparent hover:bg-neutral-900/60 focus:bg-neutral-900 px-2 py-1 rounded text-sm font-bold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 truncate max-w-xs md:max-w-md"
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono shrink-0">
              v{currentForm.version}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-neutral-500 pl-2">
            {saveStatus === 'saving' ? (
              <span className="text-amber-500 animate-pulse">Salvando alterações...</span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-400">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Salvo</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Device Toggle */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveDevicePreview('desktop')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              activeDevicePreview === 'desktop'
                ? 'bg-neutral-800 text-amber-500 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Visualização Desktop"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveDevicePreview('mobile')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              activeDevicePreview === 'mobile'
                ? 'bg-neutral-800 text-amber-500 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Visualização Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLogicOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            title="Configurar Lógica Condicional"
          >
            <GitFork className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Lógica ({currentForm.rules.length})</span>
          </button>

          <button
            onClick={() => setIsThemeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            title="Personalizar Aparência"
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Aparência</span>
          </button>

          <button
            onClick={() => onOpenPreview(currentForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            title="Ver como respondente"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publicar</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            title="Compartilhar link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Field Structure Tree */}
        <aside className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col justify-between shrink-0 select-none">
          <div className="p-3 border-b border-neutral-900 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Estrutura ({currentForm.fields.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAiImportOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Adicionar ou gerar perguntas com IA a partir de texto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>IA</span>
              </button>
              <button
                onClick={() => setIsCatalogOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pergunta</span>
              </button>
            </div>
          </div>

          {/* Fields List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {currentForm.fields.map((f, idx) => {
              const isSelected = f.id === selectedFieldId;
              const hasRule = currentForm.rules.some((r) => r.targetFieldId === f.id);

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-neutral-800/90 text-neutral-100 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-neutral-500 shrink-0 w-4">
                      {idx + 1}.
                    </span>
                    <span className="truncate font-medium">{f.title || `Campo (${f.type})`}</span>
                    {hasRule && (
                      <span title="Possui regra condicional" className="shrink-0 flex items-center">
                        <GitFork className="w-3 h-3 text-amber-500" />
                      </span>
                    )}
                  </div>

                  {/* Ordering arrows */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveField(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:text-neutral-100 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveField(idx, 'down');
                      }}
                      disabled={idx === currentForm.fields.length - 1}
                      className="p-1 hover:text-neutral-100 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Panel Footer */}
          <div className="p-3 border-t border-neutral-900">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Adicionar Pergunta</span>
            </button>
          </div>
        </aside>

        {/* Center Panel: WYSIWYG Editable Preview */}
        <main className="flex-1 bg-neutral-900/30 overflow-y-auto flex items-center justify-center p-6 sm:p-12">
          <div
            className={`transition-all duration-300 w-full ${
              activeDevicePreview === 'mobile'
                ? 'max-w-sm rounded-[40px] border-[8px] border-neutral-800 shadow-2xl p-6 min-h-[640px]'
                : 'max-w-3xl rounded-2xl border border-neutral-800/80 shadow-xl p-10 min-h-[480px]'
            } bg-neutral-950 flex flex-col justify-between`}
            style={{
              backgroundColor: currentForm.theme.backgroundColor || '#09090b',
              color: currentForm.theme.textColor || '#f4f4f5',
            }}
          >
            {selectedField ? (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Field Type Tag & Required indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500">
                    {selectedField.type.replace('_', ' ')}
                  </span>
                  {selectedField.validation?.required && (
                    <span className="text-[10px] text-rose-400 font-medium">
                      * Obrigatório
                    </span>
                  )}
                </div>

                {/* Editable Title & Description with Full Multiline & Line Break Support */}
                <div className="space-y-2">
                  <textarea
                    ref={titleTextareaRef}
                    rows={1}
                    value={selectedField.title}
                    onChange={(e) => handleUpdateField({ title: e.target.value })}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 focus:outline-none focus:bg-neutral-900/40 rounded px-1.5 py-1 resize-none whitespace-pre-wrap leading-snug overflow-hidden block"
                    placeholder="Digite o título da pergunta..."
                  />
                  <textarea
                    ref={descTextareaRef}
                    rows={2}
                    value={selectedField.description || ''}
                    onChange={(e) => handleUpdateField({ description: e.target.value })}
                    className="w-full bg-transparent text-xs sm:text-sm text-neutral-400 focus:outline-none focus:bg-neutral-900/40 rounded px-1.5 py-1 resize-none whitespace-pre-wrap leading-relaxed overflow-hidden block"
                    placeholder="Instruções de apoio ou descrição (pressione Enter para quebrar linhas)..."
                  />
                </div>

                {/* Interactive WYSIWYG Mock based on Field Type */}
                <div className="pt-2">
                  {/* Text types */}
                  {(selectedField.type === 'short_text' ||
                    selectedField.type === 'full_name' ||
                    selectedField.type === 'email' ||
                    selectedField.type === 'phone' ||
                    selectedField.type === 'instagram' ||
                    selectedField.type === 'url' ||
                    selectedField.type === 'number') && (
                    <input
                      type="text"
                      disabled
                      placeholder={selectedField.placeholder || 'Sua resposta aqui...'}
                      className="w-full bg-neutral-900/80 border-b-2 border-neutral-700 py-3 px-1 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none"
                    />
                  )}

                  {/* Long text */}
                  {selectedField.type === 'long_text' && (
                    <textarea
                      disabled
                      rows={3}
                      placeholder={selectedField.placeholder || 'Escreva sua reflexão detalhada aqui...'}
                      className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none resize-none"
                    />
                  )}

                  {/* Multiple Choice */}
                  {selectedField.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {(selectedField.options || []).map((opt, i) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs font-medium text-neutral-200"
                        >
                          <span className="w-5 h-5 rounded border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-amber-500">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Multi Select */}
                  {selectedField.type === 'multi_select' && (
                    <div className="space-y-2">
                      {(selectedField.options || []).map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs font-medium text-neutral-200"
                        >
                          <div className="w-4 h-4 rounded border border-neutral-700" />
                          <span>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Yes / No */}
                  {selectedField.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                      <div className="p-3 text-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs font-bold text-neutral-200">
                        Sim (Y)
                      </div>
                      <div className="p-3 text-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs font-bold text-neutral-200">
                        Não (N)
                      </div>
                    </div>
                  )}

                  {/* Opinion scale 0 to 10 */}
                  {selectedField.type === 'opinion_scale' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 font-mono text-xs font-bold text-neutral-300"
                          >
                            {i}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                        <span>{selectedField.properties?.minScaleLabel || 'Mínimo'}</span>
                        <span>{selectedField.properties?.maxScaleLabel || 'Máximo'}</span>
                      </div>
                    </div>
                  )}

                  {/* Rating Stars */}
                  {selectedField.type === 'rating_stars' && (
                    <div className="flex items-center gap-2">
                      {Array.from({ length: selectedField.properties?.maxStars || 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-amber-500 font-bold"
                        >
                          ★
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NPS */}
                  {selectedField.type === 'nps' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square flex items-center justify-center rounded-lg border border-neutral-800 font-mono text-xs font-bold ${
                              i <= 6 ? 'text-rose-400' : i <= 8 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {i}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                        <span>0 - Pouco provável</span>
                        <span>10 - Extremamente provável</span>
                      </div>
                    </div>
                  )}

                  {/* Consent */}
                  {selectedField.type === 'consent' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                      <div className="w-5 h-5 rounded border border-amber-500/60 mt-0.5 shrink-0" />
                      <span className="text-xs text-neutral-300">
                        {selectedField.properties?.consentText ||
                          'Concordo com os termos de privacidade e autorizo o contato.'}
                      </span>
                    </div>
                  )}

                  {/* Welcome Screen */}
                  {selectedField.type === 'welcome_screen' && (
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={selectedField.properties?.buttonText || 'Iniciar Preenchimento'}
                        onChange={(e) =>
                          handleUpdateField({
                            properties: {
                              ...selectedField.properties,
                              buttonText: e.target.value,
                            },
                          })
                        }
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all cursor-text min-w-[160px]"
                        placeholder="Texto do botão..."
                        title="Clique para editar o texto do botão"
                      />
                      <span className="text-[11px] text-neutral-500">
                        (Editar texto do botão)
                      </span>
                    </div>
                  )}

                  {/* Thank You Screen */}
                  {selectedField.type === 'thank_you_screen' && (
                    <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-xs text-neutral-400">
                      Esta é a tela final que os participantes verão após o envio das respostas.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-12">
                Nenhum campo selecionado
              </div>
            )}

            {/* Bottom Preview Footnote */}
            <div className="pt-6 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Northorya Forms Engine</span>
              <span>Modo: {currentForm.settings.mode}</span>
            </div>
          </div>
        </main>

        {/* Right Panel: Properties Inspector */}
        <FieldPropertiesPanel
          field={selectedField}
          onUpdateField={handleUpdateField}
          onDeleteField={handleDeleteField}
          onDuplicateField={handleDuplicateField}
        />
      </div>

      {/* Modals */}
      <FieldCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectFieldType={handleAddField}
      />

      <ConditionalLogicModal
        isOpen={isLogicOpen}
        onClose={() => setIsLogicOpen(false)}
        fields={currentForm.fields}
        rules={currentForm.rules}
        onSaveRules={(rules) => {
          const updated = { ...currentForm, rules };
          triggerAutosave(updated);
        }}
      />

      <ThemeCustomizerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        theme={currentForm.theme}
        settings={currentForm.settings}
        onSaveThemeAndSettings={(theme, settings) => {
          const updated = { ...currentForm, theme, settings };
          triggerAutosave(updated);
        }}
      />

      <SharePublishModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        form={currentForm}
        onUpdateSlug={(slug) => {
          const updated = { ...currentForm, slug };
          triggerAutosave(updated);
        }}
        onToggleStatus={(pub) => {
          const updated: Form = { ...currentForm, status: pub ? 'published' : 'draft' };
          triggerAutosave(updated);
        }}
        onOpenPublic={onOpenPublic}
      />

      <AiFormGeneratorModal
        isOpen={isAiImportOpen}
        onClose={() => setIsAiImportOpen(false)}
        onGenerate={handleImportAiFields}
      />
    </div>
  );
};
