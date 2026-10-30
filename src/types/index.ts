/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'instagram'
  | 'url'
  | 'number'
  | 'multiple_choice'
  | 'multi_select'
  | 'dropdown'
  | 'yes_no'
  | 'opinion_scale'
  | 'rating_stars'
  | 'rating_scale'
  | 'nps'
  | 'date'
  | 'consent'
  | 'info_text'
  | 'section_divider'
  | 'welcome_screen'
  | 'thank_you_screen';

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type RuleAction = 'show_field' | 'hide_field' | 'jump_to_field';

export interface FormRuleCondition {
  fieldId: string;
  operator: RuleOperator;
  value: string | number | boolean;
}

export interface FormRule {
  id: string;
  targetFieldId: string;
  action: RuleAction;
  combinator: 'AND' | 'OR';
  conditions: FormRuleCondition[];
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  validation: FormFieldValidation;
  properties?: {
    minScale?: number;
    maxScale?: number;
    minScaleLabel?: string;
    maxScaleLabel?: string;
    maxStars?: number;
    consentText?: string;
    buttonText?: string;
    showBackButton?: boolean;
    autoAdvance?: boolean;
    redirectUrl?: string;
  };
}

export interface FormTheme {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  borderRadius: string; // 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-2xl'
  fontFamily: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface FormSettings {
  mode: 'conversational' | 'classic';
  showProgressBar: boolean;
  allowKeyboardNavigation: boolean;
  redirectOnCompletion?: string;
  closeAfterSubmissions?: number;
  closeAfterDate?: string;
  closedMessage?: string;
  isClosed?: boolean;
  notifyOnSubmissionEmail?: string;
  collectGeoData?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Form {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  fields: FormField[];
  rules: FormRule[];
  theme: FormTheme;
  settings: FormSettings;
  stats: {
    views: number;
    starts: number;
    completions: number;
  };
}

export type LeadStatus =
  | 'novo_lead'
  | 'contatado'
  | 'call_agendada'
  | 'call_realizada'
  | 'proposta_enviada'
  | 'em_negociacao'
  | 'cliente'
  | 'nao_convertido'
  | 'arquivado';

export interface ContactActivity {
  id: string;
  type: 'form_submitted' | 'status_changed' | 'note_added' | 'whatsapp_clicked';
  title: string;
  description: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  status: LeadStatus;
  tags: string[];
  source: string; // Form title or slug
  createdAt: string;
  updatedAt: string;
  notes?: string;
  consentGiven: boolean;
  consentDate?: string;
  submissionsCount: number;
  latestSubmissionId?: string;
  activities: ContactActivity[];
  customProperties?: Record<string, string | number | boolean>;
}

export interface SubmissionAnswer {
  fieldId: string;
  fieldTitle: string;
  fieldType: FormFieldType;
  value: any;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  formSlug: string;
  formTitle: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  answers: Record<string, any>;
  structuredAnswers: SubmissionAnswer[];
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface AnalyticsEvent {
  id: string;
  formId: string;
  formSlug: string;
  type: 'view' | 'start' | 'field_reached' | 'field_answered' | 'complete' | 'abandon';
  fieldId?: string;
  createdAt: string;
  sessionId: string;
}

export interface BrandingConfig {
  companyName: string;
  companyTagline: string;
  companyLogo: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userAvatar: string;
  themeStyle: 'dark-light' | 'dark' | 'light';
  primaryAccent: string;
  showLogoOnPublicForms: boolean;
  brandAesthetic: 'horya-zen' | 'corporate-slate' | 'minimalist-dark';
}

export interface DatabaseState {
  forms: Form[];
  submissions: FormSubmission[];
  contacts: Contact[];
  events: AnalyticsEvent[];
  templates: Form[];
  organization: {
    name: string;
    brandColor: string;
    adminEmail: string;
    lgpdDataRetentionDays: number;
    privacyPolicyUrl: string;
  };
  branding?: BrandingConfig;
}

