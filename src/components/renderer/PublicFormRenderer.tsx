/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Star,
  ChevronDown,
} from 'lucide-react';
import { Form, FormField } from '../../types/index.ts';
import { isFieldVisible, validateFieldValue, calculateProgress } from '../../lib/logic-engine.ts';
import { api } from '../../services/api.ts';
import { useBranding } from '../../contexts/BrandingContext.tsx';


interface PublicFormRendererProps {
  form: Form;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onSubmitSuccess?: (answers: Record<string, any>) => void;
}

export const PublicFormRenderer: React.FC<PublicFormRendererProps> = ({
  form,
  isPreview = false,
  onClosePreview,
  onSubmitSuccess,
}) => {
  const { branding } = useBranding();
  const isLight = branding.themeStyle === 'light';
  const bgColor = isLight ? '#F7F5F0' : (form.theme.backgroundColor || '#09090b');
  const textColor = isLight ? '#1C1917' : (form.theme.textColor || '#f4f4f5');
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startedAt] = useState<string>(new Date().toISOString());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Compute visible fields dynamically based on conditional rules
  const visibleFields = form.fields.filter((field) =>
    isFieldVisible(field.id, form.rules, answers)
  );

  const currentField: FormField | undefined = visibleFields[currentStepIndex];
  const isConversational = form.settings.mode === 'conversational';
  const progressPercent = calculateProgress(form.fields, form.rules, answers);

  // Focus input automatically on step change in conversational mode
  useEffect(() => {
    if (isConversational && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentStepIndex, isConversational]);

  // Track initial view event
  useEffect(() => {
    if (!isPreview) {
      api.recordPublicEvent(form.slug, 'view');
    }
  }, [form.slug, isPreview]);

  // Handle value change
  const handleAnswerChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    // Clear error if any
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Validate single field
  const validateField = (field: FormField): boolean => {
    const val = answers[field.id];
    const res = validateFieldValue(field, val);
    if (!res.valid) {
      setFieldErrors((prev) => ({ ...prev, [field.id]: res.error || 'Preencha este campo' }));
      return false;
    }
    return true;
  };

  // Next step in conversational
  const handleNextStep = () => {
    if (!currentField) return;

    // Validate current field
    if (currentField.type !== 'welcome_screen' && currentField.type !== 'thank_you_screen') {
      const isValid = validateField(currentField);
      if (!isValid) return;
    }

    if (currentStepIndex < visibleFields.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Last step -> submit
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isConversational || !form.settings.allowKeyboardNavigation || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a multiline textarea
      if (
        e.target instanceof HTMLTextAreaElement &&
        e.key === 'Enter' &&
        !e.shiftKey
      ) {
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConversational, currentStepIndex, visibleFields, answers, isSubmitted]);

  // Submit all answers
  const handleSubmit = async () => {
    // Validate all visible fields
    let hasError = false;
    const errors: Record<string, string> = {};

    for (const field of visibleFields) {
      if (field.type === 'welcome_screen' || field.type === 'thank_you_screen') continue;
      const res = validateFieldValue(field, answers[field.id]);
      if (!res.valid) {
        errors[field.id] = res.error || 'Campo obrigatório';
        hasError = true;
      }
    }

    if (hasError) {
      setFieldErrors(errors);
      if (isConversational) {
        // Jump to first errored field
        const firstErrorIdx = visibleFields.findIndex((f) => errors[f.id]);
        if (firstErrorIdx !== -1) {
          setCurrentStepIndex(firstErrorIdx);
        }
      }
      return;
    }

    setIsSubmitting(true);
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      10,
      Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    );

    try {
      if (!isPreview) {
        await api.submitPublicForm(form.slug, {
          answers,
          startedAt,
          completedAt,
          durationSeconds,
        });
      }
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(answers);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Erro ao enviar respostas. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Thank You Screen
  const thankYouField = form.fields.find((f) => f.type === 'thank_you_screen');

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex flex-col justify-between p-6 sm:p-12 select-none"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: form.theme.fontFamily || 'Plus Jakarta Sans',
        }}
      >
        <div />
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center mx-auto text-amber-500 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight whitespace-pre-wrap break-words leading-snug ${isLight ? 'text-stone-900' : 'text-neutral-100'}`}>
            {thankYouField?.title || 'Respostas Registradas com Sucesso'}
          </h2>

          <p className={`text-sm ${isLight ? 'text-stone-600' : 'text-neutral-400'} leading-relaxed max-w-md mx-auto whitespace-pre-wrap break-words`}>
            {thankYouField?.description ||
              'Agradecemos sua colaboração e transparência. Seus dados foram salvos com segurança no ecossistema Northorya.'}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            {isPreview ? (
              <button
                onClick={onClosePreview}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Voltar ao Editor
              </button>
            ) : thankYouField?.properties?.redirectUrl ? (
              <a
                href={thankYouField.properties.redirectUrl}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>{thankYouField.properties.buttonText || 'Continuar'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className={`text-center text-[11px] ${isLight ? 'text-stone-400' : 'text-neutral-600'}`}>
          Northorya Forms Studio · Governança Pessoal e Humana
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between select-none relative"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: form.theme.fontFamily || 'Plus Jakarta Sans',
      }}
    >
      {/* Top Preview Banner (if preview mode) */}
      {isPreview && (
        <div className="h-10 bg-amber-500/10 border-b border-amber-500/20 px-4 flex items-center justify-between text-xs text-amber-400 font-medium z-30">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo de Pré-visualização Interativo (Sem salvar no banco)</span>
          </span>
          <button
            onClick={onClosePreview}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-amber-300 text-xs font-semibold cursor-pointer"
          >
            Fechar Preview
          </button>
        </div>
      )}

      {/* Progress Bar (if enabled) */}
      {form.settings.showProgressBar && (
        <div className="w-full bg-neutral-900/60 h-1.5 overflow-hidden fixed top-0 left-0 z-20">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: form.theme.primaryColor || '#D97706',
            }}
          />
        </div>
      )}

      {/* Brand Header */}
      <header className="p-6 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {(form.theme.logoUrl || (branding?.showLogoOnPublicForms && branding?.companyLogo)) && (
            <img
              src={form.theme.logoUrl || branding.companyLogo}
              alt={branding?.companyName || 'Logo'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-contain bg-neutral-950 p-1 ring-1 ring-amber-500/30 shadow-sm"
            />
          )}
          <div>
            <span className="text-xs font-bold tracking-tight uppercase text-neutral-200 block">
              {form.title}
            </span>
            {branding?.companyName && (
              <span className="text-[10px] text-amber-500/80 uppercase font-medium tracking-wider block">
                {branding.companyName}
              </span>
            )}
          </div>
        </div>

        {isConversational && (
          <div className="text-xs text-neutral-400 font-mono px-2.5 py-1 rounded-full bg-neutral-900/60 border border-neutral-800">
            {currentStepIndex + 1} de {visibleFields.length}
          </div>
        )}
      </header>


      {/* Form Body */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-2xl mx-auto">
          {isConversational ? (
            /* CONVERSATIONAL MODE: One Question at a Time */
            currentField && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {/* Step number & Required */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="font-mono font-bold"
                    style={{ color: form.theme.primaryColor || '#D97706' }}
                  >
                    {currentStepIndex + 1} →
                  </span>
                  {currentField.validation?.required && (
                    <span className="text-[10px] text-rose-400 font-medium">
                      * Obrigatório
                    </span>
                  )}
                </div>

                {/* Field Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100 whitespace-pre-wrap break-words leading-snug">
                    {currentField.title}
                  </h2>
                  {currentField.description && (
                    <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap break-words">
                      {currentField.description}
                    </p>
                  )}
                </div>

                {/* Field Input Control */}
                <div className="space-y-3">
                  {renderFieldInput(
                    currentField,
                    answers[currentField.id],
                    (val) => handleAnswerChange(currentField.id, val),
                    inputRef,
                    form.theme
                  )}

                  {fieldErrors[currentField.id] && (
                    <p className="text-xs text-rose-400 font-medium animate-in fade-in">
                      {fieldErrors[currentField.id]}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons for Conversational Mode */}
                <div className="pt-6 flex items-center gap-4">
                  {currentField.type === 'welcome_screen' ? (
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: form.theme.primaryColor || '#D97706' }}
                    >
                      <span>{currentField.properties?.buttonText || 'Iniciar Auditoria'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : currentStepIndex === visibleFields.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: form.theme.primaryColor || '#D97706' }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSubmitting ? 'Enviando...' : 'Finalizar e Enviar Respostas'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: form.theme.primaryColor || '#D97706' }}
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {currentStepIndex > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="p-3 text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer"
                      title="Pergunta anterior"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  {form.settings.allowKeyboardNavigation && (
                    <span className="text-[11px] text-neutral-500 hidden sm:inline">
                      Pressione <strong className="text-neutral-400">Enter ↵</strong>
                    </span>
                  )}
                </div>
              </div>
            )
          ) : (
            /* CLASSIC MODE: All Questions in sequence */
            <div className="space-y-10 py-6">
              {visibleFields
                .filter((f) => f.type !== 'welcome_screen' && f.type !== 'thank_you_screen')
                .map((field, idx) => (
                  <div
                    key={field.id}
                    className="space-y-3 pb-8 border-b border-neutral-800/80 last:border-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-500 font-bold">
                          {idx + 1}.
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-neutral-100 whitespace-pre-wrap break-words leading-snug">
                          {field.title}
                        </h3>
                        {field.validation?.required && (
                          <span className="text-rose-400 text-xs">*</span>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap break-words">
                          {field.description}
                        </p>
                      )}
                    </div>

                    {renderFieldInput(
                      field,
                      answers[field.id],
                      (val) => handleAnswerChange(field.id, val),
                      undefined,
                      form.theme
                    )}

                    {fieldErrors[field.id] && (
                      <p className="text-xs text-rose-400 font-medium">
                        {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                ))}

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: form.theme.primaryColor || '#D97706' }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Todas as Respostas'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding & LGPD notice */}
      <footer className="p-6 text-center text-xs text-neutral-500 border-t border-neutral-900/60 max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-neutral-600" />
          <span>Dados protegidos e tratados sob a LGPD com sigilo profissional.</span>
        </span>
        <span className="font-semibold tracking-wider text-neutral-400 text-[11px]">
          NORTHORYA FORMS
        </span>
      </footer>
    </div>
  );
};

/**
 * Helper to render inputs dynamically based on field type
 */
function renderFieldInput(
  field: FormField,
  value: any,
  onChange: (val: any) => void,
  inputRef?: React.MutableRefObject<any>,
  theme?: any
) {
  switch (field.type) {
    case 'short_text':
    case 'full_name':
    case 'email':
    case 'phone':
    case 'instagram':
    case 'url':
    case 'number':
      return (
        <input
          ref={inputRef}
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Sua resposta aqui...'}
          className="w-full bg-neutral-900/70 border-b-2 border-neutral-700 focus:border-amber-500 py-3 px-1 text-lg sm:text-xl text-neutral-100 placeholder-neutral-600 focus:outline-none transition-colors"
        />
      );

    case 'long_text':
      return (
        <textarea
          ref={inputRef}
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Compartilhe suas reflexões...'}
          className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 text-sm sm:text-base text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2.5">
          {(field.options || []).map((opt, i) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-600/10 text-neutral-100 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950'
                        : 'border border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-500" />}
              </button>
            );
          })}
        </div>
      );

    case 'multi_select': {
      const selectedList: string[] = Array.isArray(value) ? value : [];
      const toggleOption = (val: string) => {
        if (selectedList.includes(val)) {
          onChange(selectedList.filter((v) => v !== val));
        } else {
          onChange([...selectedList, val]);
        }
      };

      return (
        <div className="space-y-2.5">
          {(field.options || []).map((opt) => {
            const isSelected = selectedList.includes(opt.value);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-600/10 text-neutral-100 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950'
                        : 'border border-neutral-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    case 'yes_no':
      return (
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          {['Sim', 'Não'].map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`py-4 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-600/10 text-amber-400 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case 'dropdown':
      return (
        <div className="relative">
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
          >
            <option value="">Selecione uma opção...</option>
            {(field.options || []).map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-4 top-3.5 pointer-events-none" />
        </div>
      );

    case 'opinion_scale':
    case 'nps': {
      const min = field.properties?.minScale ?? 0;
      const max = field.properties?.maxScale ?? 10;
      const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
            {items.map((num) => {
              const isSelected = value === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={`aspect-square rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-neutral-950 scale-105 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-neutral-500 pt-1">
            <span>{field.properties?.minScaleLabel || 'Nenhuma'}</span>
            <span>{field.properties?.maxScaleLabel || 'Total'}</span>
          </div>
        </div>
      );
    }

    case 'rating_stars': {
      const maxStars = field.properties?.maxStars || 5;
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: maxStars }).map((_, i) => {
            const starVal = i + 1;
            const isFilled = (value || 0) >= starVal;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(starVal)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isFilled
                    ? 'border-amber-500/80 bg-amber-500/20 text-amber-400'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
                }`}
              >
                <Star className={`w-6 h-6 ${isFilled ? 'fill-amber-400' : ''}`} />
              </button>
            );
          })}
        </div>
      );
    }

    case 'rating_scale': {
      const min = field.properties?.minScale ?? 1;
      const max = field.properties?.maxScale ?? 5;
      const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="flex items-center gap-2">
          {items.map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={`w-12 h-12 rounded-xl border font-mono font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-neutral-950 scale-105'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      );
    }

    case 'date':
      return (
        <input
          ref={inputRef}
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 cursor-pointer"
        />
      );

    case 'consent':
      return (
        <label className="flex items-start gap-3.5 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 cursor-pointer hover:border-neutral-700 transition-colors">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 rounded border-neutral-700 text-amber-600 focus:ring-0 mt-0.5 cursor-pointer"
          />
          <span className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {field.properties?.consentText ||
              'Concordo com os termos de confidencialidade e tratamento dos dados pela Northorya sob a LGPD.'}
          </span>
        </label>
      );

    default:
      return null;
  }
}
