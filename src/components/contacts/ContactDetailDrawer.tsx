/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Instagram,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  FileText,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { Contact, LeadStatus } from '../../types/index.ts';
import { formatWhatsAppUrl } from '../../lib/contact-engine.ts';

interface ContactDetailDrawerProps {
  contact: Contact | null;
  onClose: () => void;
  onUpdateStatus: (contactId: string, status: LeadStatus) => Promise<void>;
  onUpdateNotes: (contactId: string, notes: string) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
}

export const ContactDetailDrawer: React.FC<ContactDetailDrawerProps> = ({
  contact,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteContact,
}) => {
  if (!contact) return null;

  const [notes, setNotes] = useState(contact.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const statusOptions: { value: LeadStatus; label: string; color: string }[] = [
    { value: 'novo_lead', label: 'Novo lead', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'contatado', label: 'Contatado', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'call_agendada', label: 'Call agendada', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { value: 'call_realizada', label: 'Call realizada', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { value: 'proposta_enviada', label: 'Proposta enviada', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    { value: 'em_negociacao', label: 'Em negociação', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { value: 'cliente', label: 'Cliente', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'nao_convertido', label: 'Não convertido', color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
    { value: 'arquivado', label: 'Arquivado', color: 'bg-neutral-800 text-neutral-500 border-neutral-700' },
  ];

  const waUrl = contact.whatsapp || contact.phone
    ? formatWhatsAppUrl(contact.whatsapp || contact.phone || '', `Olá ${contact.name}, sou da equipe Northorya de Governança Pessoal.`)
    : null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateNotes(contact.id, notes);
    setIsSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-end">
      <div className="w-full max-w-xl h-full bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-lg font-bold text-neutral-100">
                {contact.name}
              </h3>
              <div className="text-xs text-neutral-500 font-mono mt-0.5">
                Origem: {contact.source} · Cadastrado em {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lead Status Selector */}
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Status no Funil Comercial (CRM)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => onUpdateStatus(contact.id, st.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    contact.status === st.value
                      ? `${st.color} ring-1 ring-amber-500/40 shadow-sm`
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details & WhatsApp Link */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Canais de Contato
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Priority */}
              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-semibold uppercase flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp (Prioritário)</span>
                </span>
                <div className="font-mono text-xs text-neutral-200">
                  {contact.phone || contact.whatsapp || 'Não informado'}
                </div>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-1"
                  >
                    <span>Abrir Conversa WhatsApp</span>
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Email */}
              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-500 font-semibold uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-400" />
                  <span>E-mail</span>
                </span>
                <div className="font-mono text-xs text-neutral-200 truncate">
                  {contact.email || 'Não informado'}
                </div>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium pt-1"
                  >
                    <span>Enviar E-mail</span>
                  </a>
                )}
              </div>
            </div>

            {contact.instagram && (
              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-neutral-400">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </span>
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-200 font-mono hover:text-amber-400"
                >
                  @{contact.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Tags & Segmentos</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs text-neutral-300 bg-neutral-800/80 border border-neutral-700/80 px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Anotações Internas do Consultor</span>
              </h4>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
              >
                {notesSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{notesSaved ? 'Salvo!' : isSavingNotes ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações confidenciais sobre este lead ou progresso das sessões..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* LGPD & Consent Record */}
          <div className="p-3 bg-neutral-950/40 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-300 block">
                Consentimento Registrado sob a LGPD
              </span>
              <span className="text-[11px] text-neutral-500 block">
                {contact.consentGiven
                  ? `Autorização concedida pelo titular em ${new Date(contact.consentDate || contact.createdAt).toLocaleString('pt-BR')}.`
                  : 'Consentimento implícito na submissão do formulário.'}
              </span>
            </div>
          </div>

          {/* Activity Log */}
          {contact.activities && contact.activities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Histórico de Atividades</span>
              </h4>
              <div className="space-y-2">
                {contact.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 bg-neutral-950/40 border border-neutral-800/60 rounded-lg text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-neutral-300 font-medium">
                      <span>{act.title}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(act.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    {act.description && (
                      <p className="text-[11px] text-neutral-500">{act.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-neutral-800 mt-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir permanentemente este contato (Direito ao Esquecimento LGPD)?')) {
                onDeleteContact(contact.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Contato</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
