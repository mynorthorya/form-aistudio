/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { Form, FormField, FormFieldType } from '../types/index.ts';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Robust rule-based heuristic parser for unstructured text
 * Used as a zero-latency fallback or offline parser
 */
export function parseFormFromRawText(rawText: string, fallbackTitle?: string): Partial<Form> {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let formTitle = fallbackTitle || 'Novo Formulário Estruturado';
  let formDesc = 'Formulário gerado automaticamente a partir de texto estruturado.';

  const fields: FormField[] = [
    {
      id: `f_welcome_${Date.now()}`,
      type: 'welcome_screen',
      title: formTitle,
      description: formDesc,
      validation: {},
      properties: { buttonText: 'Iniciar Preenchimento' },
    },
  ];

  let currentField: Partial<FormField> | null = null;
  let fieldCounter = 1;

  for (const line of lines) {
    // Check if line looks like a title at the beginning
    if (fields.length === 1 && !line.match(/^(\d+[\.\-\)]|[Qq]\d+|\*|-)/) && line.length < 80 && !currentField) {
      if (line.toLowerCase().startsWith('título:') || line.toLowerCase().startsWith('titulo:')) {
        formTitle = line.replace(/t[ií]tulo:\s*/i, '');
        fields[0].title = formTitle;
        continue;
      }
    }

    // Question line matching: e.g. "1. Qual seu nome?", "Pergunta 2: ...", "Q3) ..."
    const questionMatch = line.match(/^(\d+[\.\-\)]|[Qq]\d+[\.\-\):]|\*)\s*(.+)/);

    if (questionMatch) {
      if (currentField && currentField.title) {
        fields.push(finalizeField(currentField, fieldCounter++));
      }

      const qText = questionMatch[2].trim();
      currentField = detectFieldFromQuestionText(qText);
      continue;
    }

    // Option line matching: e.g. "a) Opção 1", "- Sim", "1 - Discordo", "* Opção"
    const optionMatch = line.match(/^([a-zA-Z][\.\-\)]|\-|\*|\d+[\.\-\)])\s*(.+)/);
    if (optionMatch && currentField) {
      const optLabel = optionMatch[2].trim();
      currentField.options = currentField.options || [];
      currentField.options.push({
        id: `opt_${Date.now()}_${currentField.options.length + 1}`,
        label: optLabel,
        value: optLabel,
      });
      // Switch type to multiple_choice if it was short_text
      if (currentField.type === 'short_text') {
        currentField.type = 'multiple_choice';
      }
      continue;
    }

    // Additional description or instructions
    if (currentField) {
      if (!currentField.description) {
        currentField.description = line;
      } else {
        currentField.description += ` ${line}`;
      }
    }
  }

  if (currentField && currentField.title) {
    fields.push(finalizeField(currentField, fieldCounter++));
  }

  // If no fields were detected, provide sensible defaults from the prompt text
  if (fields.length <= 1) {
    fields.push({
      id: `f_q1_${Date.now()}`,
      type: 'short_text',
      title: rawText.slice(0, 100) || 'Qual a sua principal reflexão?',
      description: 'Preencha com suas próprias palavras.',
      validation: { required: true },
    });
  }

  // Add Thank You screen
  fields.push({
    id: `f_thank_you_${Date.now()}`,
    type: 'thank_you_screen',
    title: 'Respostas Registradas',
    description: 'Agradecemos pelo seu tempo. Suas informações foram salvas com segurança.',
    validation: {},
    properties: { buttonText: 'Concluir' },
  });

  return {
    title: formTitle,
    description: formDesc,
    fields,
  };
}

