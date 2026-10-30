/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Type,
  AlignLeft,
  User,
  Mail,
  Phone,
  Instagram,
  Link,
  Hash,
  CheckSquare,
  ListFilter,
  ToggleLeft,
  Sliders,
  Star,
  Gauge,
  Calendar,
  ShieldCheck,
  FileText,
  Minus,
  DoorOpen,
  PartyPopper,
  Radio,
} from 'lucide-react';
import { FormFieldType } from '../../types/index.ts';

interface FieldCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFieldType: (type: FormFieldType) => void;
}

export const FieldCatalogModal: React.FC<FieldCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectFieldType,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      name: 'Identificação & Texto',
      fields: [
        { type: 'short_text' as FormFieldType, label: 'Texto Curto', desc: 'Respostas de linha única, frases breves', icon: <Type className="w-4 h-4 text-amber-500" /> },
        { type: 'long_text' as FormFieldType, label: 'Texto Longo', desc: 'Depoimentos, descrições detalhadas', icon: <AlignLeft className="w-4 h-4 text-amber-500" /> },
        { type: 'full_name' as FormFieldType, label: 'Nome Completo', desc: 'Nome do participante com extração de lead', icon: <User className="w-4 h-4 text-blue-400" /> },
        { type: 'email' as FormFieldType, label: 'E-mail', desc: 'Validação automática e chave de lead', icon: <Mail className="w-4 h-4 text-blue-400" /> },
        { type: 'phone' as FormFieldType, label: 'WhatsApp / Telefone', desc: 'Formatação e link direto no CRM', icon: <Phone className="w-4 h-4 text-emerald-400" /> },
        { type: 'instagram' as FormFieldType, label: 'Instagram', desc: 'Perfil do participante (@handle)', icon: <Instagram className="w-4 h-4 text-pink-400" /> },
        { type: 'url' as FormFieldType, label: 'Link / URL', desc: 'Endereço web ou portfólio', icon: <Link className="w-4 h-4 text-neutral-400" /> },
        { type: 'number' as FormFieldType, label: 'Número', desc: 'Idade, valores ou medidas numéricas', icon: <Hash className="w-4 h-4 text-neutral-400" /> },
      ],
    },
    {
      name: 'Seleções & Decisões',
      fields: [
        { type: 'multiple_choice' as FormFieldType, label: 'Múltipla Escolha', desc: 'Opção única com atalhos no teclado', icon: <Radio className="w-4 h-4 text-amber-400" /> },
        { type: 'multi_select' as FormFieldType, label: 'Seleção Múltipla', desc: 'Marcar várias alternativas aplicáveis', icon: <CheckSquare className="w-4 h-4 text-amber-400" /> },
        { type: 'dropdown' as FormFieldType, label: 'Menu Suspenso (Dropdown)', desc: 'Lista compacta de seleção única', icon: <ListFilter className="w-4 h-4 text-amber-400" /> },
        { type: 'yes_no' as FormFieldType, label: 'Sim ou Não', desc: 'Decisão binária com atalhos Y/N', icon: <ToggleLeft className="w-4 h-4 text-emerald-400" /> },
      ],
    },
    {
      name: 'Avaliações & Escalas',
      fields: [
        { type: 'opinion_scale' as FormFieldType, label: 'Escala de Opinião (0 a 10)', desc: 'Mapeamento gradual de clareza ou concordância', icon: <Sliders className="w-4 h-4 text-purple-400" /> },
        { type: 'rating_stars' as FormFieldType, label: 'Avaliação por Estrelas (1 a 5)', desc: 'Percepção de qualidade e satisfação', icon: <Star className="w-4 h-4 text-amber-400" /> },
        { type: 'rating_scale' as FormFieldType, label: 'Escala Numérica (1 a 5)', desc: 'Intensidade, impacto ou custo de gargalos', icon: <Gauge className="w-4 h-4 text-purple-400" /> },
        { type: 'nps' as FormFieldType, label: 'Net Promoter Score (NPS)', desc: 'Detratores, neutros e promotores', icon: <Sliders className="w-4 h-4 text-emerald-400" /> },
      ],
    },
    {
      name: 'Estrutura, Telas & LGPD',
      fields: [
        { type: 'welcome_screen' as FormFieldType, label: 'Tela de Boas-vindas', desc: 'Apresentação institucional e botão de início', icon: <DoorOpen className="w-4 h-4 text-amber-500" /> },
        { type: 'date' as FormFieldType, label: 'Data', desc: 'Agendamentos ou marcos temporais', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
        { type: 'consent' as FormFieldType, label: 'Termo LGPD & Consentimento', desc: 'Aceite de privacidade e base legal', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
        { type: 'info_text' as FormFieldType, label: 'Texto Informativo', desc: 'Orientação sem coleta de dados', icon: <FileText className="w-4 h-4 text-neutral-400" /> },
        { type: 'section_divider' as FormFieldType, label: 'Divisor de Seção', desc: 'Quebra visual e organização em blocos', icon: <Minus className="w-4 h-4 text-neutral-500" /> },
        { type: 'thank_you_screen' as FormFieldType, label: 'Tela de Agradecimento', desc: 'Mensagem final de encerramento e redirecionamento', icon: <PartyPopper className="w-4 h-4 text-amber-400" /> },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Adicionar Nova Pergunta ou Elemento
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Selecione o tipo de campo para incluir no fluxo da sua auditoria.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
                {cat.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.fields.map((f) => (
                  <button
                    key={f.type}
                    onClick={() => {
                      onSelectFieldType(f.type);
                      onClose();
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-amber-500/50 hover:bg-neutral-800/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                        {f.label}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
