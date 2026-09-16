import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Share2,
  ShieldCheck,
  Wifi,
  WifiOff,
  ExternalLink,
  MessageCircle,
  Check,
  Sparkles,
  QrCode,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo';
import { SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../data/translations';

interface FooterProps {
  currentLang: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  tableNumber?: string | null;
  onOpenAiModal?: () => void;
  onOpenFeedback: () => void;
  onOpenQrModal?: () => void;
  onOpenBackOffice: () => void;
  isOnline: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onLanguageChange,
  tableNumber,
  onOpenAiModal,
  onOpenFeedback,
  onOpenQrModal,
  onOpenBackOffice,
  isOnline,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [copiedLink, setCopiedLink] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLangObj =
    LANGUAGE_OPTIONS.find((l) => l.code === currentLang) || LANGUAGE_OPTIONS[0];

  const googleReviewUrl =
    'https://www.google.com/maps/search/?api=1&query=Arachchi+Restaurant+Jayanthi+Mawatha+Anuradhapura';
  const tripAdvisorUrl =
    'https://www.tripadvisor.com/Search?q=Arachchi+Restaurant+Anuradhapura';
  const shareText = encodeURIComponent(
    'Dining at Arachchi Restaurant Anuradhapura! Discover delicious Sri Lankan & Asian fusion dishes and instant QR menu: '
  );
  const currentUrl = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : 'https://arachchi-restaurant.lk'
  );
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <footer className="mt-16 bg-[#140e09]/95 backdrop-blur-md border-t border-amber-900/40 text-stone-300 shadow-2xl">
      {/* 1. Header-Style Quick Nav Ribbon Bar (Same layout & controls as Header) */}
      <div className="bg-[#100b07] border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left: Brand Identity matching Header */}
          <div className="flex items-center gap-2">
            <Logo size="md" />
            {tableNumber && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t.table} {tableNumber}
              </span>
            )}
          </div>

          {/* Right: Actions matching Header */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* AI Recommender Button */}
            {onOpenAiModal && (
              <button
                id="footer-btn-ai-recommender"
                onClick={onOpenAiModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-900/30 transition-all transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-stone-950/30 animate-pulse" />
                <span className="hidden xs:inline sm:inline">{t.aiRecommendBtn}</span>
                <span className="xs:hidden sm:hidden font-extrabold">AI</span>
              </button>
            )}

            {/* Reviews Rating Button */}
            <button
              id="footer-btn-reviews"
              onClick={onOpenFeedback}
              title={t.customerReviews}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-500/30 text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="hidden md:inline font-medium">4.9 ★</span>
            </button>

            {/* Table QR Stand Generator Button */}
            {onOpenQrModal && (
              <button
                id="footer-btn-qr-modal"
                onClick={onOpenQrModal}
                title={t.tableQrBtn}
                className="p-1.5 sm:p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}

            {/* Multilingual Selector */}
            {onLanguageChange && (
              <div className="relative">
                <button
                  id="footer-btn-language-selector"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span className="text-sm">{currentLangObj.flag}</span>
                  <span className="hidden sm:inline font-medium uppercase text-xs">
                    {currentLangObj.code}
                  </span>
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {langDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setLangDropdownOpen(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-[#1d150f] border border-amber-800/50 shadow-2xl py-1 z-50 overflow-hidden">
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
            )}

            {/* Staff Back Office Entry */}
            <button
              id="footer-btn-backoffice"
              onClick={onOpenBackOffice}
              title={t.backOffice}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-amber-300 border border-stone-800 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Detailed Footer Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Col 1: Identity & Description */}
          <div className="md:col-span-4 space-y-4">
            <Logo size="lg" />
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              Authentic Sri Lankan, Indian and Asian fusion cuisine in the sacred ancient city of Anuradhapura. Home of the legendary Arachchi Kulls, Hot Butter Cuttlefish, and Cheese Kottu.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Kitchen Open • Freshly Cooked to Order</span>
            </div>

            {/* Social Sharing Icons */}
            <div className="pt-2">
              <div className="text-[11px] uppercase font-bold text-stone-400 mb-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.shareExperience}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={fbShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-700/50 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Share on Facebook"
                >
                  <span>Facebook</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy QR Menu Link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Contact & Location */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider">
              Contact & Location
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-100">Arachchi Restaurant</div>
                  <div>Jayanthi Mawatha, Anuradhapura, Sri Lanka</div>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline text-[11px] block mt-0.5"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href="tel:+94252262444"
                  className="hover:text-amber-300 font-mono font-semibold"
                >
                  +94 25 226 2444
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Open Daily: 10:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 3: Review Platforms & Back Office */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider">
              {t.customerReviews} & Ratings
            </h4>
            <p className="text-xs text-stone-400">
              Your feedback guides travelers visiting Anuradhapura. Rate us on our menu or public platforms:
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenFeedback}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{t.leaveReview}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                  <span>Google Review</span>
                </a>

                <a
                  href={tripAdvisorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                  <span>TripAdvisor</span>
                </a>
              </div>

              <button
                onClick={onOpenBackOffice}
                className="w-full py-1.5 px-3 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer border border-stone-800 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.backOffice}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Arachchi Restaurant Anuradhapura. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              {isOnline ? 'Menu Synchronized' : 'Offline Cache Active'}
            </span>
            <span>•</span>
            <span>Instant QR Digital Menu</span>
          </div>
        </div>

        {/* Creator & Leadership Credits */}
        <div className="mt-4 pt-4 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs text-stone-400 bg-black/40 rounded-xl px-4 py-3 border border-amber-950/40">
          <div className="space-y-0.5">
            <div className="text-stone-300 font-medium">
              Created & Developed by <span className="font-bold text-amber-300">Sharada Rupasinghe</span>
            </div>
            <div className="text-[11px] text-stone-500">
              General Manager of <span className="text-stone-400 font-semibold">Arachchi Restaurant</span>, <span className="text-stone-400 font-semibold">Hotel White House</span> &amp; <span className="text-stone-400 font-semibold">Chamy Group of companies</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://www.linkedin.com/in/sharadarupasinghe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077b5]/15 hover:bg-[#0077b5]/30 border border-[#0077b5]/40 text-[#5db2e6] hover:text-[#8acbf1] text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title="Sharada Rupasinghe on LinkedIn"
            >
              <ExternalLink className="w-3 h-3" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://fb.com/sharadarupasinghe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877f2]/15 hover:bg-[#1877f2]/30 border border-[#1877f2]/40 text-[#68a5f8] hover:text-[#9bc2fc] text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title="Sharada Rupasinghe on Facebook"
            >
              <ExternalLink className="w-3 h-3" />
              <span>fb.com/sharadarupasinghe</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
