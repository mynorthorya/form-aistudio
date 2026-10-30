/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Sparkles, Menu, Image, Camera, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { useBranding } from '../../contexts/BrandingContext.tsx';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightAction,
  onToggleMobileMenu,
}) => {
  const { branding, openBrandingModal, toggleTheme } = useBranding();
  const isLight = branding.themeStyle === 'light';

  return (
    <header className="h-16 border-b border-[#1f1e24] bg-[#0c0c10]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8 shrink-0 select-none z-10 transition-colors duration-200">
      {/* Zone 1: Mobile Menu Button + Breadcrumb / Section Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="lg:hidden text-neutral-400 hover:text-neutral-100"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-sm font-semibold tracking-tight text-neutral-100 whitespace-nowrap">
          {title}
        </h1>
        {subtitle && (
          <span className="text-xs text-neutral-500 font-normal hidden sm:inline">
            · {subtitle}
          </span>
        )}
      </div>

      {/* Zone 2: Brand & Ecosystem notice */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <button
          onClick={() => openBrandingModal('company')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 transition-colors cursor-pointer"
          title="Personalizar identidade da marca"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            {branding.companyName}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-amber-400/90 text-[11px] font-medium">
            {isLight ? 'Champagne Claro' : 'Dark Light'}
          </span>
        </button>
      </div>

      {/* Zone 3: Actions + Theme Switcher + User Quick Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Instant Light/Dark Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            isLight
              ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200/80'
              : 'bg-neutral-900/80 border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-neutral-100'
          }`}
          title={isLight ? 'Alternar para tema Escuro (Dark Light)' : 'Alternar para tema Claro (Champagne & Areia)'}
        >
          {isLight ? (
            <>
              <Sun className="w-4 h-4 text-amber-600 animate-spin-slow" />
              <span className="hidden sm:inline font-semibold">Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium">Dark Light</span>
            </>
          )}
        </button>

        <button
          onClick={() => openBrandingModal('profile')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 text-xs transition-colors cursor-pointer"
          title="Trocar foto e logo"
        >
          <img
            src={branding.userAvatar}
            alt={branding.userName}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-500/40"
            referrerPolicy="no-referrer"
          />
          <span className="hidden sm:inline font-medium text-neutral-200">Foto & Marca</span>
        </button>

        {rightAction ? (
          rightAction
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold text-neutral-200 border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
          >
            <a
              href="/?form=auditoria-de-vida"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Formulário Ao Vivo</span>
              <ExternalLink className="w-3 h-3 text-neutral-500 ml-0.5" />
            </a>
          </Button>
        )}
      </div>
    </header>
  );
};

