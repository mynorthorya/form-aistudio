/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Terminal,
  Cpu,
  Key,
  Database,
  Check,
  Sparkles,
  Server,
  Lock,
  Camera,
  Upload,
  User,
  Building2,
  Palette,
  Eye,
  Sliders,
  Globe,
  Copy,
  ExternalLink,
  Share2,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useBranding } from '../../contexts/BrandingContext.tsx';
import { ASSETS } from '../../lib/assets.ts';

export const SettingsView: React.FC = () => {
  const { branding, updateBranding, openBrandingModal, resetToDefaults } = useBranding();
  const [retentionDays, setRetentionDays] = useState(365);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const isLight = branding.themeStyle === 'light';

  const fileInputPhotoRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateBranding({ userAvatar: result });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateBranding({ companyLogo: result });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFullBackup = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportDatabase();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-completo-northorya-forms-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar backup');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <span>Configurações & Identidade</span>
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Dark Light
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Personalize foto do perfil, logotipo corporativo, identidade visual dos formulários e governança LGPD.
          </p>
        </div>

        <button
          onClick={() => openBrandingModal('profile')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Editor Rápido de Foto & Logo</span>
        </button>
      </div>

      {/* 1. SECTION: IDENTIDADE VISUAL, FOTO & LOGOTIPO DA EMPRESA */}
      <div className="p-6 bg-[#101014] border border-[#242228] rounded-2xl space-y-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2 text-neutral-200">
            <Palette className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Identidade Visual, Foto & Logotipo</h3>
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium">
            Branding HORYA / Northorya Ativo
          </span>
        </div>

        {/* Visual Cards Grid: Photo and Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Foto de Perfil */}
          <div className="p-5 bg-neutral-950/70 border border-neutral-800/90 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Foto de Perfil</span>
              </span>
              <span className="text-[10px] text-neutral-500">Exibida no painel</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-500/40 bg-neutral-900 shadow-md flex items-center justify-center">
                  <img
                    src={branding.userAvatar}
                    alt={branding.userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => fileInputPhotoRef.current?.click()}
                  className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-amber-400 cursor-pointer"
                  title="Trocar Foto"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputPhotoRef}
                  onChange={handlePhotoFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputPhotoRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors cursor-pointer w-full justify-center"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subir Foto do Dispositivo</span>
                </button>

                <button
                  onClick={() => openBrandingModal('profile')}
                  className="text-[11px] text-amber-400 hover:underline block text-center w-full cursor-pointer"
                >
                  Editar nome ({branding.userName}) e detalhes
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Logotipo da Empresa */}
          <div className="p-5 bg-neutral-950/70 border border-neutral-800/90 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Logotipo da Empresa</span>
              </span>
              <span className="text-[10px] text-neutral-500">Para cabeçalhos e formulários</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-amber-500/40 bg-neutral-950 p-1 shadow-md flex items-center justify-center">
                  <img
                    src={branding.companyLogo}
                    alt={branding.companyName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => fileInputLogoRef.current?.click()}
                  className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-amber-400 cursor-pointer"
                  title="Trocar Logotipo"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputLogoRef}
                  onChange={handleLogoFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputLogoRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors cursor-pointer w-full justify-center"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subir Novo Logotipo</span>
                </button>

                <button
                  onClick={() => openBrandingModal('company')}
                  className="text-[11px] text-amber-400 hover:underline block text-center w-full cursor-pointer"
                >
                  Editar nome ({branding.companyName}) e slogan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs for Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="text-neutral-400 block mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={branding.companyName}
              onChange={(e) => updateBranding({ companyName: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">E-mail do Administrador</label>
            <input
              type="email"
              value={branding.userEmail}
              onChange={(e) => updateBranding({ userEmail: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Dark Light Theme Options */}
        <div className={`p-4 ${isLight ? 'bg-white border-[#E2DBD0]' : 'bg-neutral-950/60 border-neutral-800/80'} border rounded-xl space-y-3 text-xs transition-colors`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>Esquema de Cores & Inspiração Visual</span>
            </span>
            <span className="text-[10px] text-amber-500 font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {branding.themeStyle === 'light' ? 'Tema Champagne Claro' : branding.themeStyle === 'dark' ? 'Obsidian Escuro' : 'Dark Light HORYA'}
            </span>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Alterne entre o visual aveludado Dark Light Horya e a versão clara Champagne & Areia (inspirada na tela inicial suave da Horya). A alteração é instantânea em toda a interface e nos formulários.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => {
                updateBranding({
                  themeStyle: 'dark-light',
                  primaryAccent: '#D4AF37',
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                branding.themeStyle === 'dark-light'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="font-semibold">Dark Light HORYA</div>
                  <div className="text-[10px] opacity-70">Obsidiana + Luz Âmbar</div>
                </div>
              </div>
              {branding.themeStyle === 'dark-light' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>

            <button
              onClick={() => {
                updateBranding({
                  themeStyle: 'light',
                  primaryAccent: '#C28B24',
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                branding.themeStyle === 'light'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400 ring-1 ring-amber-500/40 shadow-sm font-semibold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold">Champagne & Areia</div>
                  <div className="text-[10px] opacity-70">Linho & Marfim Claro</div>
                </div>
              </div>
              {branding.themeStyle === 'light' && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
            </button>

            <button
              onClick={() => {
                updateBranding({
                  themeStyle: 'dark',
                  primaryAccent: '#E5C378',
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                branding.themeStyle === 'dark'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-700 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Obsidian Puro</div>
                  <div className="text-[10px] opacity-70">Preto Profundo Minimal</div>
                </div>
              </div>
              {branding.themeStyle === 'dark' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Restaurar branding padrão do Horya Forms?')) {
                resetToDefaults();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }
            }}
            className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors cursor-pointer"
          >
            Restaurar Padrão
          </button>
        </div>
      </div>

      {/* 2. SECTION: LGPD & PRIVACIDADE */}
      <div className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 text-neutral-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold">Privacidade & Conformidade LGPD</h3>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Como os formulários da Northorya podem coletar dados reflexivos, emocionais e relacionais, a plataforma assegura a segregação estrita entre dados de identificação e respostas sensíveis, sem uso dos dados privados para treinamento de IA de terceiros.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1">
              Período de Retenção de Dados (Dias)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Após este prazo, registros anonimizados são arquivados automaticamente.
            </span>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">
              Direito ao Esquecimento & Exclusão
            </label>
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 text-xs">
              Disponível individualmente na ficha de cada lead e submissão com exclusão permanente em cascata.
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: FULL BACKUP & EXPORT */}
      <div className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-200">
            <Database className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold">Backup & Portabilidade Total</h3>
          </div>
          <button
            onClick={handleFullBackup}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>{isExporting ? 'Gerando backup...' : 'Exportar Banco Completo (JSON)'}</span>
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          Você tem total soberania sobre as informações. Baixe a qualquer momento o snapshot completo com todos os formulários, versões, regras, submissões e contatos.
        </p>
      </div>

      {/* 4. SECTION: HORYA INTEGRATION ARCHITECTURE */}
      <div className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-neutral-200">
          <Cpu className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Arquitetura de Preparação para a Horya AI</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Nesta primeira versão, o Northorya Forms Studio opera de forma autônoma e independente. A estrutura já possui contratos de dados com identificadores universais (<code className="text-amber-400">contactId</code>, <code className="text-amber-400">formSlug</code>, <code className="text-amber-400">structuredAnswers</code>) e barramento de eventos seguro para permitir que a Horya, no momento oportuno, gere sínteses analíticas para os consultores com autorização explícita.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Contratos de dados e esquemas JSON-LD prontos para integração.</span>
        </div>
      </div>

      {/* 5. SECTION: PUBLICAÇÃO, DEPLOY & DOMÍNIO PRÓPRIO */}
      <div className={`p-6 ${isLight ? 'bg-white border-[#E2DBD0]' : 'bg-neutral-900/60 border-neutral-800/80'} border rounded-2xl space-y-6 shadow-sm transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2 text-neutral-100">
            <Globe className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold">Como Publicar o Northorya Forms Studio</h3>
              <p className="text-xs text-neutral-400">
                Opções de hospedagem em produção, link público para clientes e conexão de domínio próprio.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pronto para Produção</span>
          </span>
        </div>

        {/* Current Live Cloud URL Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-900 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Link Ativo da sua Aplicação na Nuvem:</span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">HTTPS Seguro</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.origin : 'https://northorya-forms.app'}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 select-all"
            />
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <a
              href="/?form=auditoria-de-vida"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Abrir Formulário Público</span>
            </a>
          </div>

          <p className="text-[11px] text-neutral-400">
            Qualquer pessoa no mundo com esse link pode abrir e responder seus formulários diretamente (ex: <code className="text-amber-400">/?form=auditoria-de-vida</code>), sem precisar de login.
          </p>
        </div>

        {/* 1-Click Source Code Download Banner */}
        <div className="p-5 rounded-xl bg-neutral-950/80 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-neutral-100">Onde estão os arquivos do projeto?</h4>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Todos os arquivos do Northorya Forms Studio (código React, TypeScript, backend Express, Docker e banco de dados) estão prontos para você baixar e enviar para o seu GitHub e Render.
              </p>
            </div>

            <a
              href="/northorya-forms-studio.tar.gz"
              download="northorya-forms-studio.tar.gz"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Código Fonte Completo (.tar.gz)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Inclui Dockerfile, docker-compose, Vite, Tailwind v4 e API Express</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sem lock-in: você é 100% dono do código e dos dados</span>
            </div>
          </div>
        </div>

        {/* Passo a Passo: GitHub + Render */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Subir no GitHub */}
          <div className="p-5 bg-neutral-950/70 border border-neutral-800/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Passo 1: Subir no seu GitHub</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Repositório</span>
            </div>

            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Baixe o arquivo acima, descompacte na sua máquina e execute os comandos no terminal dentro da pasta:
            </p>

            <pre className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-200 overflow-x-auto leading-relaxed select-all">
{`# 1. Descompacte o pacote baixado
tar -xzf northorya-forms-studio.tar.gz

# 2. Inicialize o Git e conecte ao seu repositório
git init
git add .
git commit -m "feat: Northorya Forms Studio"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main`}
            </pre>

            <p className="text-[10px] text-neutral-500">
              * Dica: Se preferir sem terminal, você também pode descompactar os arquivos e arrastá-los diretamente na página do repositório no GitHub ("Add file" &gt; "Upload files").
            </p>
          </div>

          {/* Card 2: Conectar e Deploy no Render */}
          <div className="p-5 bg-neutral-950/70 border border-neutral-800/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Passo 2: Configurar e Publicar no Render</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Render.com</span>
            </div>

            <p className="text-neutral-400 text-[11px] leading-relaxed">
              No painel do Render (<a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">dashboard.render.com</a>), clique em <strong>New +</strong> &gt; <strong>Web Service</strong>, selecione seu repositório GitHub e preencha:
            </p>

            <div className="space-y-2 text-[11px] bg-neutral-900/90 p-3 rounded-lg border border-neutral-800">
              <div className="flex justify-between items-center py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">Environment:</span>
                <span className="font-mono text-amber-300 font-semibold">Node</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">Build Command:</span>
                <span className="font-mono text-emerald-300">npm install && npm run build</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">Start Command:</span>
                <span className="font-mono text-emerald-300">npm start</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-neutral-400">Variáveis de Ambiente (opcional):</span>
                <span className="font-mono text-neutral-300">NODE_ENV=production</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Clique em <strong>Create Web Service</strong>. O Render fará o build e fornecerá automaticamente um domínio seguro com HTTPS (ex: <code className="text-amber-400">https://seu-app.onrender.com</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
