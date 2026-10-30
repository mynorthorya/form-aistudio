/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandingConfig } from '../types/index.ts';
import { ASSETS } from '../lib/assets.ts';

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  resetToDefaults: () => void;
  toggleTheme: () => void;
  isBrandingModalOpen: boolean;
  openBrandingModal: (tab?: 'profile' | 'company' | 'theme') => void;
  closeBrandingModal: () => void;
  activeBrandingTab: 'profile' | 'company' | 'theme';
  setActiveBrandingTab: (tab: 'profile' | 'company' | 'theme') => void;
}

const STORAGE_KEY = 'horya_northorya_branding_config';

export const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'HORYA',
  companyTagline: 'Espaço de Pausa, Clareza e Governança',
  companyLogo: ASSETS.horyaBrandVisual,
  userName: 'Edson Batista',
  userRole: 'Fundador & Diretor',
  userEmail: 'contato@edbatista.vip',
  userAvatar: ASSETS.horyaBrandVisual,
  themeStyle: 'dark-light',
  primaryAccent: '#D4AF37',
  showLogoOnPublicForms: true,
  brandAesthetic: 'horya-zen',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_BRANDING, ...parsed };
        }
      } catch (e) {
        console.warn('Could not read stored branding configuration:', e);
      }
    }
    return DEFAULT_BRANDING;
  });

  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [activeBrandingTab, setActiveBrandingTab] = useState<'profile' | 'company' | 'theme'>('profile');

  // Apply theme attributes and CSS variables immediately to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const currentTheme = branding.themeStyle || 'dark-light';
    const root = document.documentElement;

    root.setAttribute('data-theme', currentTheme);
    root.classList.remove('theme-light', 'theme-dark', 'theme-dark-light', 'light', 'dark');
    root.classList.add(`theme-${currentTheme}`);

    if (currentTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }

    if (branding.primaryAccent) {
      root.style.setProperty('--primary-accent', branding.primaryAccent);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    } catch (e) {
      console.warn('Could not persist branding configuration:', e);
    }
  }, [branding]);

  const toggleTheme = () => {
    setBranding((prev) => {
      const nextTheme = prev.themeStyle === 'light' ? 'dark-light' : 'light';
      return { ...prev, themeStyle: nextTheme };
    });
  };

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const openBrandingModal = (tab: 'profile' | 'company' | 'theme' = 'profile') => {
    setActiveBrandingTab(tab);
    setIsBrandingModalOpen(true);
  };

  const closeBrandingModal = () => {
    setIsBrandingModalOpen(false);
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        updateBranding,
        resetToDefaults,
        toggleTheme,
        isBrandingModalOpen,
        openBrandingModal,
        closeBrandingModal,
        activeBrandingTab,
        setActiveBrandingTab,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      updateBranding: () => {},
      resetToDefaults: () => {},
      toggleTheme: () => {},
      isBrandingModalOpen: false,
      openBrandingModal: () => {},
      closeBrandingModal: () => {},
      activeBrandingTab: 'profile',
      setActiveBrandingTab: () => {},
    };
  }
  return context;
};

