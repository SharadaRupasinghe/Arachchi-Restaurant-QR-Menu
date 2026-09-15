import React, { useState } from 'react';
import { Sparkles, Globe, QrCode, ShieldCheck, Star, Wifi, WifiOff, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  tableNumber: string | null;
  onOpenAiModal: () => void;
  onOpenBackOffice: () => void;
  onOpenFeedback: () => void;
  onOpenQrModal: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  tableNumber,
  onOpenAiModal,
  onOpenBackOffice,
  onOpenFeedback,
  onOpenQrModal,
  isOnline,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLang];

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLang) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 bg-[#140e09]/95 backdrop-blur-md border-b border-amber-900/40 shadow-xl">
      {/* Offline/Online announcement badge */}
      {!isOnline && (
        <div className="bg-amber-950/90 text-amber-300 text-xs px-3 py-1 flex items-center justify-center gap-1.5 border-b border-amber-800/40 font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2">
          <Logo size="md" />
          {tableNumber && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {t.table} {tableNumber}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Table number on mobile */}
          {tableNumber && (
            <span className="sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              #{tableNumber}
            </span>
          )}

          {/* AI Recommender Button */}
          <button
            id="btn-open-ai-recommender"
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-900/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-stone-950/30 animate-pulse" />
            <span className="hidden xs:inline sm:inline">{t.aiRecommendBtn}</span>
            <span className="xs:hidden sm:hidden font-extrabold">AI</span>
          </button>

          {/* Reviews Rating Button */}
          <button
            id="btn-open-reviews"
            onClick={onOpenFeedback}
            title={t.customerReviews}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-500/30 text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="hidden md:inline font-medium">4.9 ★</span>
          </button>

          {/* Table QR Stand Generator Button */}
          <button
            id="btn-open-qr-modal"
            onClick={onOpenQrModal}
            title={t.tableQrBtn}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              id="btn-language-selector"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline font-medium uppercase text-xs">{currentLangObj.code}</span>
              <Globe className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1d150f] border border-amber-800/50 shadow-2xl py-1 z-50 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-400/80 border-b border-stone-800">
                    Select Language / භාෂාව
                  </div>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-amber-950/40 transition-colors ${
                        currentLang === lang.code
                          ? 'text-amber-400 font-bold bg-amber-950/20'
                          : 'text-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {currentLang === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Staff Back Office Entry */}
          <button
            id="btn-open-backoffice"
            onClick={onOpenBackOffice}
            title={t.backOffice}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-amber-300 border border-stone-800 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
