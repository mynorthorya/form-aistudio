/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Layers,
  BarChart2,
  Trash2,
  CopyPlus,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { Form } from '../../types/index.ts';

interface FormsListViewProps {
  forms: Form[];
  templates: Form[];
  onEditForm: (formId: string) => void;
  onViewResults: (formId: string) => void;
  onCreateNewForm: () => void;
  onOpenAiModal?: () => void;
  onDuplicateForm: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onUseTemplate: (template: Form) => void;
  onOpenPublicForm: (slug: string) => void;
}

export const FormsListView: React.FC<FormsListViewProps> = ({
  forms,
  templates,
  onEditForm,
  onViewResults,
  onCreateNewForm,
  onOpenAiModal,
  onDuplicateForm,
  onDeleteForm,
  onUseTemplate,
  onOpenPublicForm,
}) => {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'templates'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.slug.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'published') return f.status === 'published';
    if (filter === 'draft') return f.status === 'draft';
    return true;
  });

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/?form=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">
            Formulários & Auditorias
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie diagnósticos comportamentais, questionários de autoconhecimento e pesquisas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Criar com IA</span>
            </button>
          )}
          <button
            onClick={onCreateNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Formulário</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        {/* Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todos ({forms.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'published'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Publicados ({forms.filter((f) => f.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'draft'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Rascunhos ({forms.filter((f) => f.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilter('templates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'templates'
                ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar formulário..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Templates View (if selected) */}
      {filter === 'templates' ? (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400">
            Selecione um template oficial para clonar com 1 clique e começar a editar:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                      Template Oficial Northorya
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-100 mb-1">
                    {tpl.title.replace('Template: ', '')}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {tpl.description}
                  </p>
                  <div className="text-[11px] text-neutral-500 font-mono mb-4">
                    {tpl.fields.length} perguntas pré-estruturadas
                  </div>
                </div>
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Usar Este Template
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Forms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => {
            const isPub = form.status === 'published';
            return (
              <div
                key={form.id}
                className="bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                {/* Header & Status */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPub ? 'bg-emerald-500' : 'bg-neutral-600'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-neutral-400 capitalize">
                        {isPub ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      v{form.version}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                    {form.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {form.description}
                  </p>

                  <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2 mb-4">
                    <span>/{form.slug}</span>
                    <span>·</span>
                    <span>{form.fields.length} perguntas</span>
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-neutral-950/60 border border-neutral-800/60 rounded-lg text-center mb-4">
                    <div>
                      <span className="block text-[10px] text-neutral-500 uppercase">Visualizações</span>
                      <span className="text-xs font-bold font-mono text-neutral-200">
                        {form.stats?.views || 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 uppercase">Respostas</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        {form.stats?.completions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 uppercase">Conversão</span>
                      <span className="text-xs font-bold font-mono text-amber-400">
                        {form.stats?.views && form.stats?.views > 0
                          ? Math.round(((form.stats?.completions || 0) / form.stats.views) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onEditForm(form.id)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editor</span>
                    </button>
                    <button
                      onClick={() => onViewResults(form.id)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-xs font-medium rounded-lg border border-amber-600/30 transition-colors cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Resultados</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                    <button
                      onClick={() => handleCopyLink(form.slug, form.id)}
                      className="flex items-center gap-1 hover:text-neutral-200 cursor-pointer"
                    >
                      {copiedId === form.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Link copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiar link</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        title="Duplicar formulário"
                        onClick={() => onDuplicateForm(form.id)}
                        className="p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Excluir formulário"
                        onClick={() => onDeleteForm(form.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isPub && (
                        <button
                          title="Abrir formulário público"
                          onClick={() => onOpenPublicForm(form.slug)}
                          className="p-1 text-neutral-400 hover:text-amber-400 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
