/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface AiFormGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string, title?: string) => Promise<void>;
}

export const AiFormGeneratorModal: React.FC<AiFormGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [promptText, setPromptText] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Diagnóstico de Liderança & Carreira',
      text: `Título: Diagnóstico de Maturidade Profissional
1. Qual seu nome completo?
2. Seu e-mail de contato profissional:
3. WhatsApp com DDD:
4. Qual é o seu nível atual de senioridade?
   - Especialista / Analista Sênior
   - Coordenador ou Gerente
   - Diretor ou C-Level
   - Empreendedor / Fundador
5. Em uma escala de 0 a 10, qual sua satisfação com o equilíbrio entre trabalho e vida pessoal?
6. Descreva o maior desafio que você enfrenta na gestão da sua equipe ou projetos hoje:
7. Você tem planos de transição de carreira nos próximos 12 meses? (Sim/Não)
8. Qual formato de mentoria mais se alinha aos seus objetivos?
   - Mentoria Individual quinzenal
   - Imersão Presencial de final de semana
   - Diagnóstico Estratégico com plano de ação pontual
9. Autorizo o contato confidencial da equipe de mentoria sob a LGPD`,
    },
    {
      title: 'Pesquisa de Satisfação & NPS',
      text: `Título: Avaliação de Experiência do Cliente
1. Como podemos chamar você?
2. E-mail:
3. De 1 a 5 estrelas, como avalia nosso atendimento recente?
4. O que mais se destacou positivamente no serviço entregue?
5. Em uma escala de 0 a 10 (NPS), qual a probabilidade de recomendar a Northorya a um colega?
6. Deixe uma sugestão para continuarmos evoluindo:`,
    },
    {
      title: 'Anamnese de Autoconhecimento',
      text: `Título: Questionário de Governança Pessoal
1. Nome completo:
2. WhatsApp para contato prioritário:
3. Qual área da sua vida mais precisa de foco imediato?
   - Clareza de Decisões e Carreira
   - Relacionamento Familiar e Afetivo
   - Gestão de Energia e Foco
   - Finanças Pessoais
4. Em uma escala de 0 a 10, quanto você se sente no controle da sua rotina diária?
5. Conte em poucas palavras qual o principal hábito que você deseja transformar:
6. Concordo com a política de privacidade e confidencialidade.`,
    },
  ];

  const handleApplyPreset = (presetText: string, presetTitle: string) => {
    setPromptText(presetText);
    setFormTitle(presetTitle);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      setError('Por favor, digite ou cole as perguntas e opções que deseja estruturar.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onGenerate(promptText, formTitle || undefined);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o formulário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>Criar Formulário com IA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold uppercase tracking-wider">
                  Automático
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cole todo o texto com suas perguntas e opções. A IA converte tudo em formulário de uma vez só!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick presets buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Exemplos Prontos (Clique para testar):</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text, preset.title)}
                  className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Título do Formulário (Opcional)
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Diagnóstico de Governança Pessoal"
              disabled={isLoading}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Raw Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Cole aqui suas perguntas, opções e formato
              </label>
              <span className="text-[11px] text-neutral-500">
                Reconhece múltipla escolha, escalas 0-10, estrelas, e-mail, etc.
              </span>
            </div>
            <textarea
              rows={9}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isLoading}
              placeholder={`Cole suas perguntas aqui no formato que preferir, por exemplo:

1. Qual é o seu nome completo?
2. Qual seu e-mail corporativo?
3. Em uma escala de 0 a 10, qual sua nota de clareza hoje?
4. Qual área mais precisa de ajuda?
   - Carreira
   - Relacionamento
   - Finanças
5. Descreva o principal desafio que você enfrenta:`}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 font-mono leading-relaxed resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Tip / Explanation */}
          <div className="p-3 bg-neutral-950/50 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              A inteligência artificial analisa o texto e identifica automaticamente os tipos corretos de campos (Texto curto, longo, múltipla escolha, sim/não, escalas e consentimento LGPD), criando um formulário completo e abrindo direto no editor visual para você personalizar.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Estruturando Formulário com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Formulário Automaticamente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
