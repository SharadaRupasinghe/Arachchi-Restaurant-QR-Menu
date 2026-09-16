import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trophy, 
  Flame, 
  Leaf, 
  Wallet, 
  Users, 
  ArrowRight, 
  Loader2, 
  Wine, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  MenuItem, 
  SupportedLanguage, 
  DietaryOption, 
  SpiceOption, 
  BudgetOption, 
  PartySizeOption, 
  AIRecommendationRequest, 
  AIRecommendationResponse 
} from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AiRecommendationSectionProps {
  menu: MenuItem[];
  currentLang: SupportedLanguage;
  onSelectDish: (dishId: string) => void;
  onOpenModal: () => void;
}

export const AiRecommendationSection: React.FC<AiRecommendationSectionProps> = ({
  menu,
  currentLang,
  onSelectDish,
  onOpenModal,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Questionnaire state - collapsed by default to save screen space
  const [dietary, setDietary] = useState<DietaryOption>('any');
  const [spice, setSpice] = useState<SpiceOption>('medium');
  const [budget, setBudget] = useState<BudgetOption>('standard');
  const [partySize, setPartySize] = useState<PartySizeOption>('couple');

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<AIRecommendationResponse | null>(null);
  
  // Compact by default!
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [showPairings, setShowPairings] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Helper to fetch recommendations
  const fetchRecommendations = async (
    customDietary = dietary,
    customSpice = spice,
    customBudget = budget,
    customParty = partySize
  ) => {
    setLoading(true);
    try {
      const payload: AIRecommendationRequest = {
        dietaryPreference: customDietary,
        spiceLevel: customSpice,
        budget: customBudget,
        partySize: customParty,
        preference: customDietary === 'vegetarian' ? 'vegetarian' : customDietary === 'seafood' ? 'seafood' : 'signature',
      };

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback
      setRecommendation({
        topPickId: 'spec_kulls_2pax',
        topPickReason: 'Arachchi Signature Kulls is Anuradhapura’s #1 ordered sharing delicacy.',
        topPickIsBestseller: true,
        secondaryPicks: [
          {
            id: 'bev_king_coconut',
            reason: 'Chilled sweet natural king coconut to refresh the palate.',
            isBestseller: true,
          },
          {
            id: 'star_cutlet',
            reason: 'Crisp golden Lankan cutlets complement hearty fusion dishes.',
            isBestseller: false,
          }
        ],
        pairingBeverageId: 'bev_king_coconut',
        pairingNote: 'Perfect tropical accompaniment with fresh aromatic spices.',
        budgetAnalysis: {
          budgetBadge: 'Within Budget',
          note: 'Signature portion offering supreme value and satisfaction.',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Run initial recommendation on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const topPickItem = recommendation?.topPickDetails || (recommendation ? menu.find((d) => d.id === recommendation.topPickId) : null);
  const beverageItem = recommendation?.pairingBeverageDetails || (recommendation?.pairingBeverageId ? menu.find((d) => d.id === recommendation.pairingBeverageId) : null);

  const isSinhala = currentLang === 'si';

  // 1. Minimized View (Ultra-Compact Strip - takes only ~46px)
  if (isMinimized && recommendation && topPickItem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl bg-gradient-to-r from-[#1c120a] to-[#120b07] border border-amber-500/30 px-3 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500 text-stone-950 shrink-0">
            <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
          </div>
          <div className="truncate text-xs">
            <span className="text-amber-400 font-bold mr-1.5">
              ආරච්චිගේ උදව් ඕනද කෑම Select කරගන්න? (මම ආරච්චි AI):
            </span>
            <span className="text-stone-100 font-semibold">{topPickItem.name}</span>
            <span className="text-amber-300 font-mono ml-2 font-bold">
              {topPickItem.price ? `${topPickItem.price.toLocaleString()} LKR` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectDish(topPickItem.id)}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t.viewDetails}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs border border-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="Expand AI Concierge"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // 2. Standard Compact View
  return (
    <motion.section
      id="ai-recommendation-engine-section"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mb-4 sm:mb-5 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1c120a] via-[#140d07] to-[#0c0805] border border-amber-500/40 p-3 sm:p-4 shadow-xl"
    >
      {/* Header Bar - Compact Single Line */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-950/40 shrink-0">
            <Sparkles className="w-4 h-4 fill-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-serif font-bold text-amber-100 leading-tight">
                ආරච්චිගේ උදව් ඕනද කෑම Select කරගන්න? මම ආරච්චි AI.
              </h2>
              <span className="hidden xs:inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isConfigOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 border-stone-700/60'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{isConfigOpen ? 'Close Answers' : 'Preferences'}</span>
            <span className="sm:hidden">{isConfigOpen ? 'Close' : 'Filter'}</span>
          </button>
          
          <button
            onClick={onOpenModal}
            title={t.aiRecommendBtn}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Wizard</span>
          </button>

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs transition-colors cursor-pointer"
            title="Minimize section"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Questionnaire Section */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 pt-3 pb-3 space-y-3 text-xs border-b border-stone-800/80 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Question 1: Vegetarian */}
              <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 space-y-1.5">
                <label className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400" />
                  Diet
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'vegetarian', label: '🌱 Veg Only' },
                    { id: 'non_vegetarian', label: '🍗 Chicken & Meat' },
                    { id: 'seafood', label: '🦐 Seafood' },
                    { id: 'any', label: '✨ Any' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setDietary(opt.id as DietaryOption);
                        fetchRecommendations(opt.id as DietaryOption, spice, budget, partySize);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-semibold text-left transition-all border cursor-pointer truncate ${
                        dietary === opt.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Spice Level */}
              <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 space-y-1.5">
                <label className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Spice Heat
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'mild', label: 'Mild' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'spicy_srilankan', label: 'Spicy 🔥' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSpice(opt.id as SpiceOption);
                        fetchRecommendations(dietary, opt.id as SpiceOption, budget, partySize);
                      }}
                      className={`px-1.5 py-1 rounded text-center text-[10px] font-semibold transition-all border cursor-pointer ${
                        spice === opt.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Budget */}
              <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 space-y-1.5">
                <label className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-amber-400" />
                  Budget
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'budget', label: '🪙 <1.5k' },
                    { id: 'standard', label: '💳 1.5–3.5k' },
                    { id: 'premium', label: '👑 3.5k+' },
                    { id: 'any', label: '♾️ Any' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setBudget(opt.id as BudgetOption);
                        fetchRecommendations(dietary, spice, opt.id as BudgetOption, partySize);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-semibold text-left transition-all border cursor-pointer truncate ${
                        budget === opt.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Party Size */}
              <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 space-y-1.5">
                <label className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                  <Users className="w-3 h-3 text-sky-400" />
                  Party
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'solo', label: '👤 1 Pax' },
                    { id: 'couple', label: '👥 2 Pax' },
                    { id: 'family', label: '👨‍👩‍👧 3-4' },
                    { id: 'group', label: '👑 4+' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setPartySize(opt.id as PartySizeOption);
                        fetchRecommendations(dietary, spice, budget, opt.id as PartySizeOption);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-semibold text-left transition-all border cursor-pointer truncate ${
                        partySize === opt.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400">Personalizing dishes to your dietary preferences</span>
              <button
                onClick={() => fetchRecommendations()}
                disabled={loading}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                <span>Refresh Suggestions</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Recommendation Content - Sleek & Compact */}
      <div className="relative z-10 pt-2.5">
        {loading && !recommendation ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            <p className="text-xs text-stone-400">Finding the best dish for you...</p>
          </div>
        ) : recommendation && topPickItem ? (
          <div className="space-y-2.5">
            {/* Spotlight Card: Compact 1-Row on Desktop */}
            <div className="rounded-xl bg-gradient-to-r from-[#24170d] via-[#1a1109] to-[#140e09] border border-amber-500/50 p-3 sm:p-3.5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Left Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-stone-950">
                    <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
                    AI Top Pick
                  </span>

                  {(topPickItem.isBestseller || recommendation.topPickIsBestseller) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Trophy className="w-2.5 h-2.5" />
                      #1 Top Seller
                    </span>
                  )}

                  {topPickItem.isVegetarian && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                      <Leaf className="w-2.5 h-2.5" />
                      Veg
                    </span>
                  )}

                  {topPickItem.isSpicy && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300">
                      <Flame className="w-2.5 h-2.5" />
                      Spiced
                    </span>
                  )}

                  {topPickItem.servesPax && (
                    <span className="text-[10px] text-stone-400 font-medium">
                      • Serves {topPickItem.servesPax}
                    </span>
                  )}
                </div>

                {/* Dish Name & Sinhala */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-amber-100 leading-snug">
                    {topPickItem.name}
                  </h3>
                  {topPickItem.sinhalaName && (
                    <span className="text-xs text-amber-400/90 font-normal">
                      ({topPickItem.sinhalaName})
                    </span>
                  )}
                </div>

                {/* Reason */}
                <p className="text-xs text-stone-300 leading-snug max-w-2xl line-clamp-2">
                  <span className="text-amber-400 font-semibold">Why you'll love it: </span>
                  {recommendation.topPickReason}
                </p>
              </div>

              {/* Right Price & Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-medium">Price</span>
                  <span className="text-lg sm:text-xl font-mono font-black text-amber-300">
                    {topPickItem.price ? `${topPickItem.price.toLocaleString()} LKR` : ''}
                  </span>
                </div>

                <button
                  id="btn-view-ai-top-pick"
                  onClick={() => onSelectDish(topPickItem.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>{t.viewDetails} &amp; Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Secondary Pairings Bar */}
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setShowPairings(!showPairings)}
                className="text-xs font-semibold text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {showPairings ? 'Hide Pairing Suggestions' : '✨ Show Beverage & Side Pairings (2)'}
                </span>
                {showPairings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="text-[11px] text-stone-500 hover:text-stone-400 transition-colors cursor-pointer"
              >
                Minimize Section
              </button>
            </div>

            {/* Secondary Pairings (Shown only on request) */}
            <AnimatePresence>
              {showPairings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden pt-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {recommendation.secondaryPicks?.[0] && (
                      <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-amber-400 font-bold block">Recommended Side</span>
                          <span className="font-semibold text-stone-100 truncate block">
                            {recommendation.secondaryPicks[0].dishDetails?.name || menu.find(d => d.id === recommendation.secondaryPicks[0].id)?.name || recommendation.secondaryPicks[0].id}
                          </span>
                        </div>
                        <button
                          onClick={() => onSelectDish(recommendation.secondaryPicks[0].id)}
                          className="text-[11px] text-amber-400 hover:underline font-bold shrink-0 cursor-pointer"
                        >
                          View →
                        </button>
                      </div>
                    )}

                    {beverageItem && (
                      <div className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-amber-400 font-bold block flex items-center gap-1">
                            <Wine className="w-3 h-3" /> Beverage Pairing
                          </span>
                          <span className="font-semibold text-stone-100 truncate block">
                            {beverageItem.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onSelectDish(beverageItem.id)}
                          className="text-[11px] text-amber-400 hover:underline font-bold shrink-0 cursor-pointer"
                        >
                          View →
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
};
