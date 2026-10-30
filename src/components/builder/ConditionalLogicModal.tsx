/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, GitFork, ArrowRight, Check } from 'lucide-react';
import { FormField, FormRule, FormRuleCondition, RuleOperator } from '../../types/index.ts';

interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FormField[];
  rules: FormRule[];
  onSaveRules: (rules: FormRule[]) => void;
}

export const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  fields,
  rules,
  onSaveRules,
}) => {
  const [currentRules, setCurrentRules] = useState<FormRule[]>(rules);

  if (!isOpen) return null;

  // Only interactive fields can be targets or sources
  const eligibleFields = fields.filter(
    (f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen' && f.type !== 'section_divider'
  );

  const handleAddRule = () => {
    if (eligibleFields.length < 2) return;
    const newRule: FormRule = {
      id: `rule_${Date.now()}`,
      targetFieldId: eligibleFields[1]?.id || eligibleFields[0]?.id,
      action: 'show_field',
      combinator: 'AND',
      conditions: [
        {
          fieldId: eligibleFields[0]?.id,
          operator: 'equals',
          value: 'Sim',
        },
      ],
    };
    setCurrentRules([...currentRules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    const updated = [...currentRules];
    updated.splice(index, 1);
    setCurrentRules(updated);
  };

  const handleUpdateRule = (index: number, updates: Partial<FormRule>) => {
    const updated = [...currentRules];
    updated[index] = { ...updated[index], ...updates };
    setCurrentRules(updated);
  };

  const handleAddCondition = (ruleIndex: number) => {
    const updated = [...currentRules];
    const rule = updated[ruleIndex];
    rule.conditions.push({
      fieldId: eligibleFields[0]?.id,
      operator: 'equals',
      value: '',
    });
    setCurrentRules(updated);
  };

  const handleUpdateCondition = (
    ruleIndex: number,
    condIndex: number,
    updates: Partial<FormRuleCondition>
  ) => {
    const updated = [...currentRules];
    const rule = updated[ruleIndex];
    rule.conditions[condIndex] = { ...rule.conditions[condIndex], ...updates };
    setCurrentRules(updated);
  };

  const handleRemoveCondition = (ruleIndex: number, condIndex: number) => {
    const updated = [...currentRules];
    const rule = updated[ruleIndex];
    rule.conditions.splice(condIndex, 1);
    if (rule.conditions.length === 0) {
      updated.splice(ruleIndex, 1);
    }
    setCurrentRules(updated);
  };

  const handleSave = () => {
    onSaveRules(currentRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Lógica Condicional & Saltos
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exiba ou oculte perguntas dinamicamente com base nas respostas anteriores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {currentRules.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl space-y-3">
              <GitFork className="w-8 h-8 text-neutral-600 mx-auto" />
              <div className="text-sm font-medium text-neutral-300">
                Nenhuma regra condicional ativa
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Crie fluxos inteligentes: por exemplo, pergunte sobre o relacionamento apenas se a pessoa responder "Sim" para estar em uma relação.
              </p>
              <button
                onClick={handleAddRule}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Criar Primeira Regra</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {currentRules.map((rule, ruleIdx) => (
                <div
                  key={rule.id}
                  className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                      <span>Regra #{ruleIdx + 1}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveRule(ruleIdx)}
                      className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      title="Excluir regra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Conditions List */}
                  <div className="space-y-3">
                    <div className="text-xs text-neutral-400 font-medium">
                      SE as seguintes condições forem atendidas:
                    </div>

                    {rule.conditions.map((cond, condIdx) => (
                      <div
                        key={condIdx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                      >
                        {/* Source Field */}
                        <select
                          value={cond.fieldId}
                          onChange={(e) =>
                            handleUpdateCondition(ruleIdx, condIdx, { fieldId: e.target.value })
                          }
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 flex-1"
                        >
                          {eligibleFields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.title || `Campo (${f.type})`}
                            </option>
                          ))}
                        </select>

                        {/* Operator */}
                        <select
                          value={cond.operator}
                          onChange={(e) =>
                            handleUpdateCondition(ruleIdx, condIdx, {
                              operator: e.target.value as RuleOperator,
                            })
                          }
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="equals">For igual a</option>
                          <option value="not_equals">For diferente de</option>
                          <option value="contains">Contiver</option>
                          <option value="greater_than">For maior que</option>
                          <option value="less_than">For menor que</option>
                          <option value="is_not_empty">Estiver preenchido</option>
                          <option value="is_empty">Estiver vazio</option>
                        </select>

                        {/* Value (if not is_empty / is_not_empty) */}
                        {cond.operator !== 'is_empty' && cond.operator !== 'is_not_empty' && (
                          <input
                            type="text"
                            value={String(cond.value ?? '')}
                            onChange={(e) =>
                              handleUpdateCondition(ruleIdx, condIdx, { value: e.target.value })
                            }
                            placeholder="Valor esperado"
                            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 flex-1"
                          />
                        )}

                        {rule.conditions.length > 1 && (
                          <button
                            onClick={() => handleRemoveCondition(ruleIdx, condIdx)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 self-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Target Action */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                    <span className="text-amber-500 font-semibold uppercase text-[11px]">
                      ENTÃO:
                    </span>

                    <select
                      value={rule.action}
                      onChange={(e) =>
                        handleUpdateRule(ruleIdx, {
                          action: e.target.value as any,
                        })
                      }
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="show_field">Exibir a pergunta</option>
                      <option value="hide_field">Ocultar a pergunta</option>
                    </select>

                    <select
                      value={rule.targetFieldId}
                      onChange={(e) =>
                        handleUpdateRule(ruleIdx, { targetFieldId: e.target.value })
                      }
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 flex-1"
                    >
                      {eligibleFields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title || `Campo (${f.type})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRule}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Adicionar Outra Regra</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Regras</span>
          </button>
        </div>
      </div>
    </div>
  );
};
