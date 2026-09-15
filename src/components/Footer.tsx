import React, { useState } from 'react';
import { Phone, MapPin, Clock, Star, Share2, ShieldCheck, Heart, Wifi, ExternalLink, MessageCircle, Check } from 'lucide-react';
import { Logo } from './Logo';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  currentLang: SupportedLanguage;
  onOpenFeedback: () => void;
  onOpenBackOffice: () => void;
  isOnline: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenFeedback,
  onOpenBackOffice,
  isOnline,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [copiedLink, setCopiedLink] = useState(false);

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
    <footer className="mt-16 bg-[#120c08] border-t border-amber-900/40 text-stone-300">
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
