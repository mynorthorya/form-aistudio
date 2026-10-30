/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormField, FormRule, FormRuleCondition } from '../types/index.ts';

/**
 * Checks a single condition against current answers
 */
export function checkCondition(
  condition: FormRuleCondition,
  answers: Record<string, any>
): boolean {
  const rawValue = answers[condition.fieldId];
  const targetValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return String(rawValue ?? '').trim().toLowerCase() === String(targetValue ?? '').trim().toLowerCase();

    case 'not_equals':
      return String(rawValue ?? '').trim().toLowerCase() !== String(targetValue ?? '').trim().toLowerCase();

    case 'contains':
      if (Array.isArray(rawValue)) {
        return rawValue.some((v) => String(v).toLowerCase().includes(String(targetValue).toLowerCase()));
      }
      return String(rawValue ?? '').toLowerCase().includes(String(targetValue ?? '').toLowerCase());

    case 'greater_than':
      return Number(rawValue) > Number(targetValue);

    case 'less_than':
      return Number(rawValue) < Number(targetValue);

    case 'is_empty':
      return rawValue === undefined || rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0);

    case 'is_not_empty':
      return rawValue !== undefined && rawValue !== null && rawValue !== '' && (!Array.isArray(rawValue) || rawValue.length > 0);

    default:
      return true;
  }
}

/**
 * Determines whether a field should be visible based on active form rules and current answers
 */
export function isFieldVisible(
  fieldId: string,
  rules: FormRule[] = [],
  answers: Record<string, any> = {}
): boolean {
  // Find all rules targeting this field
  const fieldRules = rules.filter((r) => r.targetFieldId === fieldId);
  if (fieldRules.length === 0) {
    return true; // Visible by default if no rules target it
  }

  for (const rule of fieldRules) {
    const results = rule.conditions.map((c) => checkCondition(c, answers));
    const passed =
      rule.combinator === 'OR'
        ? results.some(Boolean)
        : results.every(Boolean);

    if (rule.action === 'show_field') {
      return passed;
    }
    if (rule.action === 'hide_field') {
      return !passed;
    }
  }

  return true;
}

/**
 * Validates a field value against its schema
 */
export function validateFieldValue(
  field: FormField,
  value: any
): { valid: boolean; error?: string } {
  const isRequired = field.validation?.required;

  // Empty check
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (isRequired && isEmpty) {
    return {
      valid: false,
      error: field.validation?.errorMessage || 'Este campo é obrigatório.',
    };
  }

  if (isEmpty) {
    return { valid: true };
  }

  // Type specific validation
  if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return { valid: false, error: 'Por favor, insira um e-mail válido.' };
    }
  }

  if (field.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: 'Por favor, insira um número válido.' };
    }
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return { valid: false, error: `O valor mínimo é ${field.validation.min}.` };
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return { valid: false, error: `O valor máximo é ${field.validation.max}.` };
    }
  }

  if (field.type === 'consent' && isRequired && value !== true) {
    return { valid: false, error: 'Você precisa concordar com os termos para prosseguir.' };
  }

  if (field.validation?.minLength && String(value).length < field.validation.minLength) {
    return { valid: false, error: `Mínimo de ${field.validation.minLength} caracteres.` };
  }

  if (field.validation?.maxLength && String(value).length > field.validation.maxLength) {
    return { valid: false, error: `Máximo de ${field.validation.maxLength} caracteres.` };
  }

  return { valid: true };
}

/**
 * Calculates current progress percentage given visible fields and answers
 */
export function calculateProgress(
  fields: FormField[],
  rules: FormRule[],
  answers: Record<string, any>
): number {
  const visibleInteractiveFields = fields.filter((f) => {
    if (f.type === 'welcome_screen' || f.type === 'thank_you_screen' || f.type === 'info_text' || f.type === 'section_divider') {
      return false;
    }
    return isFieldVisible(f.id, rules, answers);
  });

  if (visibleInteractiveFields.length === 0) return 100;

  let answeredCount = 0;
  for (const f of visibleInteractiveFields) {
    const val = answers[f.id];
    if (val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)) {
      answeredCount++;
    }
  }

  return Math.min(100, Math.round((answeredCount / visibleInteractiveFields.length) * 100));
}
