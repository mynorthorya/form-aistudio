/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trash2,
  CopyPlus,
  Plus,
  Sliders,
  CheckSquare,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ChevronDown,
  List,
  Check,
  AlignLeft,
  Calendar,
  Mail,
  Phone,
  Hash,
  Star,
  SlidersHorizontal,
  ToggleLeft,
  ArrowRight,
  AtSign,
  Globe,
  Layers,
  FileText,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { FormField, FormFieldType, FieldOption } from '../../types/index.ts';

interface FieldPropertiesPanelProps {
  field: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

export interface FieldTypeMeta {
  type: FormFieldType;
  label: string;
  category: 'Escolha' | 'Texto' | 'Contato & Dados' | 'Avaliação' | 'Especiais';
  description: string;
}

export const ALL_FIELD_TYPES: FieldTypeMeta[] = [
  // Escolha
  { type: 'multiple_choice', label: 'Múltipla Escolha (1 opção)', category: 'Escolha', description: 'O participante escolhe apenas uma alternativa' },
  { type: 'multi_select', label: 'Seleção Múltipla (Várias opções)', category: 'Escolha', description: 'Permite marcar uma ou várias alternativas' },
  { type: 'dropdown', label: 'Lista Suspensa (Dropdown)', category: 'Escolha', description: 'Menu compacto para escolher uma alternativa' },
  { type: 'yes_no', label: 'Sim ou Não', category: 'Escolha', description: 'Decisão binária com atalhos de teclado' },

  // Texto
  { type: 'short_text', label: 'Texto Curto', category: 'Texto', description: 'Resposta direta em uma linha' },
  { type: 'long_text', label: 'Texto Longo / Parágrafo', category: 'Texto', description: 'Respostas detalhadas e reflexões profundas' },

  // Contato & Dados
  { type: 'full_name', label: 'Nome Completo', category: 'Contato & Dados', description: 'Captura de nome para identificação e CRM' },
  { type: 'email', label: 'E-mail', category: 'Contato & Dados', description: 'Validação automática de endereço de e-mail' },
  { type: 'phone', label: 'Telefone / WhatsApp', category: 'Contato & Dados', description: 'Número formatado com link direto no painel' },
  { type: 'number', label: 'Número', category: 'Contato & Dados', description: 'Apenas números e valores quantitativos' },
  { type: 'date', label: 'Data (Calendário)', category: 'Contato & Dados', description: 'Seleção formal de dia, mês e ano' },
  { type: 'url', label: 'Link / URL', category: 'Contato & Dados', description: 'Endereço de website válido' },
  { type: 'instagram', label: 'Instagram / Redes', category: 'Contato & Dados', description: 'Identificador social com @' },

  // Avaliação
  { type: 'opinion_scale', label: 'Escala de Opinião (0 a 10)', category: 'Avaliação', description: 'Escala numérica horizontal de 0 a 10' },
  { type: 'rating_stars', label: 'Avaliação por Estrelas (1 a 5)', category: 'Avaliação', description: 'Classificação visual de 1 a 5 estrelas' },
  { type: 'nps', label: 'NPS (Net Promoter Score)', category: 'Avaliação', description: 'Métrica de recomendação e satisfação' },

  // Especiais
  { type: 'consent', label: 'Termo de Consentimento / LGPD', category: 'Especiais', description: 'Autorização formal para tratamento de dados' },
  { type: 'welcome_screen', label: 'Tela de Boas-Vindas', category: 'Especiais', description: 'Página inicial com botão de entrada' },
  { type: 'thank_you_screen', label: 'Tela de Agradecimento', category: 'Especiais', description: 'Página final após submissão' },
];

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
}) => {
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  if (!field) {
    return (
      <div className="w-80 border-l border-neutral-800 bg-neutral-950 p-6 flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
        <Sliders className="w-8 h-8 text-neutral-700 mb-2" />
        <span className="font-medium text-neutral-400">Nenhum campo selecionado</span>
        <p className="text-[11px] text-neutral-600 mt-1">
          Clique em uma pergunta na árvore à esquerda ou no preview central para configurar suas propriedades.
        </p>
      </div>
    );
  }

  const isSpecialScreen =
    field.type === 'welcome_screen' || field.type === 'thank_you_screen';
  const hasOptions =
    field.type === 'multiple_choice' ||
    field.type === 'multi_select' ||
    field.type === 'dropdown';

  // Check if description has multiple lines that look like candidate options
  const descriptionLines = (field.description || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const hasConvertibleLines = descriptionLines.length >= 2;

  // Handle changing the question type
  const handleTypeChange = (newType: FormFieldType) => {
    const updates: Partial<FormField> = { type: newType };

    // If changing to an option type and field has no options or has convertible description:
    if (newType === 'multiple_choice' || newType === 'multi_select' || newType === 'dropdown') {
      if ((!field.options || field.options.length === 0) && hasConvertibleLines) {
        // Automatically convert lines in description to options!
        const parsedOpts: FieldOption[] = descriptionLines.map((line, idx) => {
          const cleanLabel = line.replace(/^([a-zA-Z][\.\-\)]|\-|\*|•|\d+[\.\-\)]|\[\s*\])\s*/, '').trim();
          return {
            id: `opt_${Date.now()}_${idx + 1}`,
            label: cleanLabel || line,
            value: cleanLabel || line,
          };
        });
        updates.options = parsedOpts;
        updates.description = '';
      } else if (!field.options || field.options.length === 0) {
        updates.options = [
          { id: `opt_${Date.now()}_1`, label: 'Primeira Opção', value: 'Primeira Opção' },
          { id: `opt_${Date.now()}_2`, label: 'Segunda Opção', value: 'Segunda Opção' },
        ];
      }
    } else if (newType === 'opinion_scale') {
      updates.properties = {
        ...field.properties,
        minScale: 0,
        maxScale: 10,
        minScaleLabel: field.properties?.minScaleLabel || 'Mínimo',
        maxScaleLabel: field.properties?.maxScaleLabel || 'Máximo',
      };
    } else if (newType === 'rating_stars') {
      updates.properties = { ...field.properties, maxStars: 5 };
    } else if (newType === 'consent') {
      updates.properties = {
        ...field.properties,
        consentText: field.properties?.consentText || 'Concordo com os termos e autorizo o tratamento de dados (LGPD).',
      };
    }

    onUpdateField(updates);
  };

  // Convert description lines into options with 1 click
  const handleConvertDescriptionToOptions = () => {
    if (!descriptionLines.length) return;
    const newOptions: FieldOption[] = descriptionLines.map((line, idx) => {
      const cleanLabel = line.replace(/^([a-zA-Z][\.\-\)]|\-|\*|•|\d+[\.\-\)]|\[\s*\])\s*/, '').trim();
      return {
        id: `opt_${Date.now()}_${idx + 1}`,
        label: cleanLabel || line,
        value: cleanLabel || line,
      };
    });

    onUpdateField({
      type: field.type === 'multi_select' ? 'multi_select' : 'multiple_choice',
      options: newOptions,
      description: '', // clear description since it became options
    });
  };

  const handleAddOption = () => {
    const opts = field.options || [];
    const newOpt: FieldOption = {
      id: `opt_${Date.now()}`,
      label: `Nova Opção ${opts.length + 1}`,
      value: `Opção ${opts.length + 1}`,
    };
    onUpdateField({ options: [...opts, newOpt] });
  };

  const handleUpdateOption = (index: number, label: string) => {
    const opts = [...(field.options || [])];
    opts[index] = { ...opts[index], label, value: label };
    onUpdateField({ options: opts });
  };

  const handleRemoveOption = (index: number) => {
    const opts = [...(field.options || [])];
    opts.splice(index, 1);
    onUpdateField({ options: opts });
  };

  const handleBulkAddOptions = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;

    const existing = field.options || [];
    const created: FieldOption[] = lines.map((line, idx) => {
      const clean = line.replace(/^([a-zA-Z][\.\-\)]|\-|\*|•|\d+[\.\-\)]|\[\s*\])\s*/, '').trim();
      return {
        id: `opt_${Date.now()}_${idx + 1}`,
        label: clean || line,
        value: clean || line,
      };
    });

    onUpdateField({ options: [...existing, ...created] });
    setBulkText('');
    setIsBulkOpen(false);
  };

  return (
    <aside className="w-80 border-l border-neutral-800 bg-neutral-950 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Field Header & Quick Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
              Configurações da Pergunta
            </span>
            <div className="text-xs font-semibold text-neutral-200">
              Editor de Propriedades
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateField(field.id)}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Duplicar pergunta"
            >
              <CopyPlus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteField(field.id)}
              className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Excluir pergunta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. SELETOR DE TIPO DE RESPOSTA (TYPE SWITCHER - TYPEFORM STYLE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-300">
              Tipo de Resposta
            </label>
            <span className="text-[10px] text-amber-400 font-mono">Alterar a qualquer momento</span>
          </div>

          <div className="relative">
            <select
              value={field.type}
              onChange={(e) => handleTypeChange(e.target.value as FormFieldType)}
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-neutral-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/60 cursor-pointer appearance-none pr-8 transition-colors"
            >
              <optgroup label="Escolha & Seleção">
                <option value="multiple_choice">🔘 Múltipla Escolha (1 opção)</option>
                <option value="multi_select">☑️ Seleção Múltipla (Várias opções)</option>
                <option value="dropdown">🔽 Lista Suspensa (Dropdown)</option>
                <option value="yes_no">⚖️ Sim ou Não</option>
              </optgroup>

              <optgroup label="Texto & Reflexão">
                <option value="short_text">📝 Texto Curto (1 linha)</option>
                <option value="long_text">📄 Texto Longo / Parágrafo</option>
              </optgroup>

              <optgroup label="Contato & Dados (CRM)">
                <option value="full_name">👤 Nome Completo</option>
                <option value="email">✉️ E-mail</option>
                <option value="phone">📱 Telefone / WhatsApp</option>
                <option value="number">🔢 Número</option>
                <option value="date">📅 Data (Calendário)</option>
                <option value="url">🔗 Link / URL</option>
                <option value="instagram">📸 Instagram / @</option>
              </optgroup>

              <optgroup label="Avaliação & Escala">
                <option value="opinion_scale">📊 Escala de Opinião (0 a 10)</option>
                <option value="rating_stars">⭐ Avaliação por Estrelas (1 a 5)</option>
                <option value="nps">📈 NPS (Net Promoter Score 0-10)</option>
              </optgroup>

              <optgroup label="Especiais & Governança">
                <option value="consent">🛡️ Termo de Consentimento / LGPD</option>
                <option value="welcome_screen">🚪 Tela de Boas-Vindas</option>
                <option value="thank_you_screen">🏁 Tela de Agradecimento</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. CONVERTER LINHAS DA DESCRIÇÃO EM OPÇÕES (MAGIC BUTTON) */}
        {hasConvertibleLines && !hasOptions && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-300 block">
                  Alternativas detectadas na descrição!
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Detectamos {descriptionLines.length} itens de texto. Deseja transformá-los em opções clicáveis de múltipla escolha?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConvertDescriptionToOptions}
              className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-lg text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Converter em Múltipla Escolha Agora</span>
            </button>
          </div>
        )}

        {/* 3. TÍTULO DA PERGUNTA */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-300">
              Título da Pergunta
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Suporta Enter</span>
          </div>
          <textarea
            rows={Math.max(2, (field.title || '').split('\n').length)}
            value={field.title}
            onChange={(e) => onUpdateField({ title: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 resize-y whitespace-pre-wrap leading-relaxed"
            placeholder="Qual pergunta você quer fazer?"
          />
        </div>

        {/* 4. INSTRUÇÃO OU DESCRIÇÃO ADICIONAL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-300">
              Instrução ou Descrição Adicional
            </label>
            <span className="text-[10px] text-amber-500/80 font-mono">Quebras de linha (Enter)</span>
          </div>
          <textarea
            rows={Math.max(3, (field.description || '').split('\n').length)}
            value={field.description || ''}
            onChange={(e) => onUpdateField({ description: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 resize-y whitespace-pre-wrap leading-relaxed"
            placeholder="Instruções de apoio opcionais (Enter para criar novos parágrafos)"
          />
        </div>

        {/* 5. PLACEHOLDER (SE APLICÁVEL) */}
        {!isSpecialScreen && field.type !== 'opinion_scale' && field.type !== 'rating_stars' && field.type !== 'nps' && !hasOptions && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-300">
              Texto de Exemplo (Placeholder)
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              placeholder="Ex: Seu texto aqui..."
            />
          </div>
        )}

        {/* 6. CAMPO OBRIGATÓRIO TOGGLE */}
        {!isSpecialScreen && field.type !== 'info_text' && field.type !== 'section_divider' && (
          <div className="pt-1">
            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer hover:bg-neutral-900 transition-colors">
              <div>
                <span className="text-xs font-medium text-neutral-200 block">
                  Resposta Obrigatória
                </span>
                <span className="text-[10px] text-neutral-500">
                  O participante não pode avançar sem responder
                </span>
              </div>
              <input
                type="checkbox"
                checked={field.validation?.required || false}
                onChange={(e) =>
                  onUpdateField({
                    validation: { ...field.validation, required: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded border-neutral-700 text-amber-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* 7. EDITOR DE ALTERNATIVAS (MULTIPLE CHOICE / MULTI SELECT / DROPDOWN) */}
        {hasOptions && (
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-semibold text-neutral-200 block">
                  Alternativas de Resposta
                </label>
                <span className="text-[10px] text-neutral-500">
                  {field.options?.length || 0} opções cadastradas
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(!isBulkOpen)}
                  className="px-2 py-1 text-[10px] text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                  title="Colar várias opções de uma vez"
                >
                  <Upload className="w-3 h-3 text-amber-500" />
                  <span>Em Lote</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2 py-1 text-[10px] text-neutral-950 font-bold bg-amber-500 hover:bg-amber-400 rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nova</span>
                </button>
              </div>
            </div>

            {/* Bulk Add Textarea Expandable */}
            {isBulkOpen && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400">
                    Colar Alternativas (1 por linha)
                  </span>
                  <button
                    onClick={() => setIsBulkOpen(false)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                  >
                    Fechar
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
                  placeholder="Opção A&#10;Opção B&#10;Opção C"
                />
                <button
                  type="button"
                  onClick={handleBulkAddOptions}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                >
                  Adicionar Linhas como Alternativas
                </button>
              </div>
            )}

            {/* Options list */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {(field.options || []).map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-1.5 group">
                  <span className="text-[10px] text-neutral-500 font-mono w-5 shrink-0 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                  />
                  {(field.options?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-neutral-600 hover:text-rose-400 rounded transition-colors cursor-pointer opacity-70 group-hover:opacity-100 shrink-0"
                      title="Excluir alternativa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PROPRIEDADES DE ESCALA 0 A 10 */}
        {field.type === 'opinion_scale' && (
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <label className="text-[11px] font-semibold text-neutral-300">
              Rótulos dos Extremos da Escala (0 a 10)
            </label>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-neutral-500 block mb-0.5">Rótulo Mínimo (0)</span>
                <input
                  type="text"
                  value={field.properties?.minScaleLabel || ''}
                  onChange={(e) =>
                    onUpdateField({
                      properties: { ...field.properties, minScaleLabel: e.target.value },
                    })
                  }
                  placeholder="Ex: Pouco provável / Nenhuma clareza"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block mb-0.5">Rótulo Máximo (10)</span>
                <input
                  type="text"
                  value={field.properties?.maxScaleLabel || ''}
                  onChange={(e) =>
                    onUpdateField({
                      properties: { ...field.properties, maxScaleLabel: e.target.value },
                    })
                  }
                  placeholder="Ex: Extremamente provável / Plena clareza"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. BOTÃO DE TELAS ESPECIAIS (WELCOME / THANK YOU) */}
        {(field.type === 'welcome_screen' || field.type === 'thank_you_screen') && (
          <div className="space-y-1.5 pt-2 border-t border-neutral-900">
            <label className="text-[11px] font-semibold text-neutral-300">
              Texto do Botão de Ação
            </label>
            <input
              type="text"
              value={field.properties?.buttonText || (field.type === 'welcome_screen' ? 'Iniciar Preenchimento' : 'Concluir')}
              onChange={(e) =>
                onUpdateField({
                  properties: { ...field.properties, buttonText: e.target.value },
                })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="p-4 border-t border-neutral-900 bg-neutral-950/60 text-[11px] text-neutral-500 flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>
          As alterações feitas neste painel são salvas automaticamente em tempo real no formulário.
        </span>
      </div>
    </aside>
  );
};
