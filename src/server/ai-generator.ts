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
  let formDesc = 'Diagnóstico e questionário estruturado.';

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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like an explicit title at the beginning
    if (fields.length === 1 && !currentField) {
      if (line.toLowerCase().startsWith('título:') || line.toLowerCase().startsWith('titulo:')) {
        formTitle = line.replace(/t[ií]tulo:\s*/i, '').trim();
        fields[0].title = formTitle;
        continue;
      }
    }

    // Question line matching: e.g. "1. Qual seu nome?", "Pergunta 2: ...", line ending with "?", or line containing "?"
    const numberedMatch = line.match(/^(\d+[\.\-\)]|[Qq]\d+[\.\-\):]|\*|\-)\s*(.+)/);
    const endsWithQuestion = line.endsWith('?') || (line.includes('?') && line.length < 200);
    const startsWithKeyword = /^(pergunta|questão|diagnóstico|item)\s*\d*[\:\.\-]/i.test(line);

    const isQuestion =
      (numberedMatch && (numberedMatch[2].includes('?') || !numberedMatch[2].match(/^[a-zA-Z0-9\s]{1,3}$/))) ||
      endsWithQuestion ||
      startsWithKeyword;

    if (isQuestion && !line.match(/^([a-zA-Z][\.\-\)]|\-|\*|•)\s+/)) {
      if (currentField && currentField.title) {
        fields.push(finalizeField(currentField, fieldCounter++));
      }

      const qText = numberedMatch ? numberedMatch[2].trim() : line.trim();
      currentField = detectFieldFromQuestionText(qText);
      continue;
    }

    // Option line matching: e.g. "a) Opção 1", "- Sim", "1 - Discordo", "* Opção", "• Opção", or plain lines following a question
    const optionPrefixMatch = line.match(/^([a-zA-Z][\.\-\)]|\-|\*|•|\d+[\.\-\)]|\[\s*\])\s*(.+)/);
    
    // Check if this line is an option: either has bullet prefix OR current question is active and line is short without question mark
    const isUnbulletedOption =
      currentField &&
      !line.includes('?') &&
      line.length < 140 &&
      (currentField.type === 'multiple_choice' ||
       currentField.type === 'multi_select' ||
       (currentField.options && currentField.options.length > 0) ||
       /^(quais|qual|selecione|escolha|assinale|marque)\b/i.test(currentField.title || ''));

    if ((optionPrefixMatch || isUnbulletedOption) && currentField) {
      const optLabel = optionPrefixMatch ? optionPrefixMatch[2].trim() : line.trim();
      currentField.options = currentField.options || [];
      currentField.options.push({
        id: `opt_${Date.now()}_${currentField.options.length + 1}`,
        label: optLabel,
        value: optLabel,
      });

      // Automatically upgrade type to multiple_choice if it was previously short_text or date
      if (currentField.type === 'short_text' || currentField.type === 'date') {
        const titleLower = (currentField.title || '').toLowerCase();
        if (titleLower.includes('quais') || titleLower.includes('selecione todas') || titleLower.includes('todas as')) {
          currentField.type = 'multi_select';
        } else {
          currentField.type = 'multiple_choice';
        }
      }
      continue;
    }

    // Additional description or instructions for the current question
    if (currentField) {
      if (!currentField.description) {
        currentField.description = line;
      } else {
        currentField.description += `\n${line}`;
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
    title: 'Respostas Registradas com Sucesso',
    description: 'Agradecemos pelo seu tempo e transparência. Seus dados foram salvos com segurança.',
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

  if (/\b(nome|nome completo|seu nome)\b/i.test(lower)) {
    type = 'full_name';
  } else if (/\b(email|e-mail)\b/i.test(lower)) {
    type = 'email';
  } else if (/\b(whatsapp|telefone|celular|fone|contato)\b/i.test(lower)) {
    type = 'phone';
  } else if (/\b(instagram|@)\b/i.test(lower)) {
    type = 'instagram';
    required = false;
  } else if (/\b(quais|quais das|selecione todas|assinale todas)\b/i.test(lower)) {
    type = 'multi_select';
  } else if (/\b(qual das|qual dos|escolha uma|marque a opção)\b/i.test(lower)) {
    type = 'multiple_choice';
  } else if (/\b(descreva|explique|detalhe|comente|conte sobre|escreva detalhadamente|em suas palavras)\b/i.test(lower)) {
    type = 'long_text';
  } else if (/\b(escala de 0 a 10|de 0 a 10|nota de 0 a 10|de zero a dez)\b/i.test(lower)) {
    type = 'opinion_scale';
  } else if (/\b(estrelas|de 1 a 5 estrelas|avaliação de 1 a 5)\b/i.test(lower)) {
    type = 'rating_stars';
  } else if (/\b(nps|recomendaria|indicaria|probabilidade de indicar)\b/i.test(lower)) {
    type = 'nps';
  } else if (/\b(sim ou não|sim\/não|\(s\/n\))\b/i.test(lower) || lower.endsWith('? (sim/não)')) {
    type = 'yes_no';
  } else if (/\b(data de nascimento|qual a data|em qual data|qual data|data do evento|data de início)\b/i.test(lower)) {
    // Only match real dates, NEVER match on conversational "quando você..."
    type = 'date';
  } else if (/\b(concorda|lgpd|termos|autorizo|privacidade|consentimento)\b/i.test(lower)) {
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
Sua missão é transformar o texto bruto fornecido pelo usuário em um formulário profissional e completo no padrão Typeform.

Analise cada pergunta, contexto, opções e intenção do usuário no texto abaixo:
"""
${rawText}
"""

REGRAS CRÍTICAS DE CONVERSÃO:
1. PERGUNTAS COM OPÇÕES: Quando uma pergunta for seguida por alternativas de resposta (sejam numeradas, com letras A-B-C, marcadores de traço ou linhas soltas de texto):
   - O tipo "type" DEVE ser obrigatoriamente "multiple_choice" (se for escolha única) ou "multi_select" (se puder marcar mais de uma).
   - Coloque TODAS as alternativas de resposta dentro do array "options" como [{"label": "Texto da opção", "value": "Texto da opção"}].
   - NUNCA jogue as alternativas de resposta dentro do campo "description"!
2. TIPO "DATE" (DATA): Use "date" EXCLUSIVAMENTE para perguntas que pedem uma data de calendário real (ex: "Data de nascimento", "Qual data você prefere?"). NUNCA use "date" para perguntas reflexivas que começam com "Quando você..." (ex: "Quando você pensa no seu momento atual..." é multiple_choice ou long_text, JAMAIS date!).
3. PRESERVAÇÃO TOTAL: Mantenha todos os detalhes, nuances, alternativas e textos exatos enviados pelo usuário.

Retorne um JSON estrito contendo:
- "title": Título elegante do formulário (sugestão: "${suggestedTitle || 'Diagnóstico Estruturado'}").
- "description": Descrição de apoio.
- "fields": Lista estruturada com TODAS as perguntas identificadas no texto:
  - "type": Escolha entre: "multiple_choice", "multi_select", "dropdown", "short_text", "long_text", "full_name", "email", "phone", "instagram", "number", "yes_no", "opinion_scale", "rating_stars", "rating_scale", "nps", "date", "consent".
  - "title": O enunciado da pergunta, limpo e direto.
  - "description": Instruções de apoio adicionais (opcional, sem incluir as opções).
  - "placeholder": Exemplo de resposta (opcional).
  - "required": booleano se o campo é obrigatório.
  - "options": lista de opções [{"label": "...", "value": "..."}] para multiple_choice, multi_select ou dropdown.
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
