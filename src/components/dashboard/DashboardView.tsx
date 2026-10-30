/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Form, FormSubmission, Contact } from '../../types/index.ts';
import { formatWhatsAppUrl } from '../../lib/contact-engine.ts';
import { useBranding } from '../../contexts/BrandingContext.tsx';

interface DashboardViewProps {
  forms: Form[];
  submissions: FormSubmission[];
  contacts: Contact[];
  stats: {
    totalForms: number;
    publishedForms: number;
    totalSubmissions: number;
    totalContacts: number;
    totalViews: number;
    totalStarts: number;
    conversionRate: number;
  };
  onSelectForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onCreateNewForm: () => void;
  onOpenAiModal?: () => void;
  onViewSubmissions: (formId?: string) => void;
  onOpenPublicForm: (slug: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  forms,
  submissions,
  contacts,
  stats,
  onSelectForm,
  onEditForm,
  onCreateNewForm,
  onOpenAiModal,
  onViewSubmissions,
  onOpenPublicForm,
}) => {
  const { branding } = useBranding();
  const isLight = branding.themeStyle === 'light';

  const kpis = [
    {
      label: 'Formulários Ativos',
      value: stats.publishedForms,
      total: stats.totalForms,
      sublabel: `${stats.publishedForms} de ${stats.totalForms} publicados`,
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-500" />,
    },
    {
      label: 'Visualizações',
      value: stats.totalViews,
      sublabel: `${stats.totalStarts} iniciados`,
      icon: <Eye className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Respostas Coletadas',
      value: stats.totalSubmissions,
      sublabel: '100% salvas em banco seguro',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Leads no CRM',
      value: stats.totalContacts,
      sublabel: 'Contatos sincronizados',
      icon: <Users className="w-4 h-4 text-purple-400" />,
    },
    {
      label: 'Taxa de Conclusão',
      value: `${stats.conversionRate}%`,
      sublabel: 'Média de conversão',
      icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div
        className={`${
          isLight
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-[#E2DBD0]'
            : 'bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800'
        } border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm transition-colors`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-amber-500 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Ecossistema Northorya de Governança e Desenvolvimento Humano</span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-stone-900' : 'text-neutral-100'}`}>
            Painel Geral do Northorya Forms Studio
          </h2>
          <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-neutral-400'} mt-1 max-w-2xl`}>
            Crie diagnósticos, auditorias de vida e pesquisas conversacionais de alto nível com total controle de dados, sem assinaturas externas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className={`flex items-center gap-2 px-4 py-2 ${
                isLight
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border-amber-400/50'
                  : 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 border-amber-500/30'
              } text-xs font-semibold rounded-lg border transition-colors shadow-sm cursor-pointer`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Criar com IA</span>
            </button>
          )}
          <button
            onClick={() => onOpenPublicForm('auditoria-de-vida')}
            className={`flex items-center gap-2 px-4 py-2 ${
              isLight
                ? 'bg-white hover:bg-stone-50 text-stone-800 border-[#E2DBD0]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            } text-xs font-semibold rounded-lg border transition-colors cursor-pointer shadow-sm`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            <span>Testar Auditoria Ao Vivo</span>
          </button>
          <button
            onClick={onCreateNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Formulário</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
                {kpi.value}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 truncate">
                {kpi.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms & Recent Submissions Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Forms (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-200">
              Formulários em Andamento
            </h3>
            <span className="text-xs text-neutral-500">
              {forms.length} formulários registrados
            </span>
          </div>

          <div className="space-y-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        form.status === 'published' ? 'bg-emerald-500' : 'bg-neutral-600'
                      }`}
                    />
                    <h4 className="text-sm font-semibold text-neutral-100 truncate">
                      {form.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      v{form.version}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      /{form.slug}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1">
                    {form.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                    <span className="tabular-nums font-mono">{form.fields.length} perguntas</span>
                    <span>·</span>
                    <span className="tabular-nums font-mono">{form.stats?.views || 0} visualizações</span>
                    <span>·</span>
                    <span className="tabular-nums font-mono text-emerald-400/90">{form.stats?.completions || 0} conclusões</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEditForm(form.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700/80 transition-colors cursor-pointer"
                  >
                    Editor Visual
                  </button>
                  <button
                    onClick={() => onSelectForm(form.id)}
                    className="px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-xs font-medium rounded-lg border border-amber-600/30 transition-colors cursor-pointer"
                  >
                    Resultados
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Latest Submissions & Quick Leads (1 column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-200">
              Últimas Respostas Recebidas
            </h3>
            <button
              onClick={() => onViewSubmissions()}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
            >
              Ver todas ({submissions.length})
            </button>
          </div>

          <div className="space-y-3">
            {submissions.slice(0, 5).map((sub) => {
              const phone = sub.contactPhone || sub.answers?.f_phone;
              const waUrl = phone ? formatWhatsAppUrl(phone, `Olá ${sub.contactName || ''}, recebemos sua resposta à ${sub.formTitle}.`) : null;

              return (
                <div
                  key={sub.id}
                  className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200 truncate">
                      {sub.contactName || 'Respondente'}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 truncate">
                    {sub.formTitle}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
                    <span className="text-neutral-500 text-[11px]">
                      {sub.durationSeconds ? `${Math.round(sub.durationSeconds)}s de preenchimento` : 'Concluído'}
                    </span>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
