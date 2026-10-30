/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Mail,
  Tag,
  Eye,
  Trash2,
  Filter,
  CheckCircle2,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Contact, LeadStatus } from '../../types/index.ts';
import { ContactDetailDrawer } from './ContactDetailDrawer.tsx';
import { formatWhatsAppUrl } from '../../lib/contact-engine.ts';

interface ContactsViewProps {
  contacts: Contact[];
  onUpdateStatus: (contactId: string, status: LeadStatus) => Promise<void>;
  onUpdateNotes: (contactId: string, notes: string) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteContact,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const totalClients = contacts.filter((c) => c.status === 'cliente').length;
  const activeLeads = contacts.filter(
    (c) => c.status !== 'cliente' && c.status !== 'nao_convertido' && c.status !== 'arquivado'
  ).length;

  // Export Contacts CSV
  const handleExportContacts = () => {
    const headers = ['ID', 'Nome', 'Email', 'WhatsApp', 'Instagram', 'Status', 'Origem', 'Tags', 'Data'];
    const rows = contacts.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.email || ''}"`,
      `"${c.phone || c.whatsapp || ''}"`,
      `"${c.instagram || ''}"`,
      c.status,
      `"${c.source}"`,
      `"${c.tags.join('; ')}"`,
      new Date(c.createdAt).toLocaleDateString('pt-BR'),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contatos-crm-northorya-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'novo_lead':
        return <span className="text-blue-400 font-medium">Novo lead</span>;
      case 'contatado':
        return <span className="text-amber-400 font-medium">Contatado</span>;
      case 'call_agendada':
        return <span className="text-purple-400 font-medium">Call agendada</span>;
      case 'call_realizada':
        return <span className="text-indigo-400 font-medium">Call realizada</span>;
      case 'proposta_enviada':
        return <span className="text-pink-400 font-medium">Proposta enviada</span>;
      case 'em_negociacao':
        return <span className="text-orange-400 font-medium">Em negociação</span>;
      case 'cliente':
        return <span className="text-emerald-400 font-bold">Cliente</span>;
      case 'nao_convertido':
        return <span className="text-neutral-500 font-medium">Não convertido</span>;
      case 'arquivado':
        return <span className="text-neutral-600 font-medium">Arquivado</span>;
      default:
        return <span className="text-neutral-400">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100">
            Contatos & CRM de Leads
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Base centralizada de respondentes, clientes, status comercial e canal direto de WhatsApp.
          </p>
        </div>

        <button
          onClick={handleExportContacts}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span>Exportar Base de Contatos</span>
        </button>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <span className="text-[11px] text-neutral-500 font-medium">Total de Contatos</span>
          <div className="text-2xl font-bold font-mono text-neutral-100 mt-1">
            {contacts.length}
          </div>
        </div>
        <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <span className="text-[11px] text-neutral-500 font-medium">Leads em Andamento</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {activeLeads}
          </div>
        </div>
        <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <span className="text-[11px] text-neutral-500 font-medium">Clientes Convertidos</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalClients}
          </div>
        </div>
        <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <span className="text-[11px] text-neutral-500 font-medium">Taxa de Conversão</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {contacts.length > 0 ? Math.round((totalClients / contacts.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'novo_lead', label: 'Novos' },
            { id: 'call_agendada', label: 'Call Agendada' },
            { id: 'em_negociacao', label: 'Em Negociação' },
            { id: 'cliente', label: 'Clientes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou WhatsApp..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-3 px-4">Nome & Contato</th>
                <th className="py-3 px-4">WhatsApp (Prioritário)</th>
                <th className="py-3 px-4">Status no Funil</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Cadastro</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredContacts.map((contact) => {
                const phone = contact.phone || contact.whatsapp;
                const waUrl = phone
                  ? formatWhatsAppUrl(phone, `Olá ${contact.name}, tudo bem? Sou da equipe Northorya de Governança Pessoal.`)
                  : null;

                return (
                  <tr
                    key={contact.id}
                    className="hover:bg-neutral-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-100">{contact.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {contact.email || 'Sem e-mail'}
                        {contact.instagram && ` · @${contact.instagram}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{phone}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.status}
                        onChange={(e) => onUpdateStatus(contact.id, e.target.value as LeadStatus)}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="novo_lead">Novo lead</option>
                        <option value="contatado">Contatado</option>
                        <option value="call_agendada">Call agendada</option>
                        <option value="call_realizada">Call realizada</option>
                        <option value="proposta_enviada">Proposta enviada</option>
                        <option value="em_negociacao">Em negociação</option>
                        <option value="cliente">Cliente</option>
                        <option value="nao_convertido">Não convertido</option>
                        <option value="arquivado">Arquivado</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400 truncate max-w-xs">
                      {contact.source}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 cursor-pointer"
                          title="Abrir ficha completa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir permanentemente o contato ${contact.name}?`)) {
                              onDeleteContact(contact.id);
                            }
                          }}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 cursor-pointer"
                          title="Excluir contato (LGPD)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <ContactDetailDrawer
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdateStatus={async (id, st) => {
          await onUpdateStatus(id, st);
          if (selectedContact) setSelectedContact({ ...selectedContact, status: st });
        }}
        onUpdateNotes={async (id, notes) => {
          await onUpdateNotes(id, notes);
          if (selectedContact) setSelectedContact({ ...selectedContact, notes });
        }}
        onDeleteContact={async (id) => {
          await onDeleteContact(id);
          setSelectedContact(null);
        }}
      />
    </div>
  );
};
