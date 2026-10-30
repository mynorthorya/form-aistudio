/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
  Plus,
  Camera,
  Edit2,
} from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext.tsx';

export type NavItem = 'dashboard' | 'forms' | 'contacts' | 'analytics' | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onCreateNewForm: () => void;
  onOpenAiModal?: () => void;
  openPublicDemo?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onCreateNewForm,
  onOpenAiModal,
  openPublicDemo,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { branding, openBrandingModal } = useBranding();
  const isLight = branding.themeStyle === 'light';

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'forms', label: 'Formulários', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contatos & CRM', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: NavItem) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 ${
          isLight ? 'bg-[#EFECE4] border-[#E2DBD0] text-[#1C1917]' : 'bg-[#0c0c10] border-[#222126] text-neutral-100'
        } border-r flex flex-col justify-between shrink-0 select-none transition-colors duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div
            onClick={() => openBrandingModal('company')}
            className="p-4 flex items-center justify-between border-b border-[#1c1c22] hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            title="Clique para personalizar logotipo e nome da empresa"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src={branding.companyLogo}
                  alt={branding.companyName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-contain bg-neutral-950/80 p-1 ring-1 ring-amber-500/40 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-neutral-950 flex items-center justify-center text-[7px] text-neutral-950 font-bold">
                  ✓
                </span>
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-wider text-neutral-100 text-sm block truncate uppercase">
                    {branding.companyName}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-medium tracking-wide uppercase block truncate">
                  Forms Studio
                </span>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-amber-400 p-1 rounded">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="p-3 space-y-2">
            <button
              onClick={() => {
                onCreateNewForm();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-semibold rounded-lg text-xs transition-all shadow-md shadow-amber-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Formulário</span>
            </button>

            {onOpenAiModal && (
              <button
                onClick={() => {
                  onOpenAiModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Criar com IA</span>
              </button>
            )}
          </div>

          {/* Navigation list */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-white text-stone-900 shadow-sm border border-[#DCD5C6] font-semibold'
                        : 'bg-neutral-800/90 text-neutral-100 shadow-sm border border-neutral-700/60'
                      : isLight
                      ? 'text-stone-600 hover:text-stone-900 hover:bg-[#E5DFD4]'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-500' : isLight ? 'text-stone-400' : 'text-neutral-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Founder Profile with Interactive Photo Change */}
        <div className={`p-3 border-t ${isLight ? 'border-[#E2DBD0]' : 'border-[#1c1c22]'} space-y-2.5`}>
          {openPublicDemo && (
            <button
              onClick={openPublicDemo}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                isLight
                  ? 'bg-white hover:bg-stone-50 border-[#E2DBD0] text-stone-700'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800/80 text-neutral-300'
              } border text-[11px] transition-colors cursor-pointer`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auditoria Pública</span>
              </span>
              <ExternalLink className={`w-3 h-3 ${isLight ? 'text-stone-400' : 'text-neutral-500'}`} />
            </button>
          )}

          {/* User profile card - click to change photo & details */}
          <div
            onClick={() => openBrandingModal('profile')}
            className={`flex items-center justify-between p-2 rounded-xl ${
              isLight
                ? 'bg-white border-[#E2DBD0] hover:border-amber-500/60 hover:bg-[#FAF8F5]'
                : 'bg-neutral-950/60 border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/60'
            } border transition-all cursor-pointer group`}
            title="Clique para trocar sua foto ou editar perfil"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src={branding.userAvatar}
                  alt={branding.userName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/40 shadow-sm"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${isLight ? 'bg-white' : 'bg-neutral-900'} border border-amber-500/50 flex items-center justify-center text-amber-500 opacity-80 group-hover:opacity-100`}>
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="overflow-hidden">
                <span className={`text-xs font-semibold ${isLight ? 'text-stone-900' : 'text-neutral-200'} block truncate group-hover:text-amber-500 transition-colors`}>
                  {branding.userName}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-neutral-400'} block truncate font-mono`}>
                  {branding.userEmail}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-amber-400/90 font-medium px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              Trocar
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

