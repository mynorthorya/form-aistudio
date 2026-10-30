/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  User,
  Building2,
  Sparkles,
  Camera,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext.tsx';
import { ASSETS } from '../../lib/assets.ts';

export const ProfileBrandingModal: React.FC = () => {
  const {
    branding,
    updateBranding,
    resetToDefaults,
    isBrandingModalOpen,
    closeBrandingModal,
    activeBrandingTab,
    setActiveBrandingTab,
  } = useBranding();

  const [tempUserName, setTempUserName] = useState(branding.userName);
  const [tempUserEmail, setTempUserEmail] = useState(branding.userEmail);
  const [tempUserRole, setTempUserRole] = useState(branding.userRole);
  const [tempCompanyName, setTempCompanyName] = useState(branding.companyName);
  const [tempCompanyTagline, setTempCompanyTagline] = useState(branding.companyTagline);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const fileInputPhotoRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);

  if (!isBrandingModalOpen) return null;

  // Handle Photo File Upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateBranding({ userAvatar: result });
        triggerSaveNotice();
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo File Upload
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateBranding({ companyLogo: result });
        triggerSaveNotice();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    updateBranding({ userAvatar: photoUrlInput.trim() });
    setPhotoUrlInput('');
    triggerSaveNotice();
  };

  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) return;
    updateBranding({ companyLogo: logoUrlInput.trim() });
    setLogoUrlInput('');
    triggerSaveNotice();
  };

  const handleSaveTextChanges = () => {
    updateBranding({
      userName: tempUserName,
      userEmail: tempUserEmail,
      userRole: tempUserRole,
      companyName: tempCompanyName,
      companyTagline: tempCompanyTagline,
    });
    triggerSaveNotice();
  };

  const triggerSaveNotice = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const avatarPresets = [
    { label: 'HORYA Zen (Visual Anexado)', src: ASSETS.horyaBrandVisual },
    { label: 'Fundador Clássico', src: ASSETS.avatarFounder },
    { label: 'Emblema Dourado', src: ASSETS.emblem },
  ];

  const logoPresets = [
    { label: 'HORYA (Emblema Zen Dourado)', src: ASSETS.horyaBrandVisual },
    { label: 'Símbolo Northorya', src: ASSETS.emblem },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800/90 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                Personalização de Identidade & Imagem
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Dark Light
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Altere sua foto de perfil, o logotipo da sua empresa e o estilo visual dos formulários
              </p>
            </div>
          </div>
          <button
            onClick={closeBrandingModal}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-900/50">
          <button
            onClick={() => setActiveBrandingTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeBrandingTab === 'profile'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Minha Foto & Perfil</span>
          </button>
          <button
            onClick={() => setActiveBrandingTab('company')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeBrandingTab === 'company'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Logo da Empresa & Marca</span>
          </button>
          <button
            onClick={() => setActiveBrandingTab('theme')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeBrandingTab === 'theme'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Estilo & Dark Light</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: MINHA FOTO & PERFIL */}
          {activeBrandingTab === 'profile' && (
            <div className="space-y-6">
              {/* Photo Upload & Preview Card */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10 bg-neutral-900 flex items-center justify-center">
                    {branding.userAvatar ? (
                      <img
                        src={branding.userAvatar}
                        alt={branding.userName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-10 h-10 text-neutral-600" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputPhotoRef.current?.click()}
                    className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-amber-400 cursor-pointer"
                    title="Clique para carregar nova foto"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-semibold">Alterar</span>
                  </button>
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-100">{branding.userName}</h3>
                    <p className="text-neutral-400 text-xs">{branding.userRole} · {branding.userEmail}</p>
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      Esta foto aparece no rodapé do menu lateral, na barra superior e nos seus relatórios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputPhotoRef}
                      onChange={handlePhotoFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputPhotoRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Escolher Foto do Computador</span>
                    </button>

                    <button
                      onClick={() => {
                        updateBranding({ userAvatar: ASSETS.horyaBrandVisual });
                        triggerSaveNotice();
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs transition-colors border border-neutral-700 cursor-pointer"
                    >
                      Usar Escultura HORYA
                    </button>
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-medium">Ou informe a URL da sua foto:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    onClick={handleApplyPhotoUrl}
                    disabled={!photoUrlInput.trim()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 disabled:opacity-40 cursor-pointer"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="space-y-2">
                <span className="text-neutral-400 font-medium block">Galeria de fotos rápidas:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateBranding({ userAvatar: preset.src });
                        triggerSaveNotice();
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        branding.userAvatar === preset.src
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-100'
                          : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800/50 text-neutral-300'
                      }`}
                    >
                      <img
                        src={preset.src}
                        alt={preset.label}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Seu Nome</label>
                  <input
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    onBlur={handleSaveTextChanges}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    value={tempUserEmail}
                    onChange={(e) => setTempUserEmail(e.target.value)}
                    onBlur={handleSaveTextChanges}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={tempUserRole}
                    onChange={(e) => setTempUserRole(e.target.value)}
                    onBlur={handleSaveTextChanges}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO DA EMPRESA & MARCA */}
          {activeBrandingTab === 'company' && (
            <div className="space-y-6">
              {/* Logo Preview Card */}
              <div className="p-4 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-amber-500/40 bg-neutral-950/80 p-2 flex items-center justify-center shadow-lg shadow-amber-500/5">
                    {branding.companyLogo ? (
                      <img
                        src={branding.companyLogo}
                        alt={branding.companyName}
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-neutral-600" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputLogoRef.current?.click()}
                    className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-amber-400 cursor-pointer"
                    title="Clique para carregar logotipo"
                  >
                    <Upload className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-semibold">Substituir</span>
                  </button>
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-base font-bold tracking-wider text-neutral-100 uppercase">
                        {branding.companyName}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Ativa
                      </span>
                    </div>
                    <p className="text-neutral-400 text-xs mt-0.5">{branding.companyTagline}</p>
                    <p className="text-[11px] text-amber-500/80 mt-1">
                      O logotipo é renderizado na navegação administrativa e, opcionalmente, no cabeçalho dos formulários públicos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputLogoRef}
                      onChange={handleLogoFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputLogoRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Fazer Upload do Logo (PNG / SVG)</span>
                    </button>

                    <button
                      onClick={() => {
                        updateBranding({ companyLogo: ASSETS.horyaBrandVisual });
                        triggerSaveNotice();
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs transition-colors border border-neutral-700 cursor-pointer"
                    >
                      Usar Logo Visual HORYA
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo URL input */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-medium">Ou informe a URL do logo:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo-empresa.png"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    onClick={handleApplyLogoUrl}
                    disabled={!logoUrlInput.trim()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 disabled:opacity-40 cursor-pointer"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>

              {/* Preset logos */}
              <div className="space-y-2">
                <span className="text-neutral-400 font-medium block">Modelos pré-definidos:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {logoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateBranding({ companyLogo: preset.src });
                        triggerSaveNotice();
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        branding.companyLogo === preset.src
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-100'
                          : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800/50 text-neutral-300'
                      }`}
                    >
                      <img
                        src={preset.src}
                        alt={preset.label}
                        className="w-10 h-10 rounded-lg object-contain bg-neutral-950 p-1 ring-1 ring-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    onBlur={handleSaveTextChanges}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Slogan / Assinatura</label>
                  <input
                    type="text"
                    value={tempCompanyTagline}
                    onChange={(e) => setTempCompanyTagline(e.target.value)}
                    onBlur={handleSaveTextChanges}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Show Logo in Forms Toggle */}
              <div className="flex items-center justify-between p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg">
                <div>
                  <span className="text-neutral-200 font-medium block">
                    Exibir Logo nos Formulários Públicos
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    Os respondentes verão sua marca e logotipo no início de cada questionário.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateBranding({ showLogoOnPublicForms: !branding.showLogoOnPublicForms });
                    triggerSaveNotice();
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    branding.showLogoOnPublicForms ? 'bg-amber-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      branding.showLogoOnPublicForms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ESTILO & DARK LIGHT */}
          {activeBrandingTab === 'theme' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-900 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Estética Dark Light Inspirada em HORYA</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Inspirada na atmosfera serena da tela inicial da Horya: superfícies escuras aveludadas,
                  brilho âmbar acolhedor (como a chama interior da escultura), tipografia delicada em marfim e champanhe,
                  e acabamentos suaves com toque de cerâmica acetinada.
                </p>
              </div>

              {/* Theme Presets */}
              <div className="space-y-3">
                <label className="text-neutral-300 font-medium block">Selecione o Esquema Visual:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      updateBranding({
                        themeStyle: 'dark-light',
                        primaryAccent: '#D4AF37',
                        brandAesthetic: 'horya-zen',
                      });
                      triggerSaveNotice();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      branding.themeStyle === 'dark-light'
                        ? 'border-amber-500/80 bg-neutral-900 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-100 text-xs">Dark Light Horya</span>
                      {branding.themeStyle === 'dark-light' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className="w-4 h-4 rounded-full bg-neutral-950 border border-neutral-700" />
                      <span className="w-4 h-4 rounded-full bg-[#D4AF37]" />
                      <span className="w-4 h-4 rounded-full bg-[#F5E8C7]" />
                    </div>
                    <span className="text-[10px] text-neutral-400 block leading-tight">
                      Obsidiana + Brilho âmbar e champanhe inspirado no visual HORYA.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      updateBranding({
                        themeStyle: 'dark',
                        primaryAccent: '#E5C378',
                        brandAesthetic: 'minimalist-dark',
                      });
                      triggerSaveNotice();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      branding.themeStyle === 'dark'
                        ? 'border-amber-500/80 bg-neutral-900 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-100 text-xs">Obsidian Puro</span>
                      {branding.themeStyle === 'dark' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className="w-4 h-4 rounded-full bg-black border border-neutral-800" />
                      <span className="w-4 h-4 rounded-full bg-neutral-800" />
                      <span className="w-4 h-4 rounded-full bg-amber-500" />
                    </div>
                    <span className="text-[10px] text-neutral-400 block leading-tight">
                      Contraste cirúrgico, preto profundo e detalhes dourados discretos.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      updateBranding({
                        themeStyle: 'light',
                        primaryAccent: '#C29B38',
                        brandAesthetic: 'corporate-slate',
                      });
                      triggerSaveNotice();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      branding.themeStyle === 'light'
                        ? 'border-amber-500/80 bg-neutral-900 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-100 text-xs">Champagne & Areia</span>
                      {branding.themeStyle === 'light' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className="w-4 h-4 rounded-full bg-[#FAF7F2] border border-neutral-300" />
                      <span className="w-4 h-4 rounded-full bg-[#E8DEC8]" />
                      <span className="w-4 h-4 rounded-full bg-[#8E7036]" />
                    </div>
                    <span className="text-[10px] text-neutral-400 block leading-tight">
                      Tons claros quentes de areia e linho (como o fundo claro do app).
                    </span>
                  </button>
                </div>
              </div>

              {/* Accent Color picker */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="text-neutral-400 block mb-1">Cor de Destaque Dourada / Âmbar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primaryAccent}
                    onChange={(e) => updateBranding({ primaryAccent: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-neutral-300 text-xs">{branding.primaryAccent}</span>
                  <div className="flex gap-1.5 ml-auto">
                    {['#D4AF37', '#E5C378', '#F59E0B', '#10B981', '#38BDF8'].map((col) => (
                      <button
                        key={col}
                        onClick={() => updateBranding({ primaryAccent: col })}
                        style={{ backgroundColor: col }}
                        className="w-5 h-5 rounded-full ring-1 ring-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                        title={col}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800/80 bg-neutral-950/50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Deseja restaurar as configurações originais do branding HORYA?')) {
                resetToDefaults();
                triggerSaveNotice();
              }
            }}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restaurar Padrões HORYA</span>
          </button>

          <div className="flex items-center gap-3">
            {savedToast && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Salvo com sucesso!</span>
              </span>
            )}
            <button
              onClick={closeBrandingModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              Concluir & Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
