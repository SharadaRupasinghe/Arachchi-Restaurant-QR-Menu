import React from 'react';
import { motion } from 'motion/react';
import { Flame, Leaf, Fish, Users, Sparkles, AlertCircle, Share2 } from 'lucide-react';
import { MenuItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface DishCardProps {
  item: MenuItem;
  currentLang: SupportedLanguage;
  onQuickShare?: (item: MenuItem) => void;
  onEditPrice?: (item: MenuItem) => void;
  isStaffMode?: boolean;
}

export const DishCard: React.FC<DishCardProps> = ({
  item,
  currentLang,
  onQuickShare,
  onEditPrice,
  isStaffMode,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <motion.div
      id={`dish-card-${item.id}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`group relative flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#1c140e] to-[#140e09] border transition-colors duration-200 p-3.5 sm:p-4 shadow-lg ${
        !item.isAvailable
          ? 'opacity-60 border-stone-800'
          : item.isBestseller
          ? 'border-amber-600/40 hover:border-amber-500 hover:shadow-amber-950/40'
          : 'border-stone-800/80 hover:border-stone-700 hover:shadow-black/60'
      }`}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <div className="flex flex-wrap items-center gap-1">
            {item.isBestseller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {t.bestseller}
              </span>
            )}
            {item.isTrending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Flame className="w-2.5 h-2.5 text-rose-400" />
                {t.trending}
              </span>
            )}
            {item.isVegetarian && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-600/30">
                <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                {t.vegetarian}
              </span>
            )}
            {item.isSeafood && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                <Fish className="w-2.5 h-2.5 text-cyan-400" />
                {t.seafood}
              </span>
            )}
            {item.isSpicy && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-950/60 text-red-400 border border-red-500/30">
                <Flame className="w-2.5 h-2.5 text-red-400" />
                {t.spicy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {item.servesPax && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900 text-stone-300 border border-stone-800">
                <Users className="w-3 h-3 text-amber-400" />
                {item.servesPax} Pax
              </span>
            )}
            {!item.isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/60">
                <AlertCircle className="w-3 h-3" />
                {t.soldOut}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-200 transition-colors leading-snug">
          {item.name}
        </h3>

        {/* Sinhala Title if available */}
        {item.sinhalaName && (
          <p className="text-xs text-amber-400/80 font-normal mt-0.5">
            {item.sinhalaName}
          </p>
        )}

        {/* Highlight tag */}
        {item.highlightNote && (
          <div className="mt-1.5 inline-block text-[10px] font-semibold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
            ★ {item.highlightNote}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="mt-2 text-xs text-stone-400 leading-relaxed line-clamp-3">
            {currentLang === 'si' && item.sinhalaDescription ? item.sinhalaDescription : item.description}
          </p>
        )}
      </div>

      {/* Footer: Price & Quick Action */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] font-medium text-amber-500/80">{t.currency}</span>
          <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">
            {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isStaffMode && onEditPrice && (
            <button
              onClick={() => onEditPrice(item)}
              className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition-colors cursor-pointer"
            >
              Edit Price
            </button>
          )}

          {onQuickShare && (
            <button
              onClick={() => onQuickShare(item)}
              title="Share this dish"
              className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
