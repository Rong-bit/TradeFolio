import React, { createContext, useContext } from 'react';
import { Language } from '../utils/i18n';

export type View = 'dashboard' | 'history' | 'funds' | 'accounts' | 'rebalance' | 'simulator' | 'help';

export interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface UIContextValue {
  // 語言
  language: Language;
  setLanguage: (lang: Language) => void;

  // 頁面路由
  view: View;
  setView: (v: View) => void;
  availableViews: View[];

  // 認證
  isAuthenticated: boolean;
  isGuest: boolean;
  currentUser: string;

  // Alert
  alertDialog: AlertState;
  showAlert: (message: string, title?: string, type?: 'info' | 'success' | 'error') => void;
  closeAlert: () => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIContext.Provider');
  return ctx;
}