function detectFieldFromQuestionText(text: string): Partial<FormField> {
  const lower = text.toLowerCase();
  let type: FormFieldType = 'short_text';
  let required = true;

  if (lower.includes('nome')) {
    type = 'full_name';
  } else if (lower.includes('e-mail') || lower.includes('email')) {
    type = 'email';
  } else if (lower.includes('whatsapp') || lower.includes('telefone') || lower.includes('celular') || lower.includes('phone')) {
    type = 'phone';
  } else if (lower.includes('instagram') || lower.includes('@')) {
    type = 'instagram';
    required = false;
  } else if (lower.includes('descreva') || lower.includes('explique') || lower.includes('detalhe') || lower.includes('comente') || lower.includes('conte sobre')) {
    type = 'long_text';
  } else if (lower.includes('escala de 0 a 10') || lower.includes('de 0 a 10') || lower.includes('nota de 0 a 10')) {
    type = 'opinion_scale';
  } else if (lower.includes('estrelas') || lower.includes('de 1 a 5 estrelas')) {
    type = 'rating_stars';
  } else if (lower.includes('de 1 a 5') || lower.includes('escala de 1 a 5')) {
    type = 'rating_scale';
  } else if (lower.includes('nps') || lower.includes('recomenda') || lower.includes('indicaria')) {
    type = 'nps';
  } else if (lower.includes('sim ou não') || lower.includes('sim/não') || lower.endsWith('? (sim/não)')) {
    type = 'yes_no';
  } else if (lower.includes('data') || lower.includes('quando') || lower.includes('previsão')) {
    type = 'date';
  } else if (lower.includes('concorda') || lower.includes('lgpd') || lower.includes('termos') || lower.includes('autorizo')) {
    type = 'consent';
  }

  // Remove explicit type markers from title if present (e.g. "(Múltipla escolha)", "[0 a 10]")
  const cleanTitle = text.replace(/\((múltipla escolha|seleção múltipla|sim\/não|0 a 10|1 a 5|obrigatório)\)/gi, '').trim();

  return {
    id: `f_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    title: cleanTitle,
    validation: { required },
    options: [],
  };
}

function finalizeField(field: Partial<FormField>, counter: number): FormField {
  const fType: FormFieldType = field.type || 'short_text';
  const finalField: FormField = {
    id: field.id || `f_${counter}_${Date.now()}`,
    type: fType,
    title: field.title || `Pergunta ${counter}`,
    description: field.description || '',
    validation: field.validation || { required: true },
    options: field.options && field.options.length > 0 ? field.options : undefined,
  };

  if (fType === 'opinion_scale') {
    finalField.properties = { minScale: 0, maxScale: 10, minScaleLabel: 'Mínimo', maxScaleLabel: 'Máximo' };
  } else if (fType === 'rating_stars') {
    finalField.properties = { maxStars: 5 };
  } else if (fType === 'consent') {
    finalField.properties = { consentText: 'Concordo com os termos e autorizo o tratamento de dados (LGPD).' };
  }

  return finalField;
}

/**
 * Generates a complete form structure from text using Gemini 3.8 Flash,
 * with graceful fallback to heuristic parser.
 */
export async function generateFormFromText(rawText: string, suggestedTitle?: string): Promise<Partial<Form>> {
  if (!ai) {
    console.log('[AIGenerator] No GEMINI_API_KEY detected, using built-in heuristic parser.');
    return parseFormFromRawText(rawText, suggestedTitle);
  }

  try {
    const prompt = `Você é o arquiteto de formulários e diagnósticos da NORTHORYA, empresa de tecnologia de governança pessoal e desenvolvimento humano.
Sua missão é transformar o texto bruto fornecido pelo usuário em um formulário profissional e completo.

Analise cada pergunta, contexto, opções e intenção do usuário no texto abaixo:
"""
${rawText}
"""

Retorne um JSON estrito contendo:
- "title": Título elegante e executivo do formulário (sugestão: "${suggestedTitle || 'Diagnóstico Estruturado'}").
- "description": Descrição de apoio clara e acolhedora.
- "fields": Lista estruturada com TODAS as perguntas identificadas no texto:
  - "type": Escolha o melhor entre: "short_text", "long_text", "full_name", "email", "phone", "instagram", "number", "multiple_choice", "multi_select", "dropdown", "yes_no", "opinion_scale", "rating_stars", "rating_scale", "nps", "date", "consent".
  - "title": O enunciado da pergunta, limpo e direto.
  - "description": Instruções adicionais de apoio (opcional).
  - "placeholder": Exemplo de resposta (opcional).
  - "required": booleano se o campo é obrigatório.
  - "options": lista de opções [{"label": "Opção 1", "value": "Opção 1"}] se for multiple_choice, multi_select ou dropdown.
  - "properties": objeto opcional com minScaleLabel, maxScaleLabel se for opinion_scale, ou consentText se for consent.

Inclua também no início da lista uma tela de boas-vindas ("welcome_screen") e no final uma tela de encerramento ("thank_you_screen").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  placeholder: { type: Type.STRING },
                  required: { type: Type.BOOLEAN },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                      },
                      required: ['label', 'value'],
                    },
                  },
                  properties: {
                    type: Type.OBJECT,
                    properties: {
                      buttonText: { type: Type.STRING },
                      minScaleLabel: { type: Type.STRING },
                      maxScaleLabel: { type: Type.STRING },
                      consentText: { type: Type.STRING },
                    },
                  },
                },
                required: ['type', 'title'],
              },
            },
          },
          required: ['title', 'description', 'fields'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Normalize IDs and valid types
    const validFields: FormField[] = (parsed.fields || []).map((f: any, idx: number) => {
      const fieldId = `f_ai_${idx + 1}_${Date.now()}`;
      return {
        id: fieldId,
        type: (f.type as FormFieldType) || 'short_text',
        title: f.title || `Pergunta ${idx + 1}`,
        description: f.description || '',
        placeholder: f.placeholder || '',
        validation: { required: f.required !== false },
        options: f.options?.map((opt: any, optIdx: number) => ({
          id: `opt_${optIdx + 1}_${Date.now()}`,
          label: opt.label,
          value: opt.value || opt.label,
        })),
        properties: f.properties || {},
      };
    });

    return {
      title: parsed.title || suggestedTitle || 'Formulário Criado com IA',
      description: parsed.description || 'Gerado automaticamente pelo motor de inteligência Northorya.',
      fields: validFields,
    };
  } catch (err) {
    console.error('[AIGenerator] Gemini error, falling back to heuristic parser:', err);
    return parseFormFromRawText(rawText, suggestedTitle);
  }
}
