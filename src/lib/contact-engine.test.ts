import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanPhoneNumber, formatWhatsAppUrl, extractContactFromSubmission, findMatchingContact } from './contact-engine.ts';
import { Contact, FormField } from '../types/index.ts';

test('contact-engine: cleanPhoneNumber and formatWhatsAppUrl', () => {
  // Brazilian format with 11 digits
  assert.equal(cleanPhoneNumber('(11) 98765-4321'), '5511987654321');
  assert.equal(cleanPhoneNumber('+55 11 98765-4321'), '5511987654321');
  assert.equal(formatWhatsAppUrl('11987654321'), 'https://wa.me/5511987654321');
  assert.equal(
    formatWhatsAppUrl('11987654321', 'Olá, tudo bem?'),
    'https://wa.me/5511987654321?text=Ol%C3%A1%2C%20tudo%20bem%3F'
  );
});

test('contact-engine: extractContactFromSubmission extracts structured fields', () => {
  const fields: FormField[] = [
    { id: 'f_name', type: 'full_name', title: 'Nome completo', validation: { required: true } },
    { id: 'f_email', type: 'email', title: 'E-mail corporativo', validation: { required: true } },
    { id: 'f_phone', type: 'phone', title: 'WhatsApp', validation: { required: true } },
    { id: 'f_insta', type: 'instagram', title: 'Instagram', validation: {} },
    { id: 'f_consent', type: 'consent', title: 'Termos e LGPD', validation: { required: true } },
  ];

  const answers = {
    f_name: 'Eduardo Batista',
    f_email: 'contato@edbatista.vip',
    f_phone: '(11) 99999-1234',
    f_insta: '@edbatista',
    f_consent: true,
  };

  const contact = extractContactFromSubmission(fields, answers);
  assert.equal(contact.name, 'Eduardo Batista');
  assert.equal(contact.email, 'contato@edbatista.vip');
  assert.equal(contact.whatsapp, '5511999991234');
  assert.equal(contact.instagram, 'edbatista');
  assert.equal(contact.consentGiven, true);
});

test('contact-engine: findMatchingContact matches only on exact email or whatsapp, never name alone', () => {
  const existingContacts: Contact[] = [
    {
      id: 'c1',
      name: 'Carlos Silva',
      email: 'carlos@example.com',
      whatsapp: '5511988887777',
      status: 'cliente',
      tags: ['Mentoria'],
      source: 'Auditoria de Vida',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      consentGiven: true,
      submissionsCount: 1,
      activities: [],
    },
  ];

  // Match by email
  const matchEmail = findMatchingContact(existingContacts, { email: 'carlos@example.com' });
  assert.equal(matchEmail?.id, 'c1');

  // Match by WhatsApp
  const matchPhone = findMatchingContact(existingContacts, { whatsapp: '5511988887777' });
  assert.equal(matchPhone?.id, 'c1');

  // Same name but different email and phone: MUST NOT MATCH
  const noMatch = findMatchingContact(existingContacts, { email: 'outro_carlos@example.com', whatsapp: '5511911112222' });
  assert.equal(noMatch, undefined);
});
