import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFormFromRawText } from './ai-generator.ts';

test('ai-generator: parseFormFromRawText extracts questions, types, and options', () => {
  const rawText = `
Título: Diagnóstico de Equilíbrio Emocional
1. Qual seu nome completo?
2. Qual seu melhor e-mail corporativo?
3. WhatsApp para contato:
4. Em uma escala de 0 a 10, como está sua clareza hoje?
5. Qual a sua área de atuação principal?
   - Saúde e Medicina
   - Tecnologia e Engenharia
   - Gestão e Finanças
   - Outra
6. Você está enfrentando momentos de estresse frequente? (Sim/Não)
7. Descreva seu maior obstáculo recente:
8. Concordo com os termos e LGPD
`;

  const parsed = parseFormFromRawText(rawText);

  assert.equal(parsed.title, 'Diagnóstico de Equilíbrio Emocional');
  assert.ok(parsed.fields && parsed.fields.length >= 8);

  const nameField = parsed.fields?.find((f) => f.type === 'full_name');
  assert.ok(nameField);
  assert.equal(nameField.title.includes('nome'), true);

  const emailField = parsed.fields?.find((f) => f.type === 'email');
  assert.ok(emailField);

  const phoneField = parsed.fields?.find((f) => f.type === 'phone');
  assert.ok(phoneField);

  const scaleField = parsed.fields?.find((f) => f.type === 'opinion_scale');
  assert.ok(scaleField);

  const mcField = parsed.fields?.find((f) => f.type === 'multiple_choice');
  assert.ok(mcField);
  assert.equal(mcField.options?.length, 4);

  const yesNoField = parsed.fields?.find((f) => f.type === 'yes_no');
  assert.ok(yesNoField);

  const longTextField = parsed.fields?.find((f) => f.type === 'long_text');
  assert.ok(longTextField);

  const consentField = parsed.fields?.find((f) => f.type === 'consent');
  assert.ok(consentField);
});

test('ai-generator: parseFormFromRawText handles "Quando você pensa... quais..." with unbulleted option lines', () => {
  const promptText = `
Quando você pensa no seu momento atual, quais experiências internas mais gostaria de compreender ou transformar?
Emoções difíceis de administrar
Pensamentos excessivos ou dificuldade de desacelerar
Padrões que continuam se repetindo
Dificuldade de tomar decisões
Medos e inseguranças
Necessidade de controle
Dificuldade de estabelecer limites
Dificuldade de me expressar
Sensação de desconexão ou vazio
Questões relacionadas ao passado
Não consigo identificar claramente o que preciso
Outra: ___
`;

  const parsed = parseFormFromRawText(promptText);
  assert.ok(parsed.fields && parsed.fields.length >= 2);
  const qField = parsed.fields.find((f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen')!;
  assert.ok(qField, 'Question field should exist');
  // Must NOT be 'date'
  assert.notEqual(qField.type, 'date');
  assert.ok(qField.type === 'multiple_choice' || qField.type === 'multi_select');
  assert.ok(qField.options && qField.options.length >= 10);
  assert.equal(qField.options[0].label, 'Emoções difíceis de administrar');
});
