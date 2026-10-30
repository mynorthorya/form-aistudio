/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Palette, Check, Sliders, Smartphone, Laptop } from 'lucide-react';
import { FormSettings, FormTheme } from '../../types/index.ts';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: FormTheme;
  settings: FormSettings;
  onSaveThemeAndSettings: (theme: FormTheme, settings: FormSettings) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  theme,
  settings,
  onSaveThemeAndSettings,
}) => {
  const [currentTheme, setCurrentTheme] = useState<FormTheme>(theme);
  const [currentSettings, setCurrentSettings] = useState<FormSettings>(settings);

  if (!isOpen) return null;

  const colorPresets = [
    { name: 'Northorya Amber (Oficial)', primary: '#D97706', bg: '#09090b', card: '#18181b', text: '#f4f4f5' },
    { name: 'Warm Bronze', primary: '#b45309', bg: '#0c0a09', card: '#1c1917', text: '#fafaf9' },
    { name: 'Slate Executive', primary: '#2563EB', bg: '#0f172a', card: '#1e293b', text: '#f8fafc' },
    { name: 'Emerald Calm', primary: '#059669', bg: '#064e3b', card: '#065f46', text: '#ecfdf5' },
    { name: 'Clean White (Light)', primary: '#b45309', bg: '#ffffff', card: '#f8fafc', text: '#0f172a' },
  ];

  const handleApplyPreset = (preset: typeof colorPresets[0]) => {
    setCurrentTheme({
      ...currentTheme,
      primaryColor: preset.primary,
      backgroundColor: preset.bg,
      cardColor: preset.card,
      textColor: preset.text,
    });
  };

  const handleSave = () => {
    onSaveThemeAndSettings(currentTheme, currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Aparência & Modo de Apresentação
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Personalize as cores institucionais, formato de fluxo e experiência do respondente.
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
          {/* Presentation Mode Selection (Section 9) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Modo de Exibição
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentSettings({ ...currentSettings, mode: 'conversational' })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  currentSettings.mode === 'conversational'
                    ? 'border-amber-500 bg-amber-600/10 text-neutral-100 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-100">Modo Conversacional</span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2">
                  Uma pergunta por vez, atalhos de teclado, transição suave, focado em alta conversão.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCurrentSettings({ ...currentSettings, mode: 'classic' })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  currentSettings.mode === 'classic'
                    ? 'border-amber-500 bg-amber-600/10 text-neutral-100 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Laptop className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-neutral-100">Modo Clássico</span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2">
                  Todas as perguntas em uma única página corrida ou blocos com envio unificado ao final.
                </p>
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Paletas Northorya
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-neutral-700 shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="text-xs font-medium text-neutral-200">
                      {preset.name}
                    </span>
                  </div>
                  {currentTheme.primaryColor === preset.primary && (
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Color Controls */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Personalização Fina de Cores
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Cor de Destaque (Accent)
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5">
                  <input
                    type="color"
                    value={currentTheme.primaryColor}
                    onChange={(e) =>
                      setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={currentTheme.primaryColor}
                    onChange={(e) =>
                      setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })
                    }
                    className="bg-transparent text-neutral-200 font-mono text-xs w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Fundo da Tela (Background)
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5">
                  <input
                    type="color"
                    value={currentTheme.backgroundColor}
                    onChange={(e) =>
                      setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={currentTheme.backgroundColor}
                    onChange={(e) =>
                      setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })
                    }
                    className="bg-transparent text-neutral-200 font-mono text-xs w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Flow Settings */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Preferências de Navegação
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 cursor-pointer">
                <span className="text-neutral-300">Exibir barra de progresso no topo</span>
                <input
                  type="checkbox"
                  checked={currentSettings.showProgressBar}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, showProgressBar: e.target.checked })
                  }
                  className="rounded border-neutral-700 text-amber-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 cursor-pointer">
                <span className="text-neutral-300">Permitir navegação por teclado (Enter / 1-9)</span>
                <input
                  type="checkbox"
                  checked={currentSettings.allowKeyboardNavigation}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      allowKeyboardNavigation: e.target.checked,
                    })
                  }
                  className="rounded border-neutral-700 text-amber-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Aparência</span>
          </button>
        </div>
      </div>
    </div>
  );
};
