/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Lock,
  Globe,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { Form } from '../../types/index.ts';

interface SharePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
  onUpdateSlug: (newSlug: string) => void;
  onToggleStatus: (published: boolean) => void;
  onOpenPublic: (slug: string) => void;
}

export const SharePublishModal: React.FC<SharePublishModalProps> = ({
  isOpen,
  onClose,
  form,
  onUpdateSlug,
  onToggleStatus,
  onOpenPublic,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [slugInput, setSlugInput] = useState(form.slug);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/?form=${form.slug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="650" frameborder="0" allow="camera; microphone; autoplay; encrypted-media;"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleSaveSlug = () => {
    const clean = slugInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    onUpdateSlug(clean);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Publicação & Compartilhamento
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Distribua seu formulário através de links exclusivos, QR code ou incorporação em websites.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status & Version Strip */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  form.status === 'published' ? 'bg-emerald-500' : 'bg-neutral-600'
                }`}
              />
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  Status: {form.status === 'published' ? 'Publicado e Aceitando Respostas' : 'Rascunho Privado'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Versão Atual: v{form.version} · Criado em {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <button
              onClick={() => onToggleStatus(form.status !== 'published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                form.status === 'published'
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950'
              }`}
            >
              {form.status === 'published' ? 'Desativar Formulário' : 'Publicar Agora'}
            </button>
          </div>

          {/* Exclusive Public URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Link Público Exclusivo
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 truncate">
                {publicUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={() => onOpenPublic(form.slug)}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
                title="Abrir formulário em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slug Customizer */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Personalizar Slug da URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">forms.northorya.com/</span>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
              />
              {slugInput !== form.slug && (
                <button
                  onClick={handleSaveSlug}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg border border-neutral-700 cursor-pointer"
                >
                  Salvar Slug
                </button>
              )}
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Código de Incorporação (iFrame)
              </label>
              <button
                onClick={handleCopyEmbed}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
              >
                {copiedEmbed ? 'Código copiado!' : 'Copiar código iFrame'}
              </button>
            </div>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-[11px] font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>

          {/* Security & Spam Notice (Section 10 & 18) */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/60 text-neutral-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Este formulário conta com proteção contra spam, sanitização de entrada e registro de consentimento LGPD de ponta a ponta.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-end bg-neutral-950">
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
