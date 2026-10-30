/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Form, FormSubmission } from '../../types/index.ts';

interface AnalyticsViewProps {
  forms: Form[];
  submissions: FormSubmission[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ forms, submissions }) => {
  const [selectedFormId, setSelectedFormId] = useState<string>('all');

  const selectedForm = forms.find((f) => f.id === selectedFormId);
  const relevantSubmissions =
    selectedFormId === 'all'
      ? submissions
      : submissions.filter((s) => s.formId === selectedFormId);

  const totalViews =
    selectedFormId === 'all'
      ? forms.reduce((acc, f) => acc + (f.stats?.views || 0), 0)
      : selectedForm?.stats?.views || 0;

  const totalStarts =
    selectedFormId === 'all'
      ? forms.reduce((acc, f) => acc + (f.stats?.starts || 0), 0)
      : selectedForm?.stats?.starts || 0;

  const totalCompletions = relevantSubmissions.length;

  const conversionRate =
    totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0;

  const avgDuration =
    totalCompletions > 0
      ? Math.round(
          relevantSubmissions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) /
            totalCompletions
        )
      : 0;

  // UTM Sources aggregation
  const utmSources: Record<string, number> = {};
  relevantSubmissions.forEach((s) => {
    const src = s.utmSource || 'Direto';
    utmSources[src] = (utmSources[src] || 0) + 1;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Form Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">
            Analytics & Relatórios Próprios
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Métricas de engajamento, funil de conversão e taxa de abandono sem dependências externas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Filtrar por formulário:</span>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Todos os Formulários ({forms.length})</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Visualizações Totais</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-100">
            {totalViews}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {totalStarts} respondentes iniciaram
          </div>
        </div>

        <div className="p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Conclusões com Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {totalCompletions}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Respostas salvas no banco
          </div>
        </div>

        <div className="p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Taxa de Conversão Global</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Média de formulário completado
          </div>
        </div>

        <div className="p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Tempo Médio de Preenchimento</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400">
            {avgDuration}s
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Ritmo contínuo e consistente
          </div>
        </div>
      </div>

      {/* Funnel & Drop-off Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Funnel Visualization (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-neutral-200">
            Funil de Conversão do Formulário
          </h3>

          <div className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-6">
            {/* Step 1: Views */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center font-mono text-[11px] text-neutral-400">1</span>
                  <span>1. Visualização do Formulário</span>
                </span>
                <span className="font-mono">{totalViews} (100%)</span>
              </div>
              <div className="w-full bg-neutral-800/60 h-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full" />
              </div>
            </div>

            {/* Step 2: Starts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center font-mono text-[11px] text-neutral-400">2</span>
                  <span>2. Início do Preenchimento</span>
                </span>
                <span className="font-mono">
                  {totalStarts} ({totalViews > 0 ? Math.round((totalStarts / totalViews) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800/60 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalViews > 0 ? Math.round((totalStarts / totalViews) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Step 3: Completions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center font-mono text-[11px] text-neutral-400">3</span>
                  <span>3. Envio Completo & Lead Salvo</span>
                </span>
                <span className="font-mono text-emerald-400">
                  {totalCompletions} ({conversionRate}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800/60 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lead Sources / UTMs (1 col) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-neutral-200">
            Origem dos Leads (Canais)
          </h3>

          <div className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-4">
            {Object.keys(utmSources).length === 0 ? (
              <div className="text-xs text-neutral-500 py-6 text-center">
                Nenhuma origem registrada ainda.
              </div>
            ) : (
              Object.entries(utmSources).map(([source, count]) => {
                const pct = Math.round((count / Math.max(1, totalCompletions)) * 100);
                return (
                  <div key={source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium capitalize">
                        {source}
                      </span>
                      <span className="text-neutral-500 font-mono text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
