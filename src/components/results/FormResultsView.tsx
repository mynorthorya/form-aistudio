/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  X,
  FileSpreadsheet,
  BarChart2,
  List,
} from 'lucide-react';
import { Form, FormSubmission } from '../../types/index.ts';
import { formatWhatsAppUrl } from '../../lib/contact-engine.ts';

interface FormResultsViewProps {
  form: Form;
  submissions: FormSubmission[];
  onBack: () => void;
  onDeleteSubmission: (id: string) => Promise<void>;
  onOpenPublicForm: (slug: string) => void;
}

export const FormResultsView: React.FC<FormResultsViewProps> = ({
  form,
  submissions,
  onBack,
  onDeleteSubmission,
  onOpenPublicForm,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'responses' | 'insights'>('summary');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const filteredSubmissions = submissions.filter((sub) => {
    const text = `${sub.contactName || ''} ${sub.contactEmail || ''} ${sub.contactPhone || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Calculate Insights
  const totalSubs = submissions.length;
  const avgDuration =
    totalSubs > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / totalSubs)
      : 0;

  // Export CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    const interactiveFields = form.fields.filter(
      (f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen'
    );

    // Headers
    const headers = ['ID Submissão', 'Data Conclusão', 'Duração (s)', 'Nome', 'Email', 'WhatsApp'];
    interactiveFields.forEach((f) => headers.push(`"${f.title.replace(/"/g, '""')}"`));

    // Rows
    const rows = submissions.map((sub) => {
      const row = [
        sub.id,
        new Date(sub.completedAt).toLocaleString('pt-BR'),
        sub.durationSeconds,
        `"${sub.contactName || ''}"`,
        `"${sub.contactEmail || ''}"`,
        `"${sub.contactPhone || ''}"`,
      ];
      interactiveFields.forEach((f) => {
        const val = sub.answers[f.id];
        const valStr = Array.isArray(val) ? val.join('; ') : String(val ?? '');
        row.push(`"${valStr.replace(/"/g, '""')}"`);
      });
      return row.join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respostas-${form.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(submissions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respostas-${form.slug}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-neutral-100">
                {form.title}
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                v{form.version}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Resultados, submissões salvas e métricas comportamentais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => onOpenPublicForm(form.slug)}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            title="Abrir formulário ao vivo"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 w-fit">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Visão Geral</span>
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            activeTab === 'responses'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <List className="w-3.5 h-3.5 text-blue-400" />
          <span>Respostas ({submissions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
          <span>Insights & Frequência</span>
        </button>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
              <span className="text-[11px] text-neutral-500 font-medium">Visualizações Totais</span>
              <div className="text-2xl font-bold font-mono text-neutral-100 mt-1">
                {form.stats?.views || 0}
              </div>
            </div>
            <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
              <span className="text-[11px] text-neutral-500 font-medium">Submissões Concluídas</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {submissions.length}
              </div>
            </div>
            <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
              <span className="text-[11px] text-neutral-500 font-medium">Taxa de Conclusão</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {form.stats?.views && form.stats?.views > 0
                  ? Math.round((submissions.length / form.stats.views) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
              <span className="text-[11px] text-neutral-500 font-medium">Tempo Médio</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {avgDuration}s
              </div>
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Últimas Submissões Registradas
            </h3>
            <div className="space-y-2">
              {submissions.map((sub) => {
                const phone = sub.contactPhone || sub.answers?.f_phone;
                const waUrl = phone ? formatWhatsAppUrl(phone, `Olá ${sub.contactName || ''}, recebemos sua resposta à ${form.title}.`) : null;

                return (
                  <div
                    key={sub.id}
                    className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-200">
                          {sub.contactName || 'Anônimo'}
                        </span>
                        {sub.contactEmail && (
                          <span className="text-xs text-neutral-500">
                            · {sub.contactEmail}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Concluído em {new Date(sub.completedAt).toLocaleString('pt-BR')} · Duração: {sub.durationSeconds}s
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 cursor-pointer"
                      >
                        Ver Respostas
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED RESPONSES TABLE */}
      {activeTab === 'responses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Mostrando {filteredSubmissions.length} de {submissions.length} submissões
            </span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Participante</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Duração</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {filteredSubmissions.map((sub) => {
                    const phone = sub.contactPhone || sub.answers?.f_phone;
                    const waUrl = phone ? formatWhatsAppUrl(phone) : null;

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-neutral-100">
                          {sub.contactName || 'Respondente'}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                          {sub.contactEmail || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>{phone}</span>
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                          {new Date(sub.completedAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                          {sub.durationSeconds}s
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 cursor-pointer"
                              title="Abrir resposta completa"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSubmission(sub.id)}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 cursor-pointer"
                              title="Excluir submissão"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INSIGHTS & FREQUENCY */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.fields
              .filter(
                (f) =>
                  f.type === 'multiple_choice' ||
                  f.type === 'opinion_scale' ||
                  f.type === 'yes_no' ||
                  f.type === 'multi_select'
              )
              .map((field) => {
                // Compute distribution
                const values = submissions.map((s) => s.answers[field.id]).filter(Boolean);
                const counts: Record<string, number> = {};

                values.forEach((v) => {
                  if (Array.isArray(v)) {
                    v.forEach((item) => {
                      counts[item] = (counts[item] || 0) + 1;
                    });
                  } else {
                    const str = String(v);
                    counts[str] = (counts[str] || 0) + 1;
                  }
                });

                return (
                  <div
                    key={field.id}
                    className="p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-4"
                  >
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider">
                        {field.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-100 mt-0.5">
                        {field.title}
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {Object.keys(counts).length === 0 ? (
                        <div className="text-xs text-neutral-500 py-3">
                          Ainda não há respostas para esta pergunta.
                        </div>
                      ) : (
                        Object.entries(counts).map(([label, count]) => {
                          const percent = Math.round((count / Math.max(1, values.length)) * 100);
                          return (
                            <div key={label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-300 font-medium truncate max-w-xs">
                                  {label}
                                </span>
                                <span className="text-neutral-500 font-mono text-[11px]">
                                  {count} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Detail Drawer Modal for Individual Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-end">
          <div className="w-full max-w-xl h-full bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-100">
                    Detalhes da Submissão
                  </h3>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    ID: {selectedSubmission.id} · v{selectedSubmission.formVersion}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Respondent info */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-neutral-200">
                  {selectedSubmission.contactName || 'Respondente'}
                </div>
                <div className="text-xs text-neutral-400 space-y-1">
                  <div>E-mail: {selectedSubmission.contactEmail || 'Não informado'}</div>
                  <div>Telefone: {selectedSubmission.contactPhone || 'Não informado'}</div>
                  <div>Duração: {selectedSubmission.durationSeconds} segundos</div>
                  <div>Data: {new Date(selectedSubmission.completedAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>

              {/* All answers */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Respostas Fornecidas
                </h4>

                <div className="space-y-3">
                  {form.fields
                    .filter(
                      (f) =>
                        f.type !== 'welcome_screen' && f.type !== 'thank_you_screen'
                    )
                    .map((field, idx) => {
                      const val = selectedSubmission.answers[field.id];
                      return (
                        <div
                          key={field.id}
                          className="p-3 bg-neutral-950/40 border border-neutral-800/80 rounded-xl space-y-1"
                        >
                          <div className="text-xs text-neutral-400 font-medium">
                            {idx + 1}. {field.title}
                          </div>
                          <div className="text-xs font-semibold text-neutral-100">
                            {val === undefined || val === null || val === '' ? (
                              <span className="text-neutral-600 font-normal italic">
                                Não respondido / Não exibido pela lógica
                              </span>
                            ) : Array.isArray(val) ? (
                              val.join(', ')
                            ) : val === true ? (
                              'Sim (Concordou)'
                            ) : val === false ? (
                              'Não'
                            ) : (
                              String(val)
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-neutral-800 mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
