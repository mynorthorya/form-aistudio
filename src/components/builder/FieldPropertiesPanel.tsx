/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Trash2,
  CopyPlus,
  Plus,
  Sliders,
  CheckSquare,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { FormField, FormFieldType } from '../../types/index.ts';

interface FieldPropertiesPanelProps {
  field: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
}) => {
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

  const handleAddOption = () => {
    const opts = field.options || [];
    const newOpt = {
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

  return (
    <aside className="w-80 border-l border-neutral-800 bg-neutral-950 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Field Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
              Propriedades do Campo
            </span>
            <div className="text-xs font-semibold text-neutral-200 capitalize">
              {field.type.replace('_', ' ')}
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

        {/* Title */}
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

        {/* Description / Instructions */}
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
            placeholder="Instruções de apoio opcionais (pressione Enter para novos parágrafos)"
          />
        </div>

        {/* Placeholder (if applicable) */}
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

        {/* Required Field Toggle */}
        {!isSpecialScreen && field.type !== 'info_text' && field.type !== 'section_divider' && (
          <div className="pt-2">
            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
              <span className="text-xs font-medium text-neutral-200">
                Campo Obrigatório
              </span>
              <input
                type="checkbox"
                checked={field.validation?.required || false}
                onChange={(e) =>
                  onUpdateField({
                    validation: { ...field.validation, required: e.target.checked },
                  })
                }
                className="rounded border-neutral-700 text-amber-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Options Editor (Multiple Choice / Multi Select / Dropdown) */}
        {hasOptions && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-300">
                Alternativas de Resposta
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {(field.options || []).map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono w-4">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                  />
                  {(field.options?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opinion Scale Properties */}
        {field.type === 'opinion_scale' && (
          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-semibold text-neutral-300">
              Rótulos dos Extremos da Escala
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
                  placeholder="Ex: Nada provável / Nenhuma clareza"
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

        {/* Special Screen Button Text */}
        {(field.type === 'welcome_screen' || field.type === 'thank_you_screen') && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-semibold text-neutral-300">
              Texto do Botão de Ação
            </label>
            <input
              type="text"
              value={field.properties?.buttonText || (field.type === 'welcome_screen' ? 'Iniciar' : 'Concluir')}
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
          As alterações feitas neste painel são salvas automaticamente em tempo real no rascunho do formulário.
        </span>
      </div>
    </aside>
  );
};
