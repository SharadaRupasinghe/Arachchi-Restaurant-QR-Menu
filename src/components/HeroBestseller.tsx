import React from 'react';
import { Flame, Sparkles, Trophy, Users, ChefHat } from 'lucide-react';
import { MenuItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeroBestsellerProps {
  currentLang: SupportedLanguage;
  bestsellers: MenuItem[];
  onSelectDish: (dishId: string) => void;
  onOpenAiModal: () => void;
}

export const HeroBestseller: React.FC<HeroBestsellerProps> = ({
  currentLang,
  bestsellers,
  onSelectDish,
  onOpenAiModal,
}) => {
  const t = TRANSLATIONS[currentLang];
  const primaryBestseller = bestsellers.find((b) => b.id === 'spec_kulls_2pax') || bestsellers[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#24170e] via-[#1a1109] to-[#100b07] border border-amber-600/30 p-4 sm:p-6 shadow-2xl mb-8">
      {/* Subtle warm backdrop glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: Top Selling Story */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {t.topSellingDish}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {t.trending} in Anuradhapura
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-amber-100 leading-tight">
            {primaryBestseller?.name || 'Arachchi Kulls (2 Pax)'}
            {primaryBestseller?.sinhalaName && (
              <span className="block text-sm sm:text-base font-sans font-normal text-amber-300/90 mt-1">
                {primaryBestseller.sinhalaName}
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 line-clamp-3 leading-relaxed">
            {primaryBestseller?.description || t.topSellingStory}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-amber-400 font-semibold">{t.currency}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {primaryBestseller?.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {primaryBestseller?.servesPax && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-700/60 text-xs text-stone-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.servesPax} {primaryBestseller.servesPax} Pax</span>
              </div>
            )}

            <button
              id="btn-view-top-seller"
              onClick={() => primaryBestseller && onSelectDish(primaryBestseller.id)}
              className="ml-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {t.viewDetails}
            </button>
          </div>
        </div>

        {/* Right Column: Trending Quick Picks (Hot Butter Cuttlefish, Thachchiya, Cheese Kottu) */}
        <div className="lg:col-span-5 bg-stone-950/60 rounded-xl p-3.5 border border-amber-900/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-amber-300/80 font-semibold pb-1 border-b border-stone-800">
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              Guest Favorites Tonight
            </span>
            <button
              onClick={onOpenAiModal}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Match my taste
            </button>
          </div>

          <div className="space-y-2">
            {bestsellers.slice(1, 4).map((dish) => (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-stone-900/50 hover:bg-amber-950/30 border border-stone-800/80 hover:border-amber-700/50 transition-all cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">
                    {dish.name}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {dish.highlightNote || dish.description}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-400 font-mono">
                    {dish.price.toLocaleString()} LKR
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                    {dish.isBestseller ? 'Bestseller' : 'Trending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
