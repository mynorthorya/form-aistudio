/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contact, FormField, FormSubmission, LeadStatus } from '../types/index.ts';

/**
 * Normalizes phone numbers for WhatsApp international links (e.g., +5511999999999)
 */
export function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove non-numeric characters
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  // If Brazilian format without country code (10 or 11 digits), prepend 55
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Formats WhatsApp direct click link
 */
export function formatWhatsAppUrl(phone: string, text?: string): string {
  const clean = cleanPhoneNumber(phone);
  if (!clean) return '';
  const baseUrl = `https://wa.me/${clean}`;
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  return baseUrl;
}

/**
 * Extracts candidate contact information from submission answers
 */
export function extractContactFromSubmission(
  fields: FormField[],
  answers: Record<string, any>
): {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  consentGiven: boolean;
} {
  let name = '';
  let email = '';
  let phone = '';
  let instagram = '';
  let consentGiven = false;

  for (const field of fields) {
    const val = answers[field.id];
    if (val === undefined || val === null || val === '') continue;

    if (field.type === 'full_name' && !name) {
      name = String(val).trim();
    } else if (field.type === 'email' && !email) {
      email = String(val).trim().toLowerCase();
    } else if (field.type === 'phone' && !phone) {
      phone = String(val).trim();
    } else if (field.type === 'instagram' && !instagram) {
      let handle = String(val).trim();
      if (handle.startsWith('@')) handle = handle.substring(1);
      instagram = handle;
    } else if (field.type === 'consent') {
      consentGiven = val === true;
    } else if (field.type === 'short_text') {
      const lowerTitle = field.title.toLowerCase();
      if (!name && (lowerTitle.includes('nome') || lowerTitle.includes('name'))) {
        name = String(val).trim();
      }
    }
  }

  // Fallback name if none found
  if (!name && email) {
    name = email.split('@')[0];
  } else if (!name) {
    name = 'Respondente Anônimo';
  }

  const cleanPhone = cleanPhoneNumber(phone);

  return {
    name,
    email: email || undefined,
    phone: phone || undefined,
    whatsapp: cleanPhone || undefined,
    instagram: instagram || undefined,
    consentGiven,
  };
}

/**
 * Finds matching contact by reliable unique identifier (Exact Email or Exact Clean Phone).
 * NEVER merges on name alone (as enforced by Section 12).
 */
export function findMatchingContact(
  existingContacts: Contact[],
  candidate: { email?: string; whatsapp?: string }
): Contact | undefined {
  if (candidate.email) {
    const match = existingContacts.find(
      (c) => c.email && c.email.toLowerCase() === candidate.email!.toLowerCase()
    );
    if (match) return match;
  }

  if (candidate.whatsapp) {
    const match = existingContacts.find(
      (c) => c.whatsapp && c.whatsapp === candidate.whatsapp
    );
    if (match) return match;
  }

  return undefined;
}
