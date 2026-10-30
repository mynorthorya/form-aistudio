import test from 'node:test';
import assert from 'node:assert/strict';
import { checkCondition, isFieldVisible, validateFieldValue, calculateProgress } from './logic-engine.ts';
import { FormField, FormRule } from '../types/index.ts';

test('logic-engine: checkCondition equals & not_equals', () => {
  const condEquals = { fieldId: 'q1', operator: 'equals' as const, value: 'Sim' };
  assert.equal(checkCondition(condEquals, { q1: 'Sim' }), true);
  assert.equal(checkCondition(condEquals, { q1: 'sim' }), true); // Case-insensitive
  assert.equal(checkCondition(condEquals, { q1: 'Não' }), false);

  const condNotEquals = { fieldId: 'q1', operator: 'not_equals' as const, value: 'Sim' };
  assert.equal(checkCondition(condNotEquals, { q1: 'Não' }), true);
  assert.equal(checkCondition(condNotEquals, { q1: 'Sim' }), false);
});

test('logic-engine: isFieldVisible handles show_field rules properly', () => {
  const rules: FormRule[] = [
    {
      id: 'r1',
      targetFieldId: 'q2_details',
      action: 'show_field',
      combinator: 'AND',
      conditions: [{ fieldId: 'q1_choice', operator: 'equals', value: 'Sim' }],
    },
  ];

  // When q1 is 'Não', q2_details should be hidden
  assert.equal(isFieldVisible('q2_details', rules, { q1_choice: 'Não' }), false);

  // When q1 is 'Sim', q2_details should be visible
  assert.equal(isFieldVisible('q2_details', rules, { q1_choice: 'Sim' }), true);

  // Unrelated field without rules should be visible
  assert.equal(isFieldVisible('q3_unrelated', rules, {}), true);
});

test('logic-engine: validateFieldValue validates required & email formats', () => {
  const emailField: FormField = {
    id: 'email_field',
    type: 'email',
    title: 'Seu E-mail',
    validation: { required: true },
  };

  const emptyRes = validateFieldValue(emailField, '');
  assert.equal(emptyRes.valid, false);

  const invalidRes = validateFieldValue(emailField, 'not-an-email');
  assert.equal(invalidRes.valid, false);

  const validRes = validateFieldValue(emailField, 'contato@northorya.com');
  assert.equal(validRes.valid, true);
});

test('logic-engine: calculateProgress returns accurate percentage', () => {
  const fields: FormField[] = [
    { id: 'w1', type: 'welcome_screen', title: 'Boas-vindas', validation: {} },
    { id: 'q1', type: 'short_text', title: 'Pergunta 1', validation: { required: true } },
    { id: 'q2', type: 'short_text', title: 'Pergunta 2', validation: { required: true } },
    { id: 'q3', type: 'short_text', title: 'Pergunta 3', validation: { required: true } },
    { id: 't1', type: 'thank_you_screen', title: 'Obrigado', validation: {} },
  ];

  // 0 of 3 interactive answered = 0%
  assert.equal(calculateProgress(fields, [], {}), 0);

  // 1 of 3 answered = 33%
  assert.equal(calculateProgress(fields, [], { q1: 'Resposta 1' }), 33);

  // 3 of 3 answered = 100%
  assert.equal(calculateProgress(fields, [], { q1: 'A', q2: 'B', q3: 'C' }), 100);
});
