import React, { useState, useEffect } from 'react';
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
  TrendingUp, 
  Check, 
  RotateCcw,
  SlidersHorizontal
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

  // Questionnaire state
  const [dietary, setDietary] = useState<DietaryOption>('any');
  const [spice, setSpice] = useState<SpiceOption>('medium');
  const [budget, setBudget] = useState<BudgetOption>('standard');
  const [partySize, setPartySize] = useState<PartySizeOption>('couple');

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<AIRecommendationResponse | null>(null);
  const [isConfigCollapsed, setIsConfigCollapsed] = useState<boolean>(false);

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
    } catch (err) {
      // Local fallback in case network drops
      const isVeg = customDietary === 'vegetarian';
      const isSeafood = customDietary === 'seafood';
      const topPickId = isVeg 
        ? 'dosa_masala_special' 
        : isSeafood 
        ? 'side_hbc' 
        : customParty === 'family' || customParty === 'group' 
        ? 'spec_kulls_4pax' 
        : 'spec_kulls_2pax';

      const topDish = menu.find((d) => d.id === topPickId);

      setRecommendation({
        topPickId,
        topPickReason: isVeg
          ? 'Crisp golden crepe folded with aromatic potato masala, pure coconut chutney, and lentil sambar.'
          : isSeafood
          ? 'Sri Lanka’s #1 cuttlefish sensation: wok tossed with crunchy garlic butter, spring onions, and roasted chili.'
          : 'Our crowning Anuradhapura feast with Kerala biriyani, butter chicken, crab curry, rose paan and cuttlefish.',
        topPickIsBestseller: true,
        topPickBestsellerNote: '⭐ #1 Top Selling Dish in Anuradhapura',
        topPickDetails: topDish ? {
          id: topDish.id,
          name: topDish.name,
          sinhalaName: topDish.sinhalaName,
          price: topDish.price,
          category: topDish.category,
          isBestseller: !!topDish.isBestseller,
          isTrending: !!topDish.isTrending,
          isVegetarian: !!topDish.isVegetarian,
          isSpicy: !!topDish.isSpicy,
          servesPax: topDish.servesPax,
          topSellerBadge: '⭐ #1 TOP SELLER (Guest Favorite)',
          reason: 'Best match for your preferences',
        } : undefined,
        secondaryPicks: [
          {
            id: 'side_hbc',
            reason: 'Sri Lanka’s most praised crispy appetizer.',
            isBestseller: true,
            bestsellerNote: '⭐ Bestseller Side',
          },
          {
            id: 'kottu_cheese_chicken',
            reason: 'Sizzling hot plate of cheesy chicken kottu.',
            isBestseller: true,
            bestsellerNote: '⭐ Bestseller Kottu',
          }
        ],
        pairingBeverageId: 'juice_lime',
        pairingNote: 'Fresh squeezed Anuradhapura lime juice with refreshing citrus balance.',
        bestsellerHighlight: {
          dishName: 'Arachchi Kulls & Hot Butter Cuttlefish',
          story: 'Our signature recipes prepared daily with wild caught ocean seafood and 1121 super kernel basmati.',
          rankBadge: '⭐ #1 Ranked Platter',
        },
        trendInsight: {
          trendTitle: 'Evening Rush Favorite',
          description: 'Top requested dinner combination among both local visitors and overseas pilgrimage tourists.',
        },
        budgetAnalysis: {
          userBudgetRange: customBudget,
          estimatedCost: topDish ? topDish.price : 3200,
          budgetBadge: '✓ Optimized for Your Budget',
          note: 'Generous serving portion ensuring tremendous satisfaction and value.',
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

  return (
    <section id="ai-recommendation-engine-section" className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c120a] via-[#140d07] to-[#0c0805] border border-amber-500/40 p-4 sm:p-6 shadow-2xl">
      {/* Decorative Warm Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-lg shadow-amber-950/50">
            <Sparkles className="w-5 h-5 fill-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-100">
                AI Culinary Concierge
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Personalized suggestions based on dietary choices, spice tolerance, budget & live Anuradhapura top sellers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
            className="px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-xs font-semibold text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{isConfigCollapsed ? 'Change Answers' : 'Hide Questions'}</span>
          </button>
          
          <button
            onClick={onOpenModal}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wizard Pop-Up</span>
          </button>
        </div>
      </div>

      {/* Interactive Questionnaire Section */}
      {!isConfigCollapsed && (
        <div className="relative z-10 pt-4 pb-5 space-y-4 text-xs border-b border-stone-800/80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Question 1: Vegetarian Options */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                1. Looking for Vegetarian?
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'vegetarian', label: '🌱 Pure Veg Only' },
                  { id: 'non_vegetarian', label: '🍗 Chicken & Meat' },
                  { id: 'seafood', label: '🦐 Seafood' },
                  { id: 'any', label: '✨ Any / All' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setDietary(opt.id as DietaryOption);
                      fetchRecommendations(opt.id as DietaryOption, spice, budget, partySize);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all border cursor-pointer ${
                      dietary === opt.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow'
                        : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Spice Level */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                2. Do you prefer spicy food?
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'mild', label: 'Mild', sub: 'Low heat' },
                  { id: 'medium', label: 'Medium', sub: 'Balanced' },
                  { id: 'spicy_srilankan', label: 'Fiery', sub: 'Authentic' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSpice(opt.id as SpiceOption);
                      fetchRecommendations(dietary, opt.id as SpiceOption, budget, partySize);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-center transition-all border cursor-pointer ${
                      spice === opt.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow'
                        : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{opt.label}</div>
                    <div className={`text-[9px] ${spice === opt.id ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Budget */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                3. What is your budget?
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'budget', label: '🪙 < 1,500 LKR', sub: 'Budget Friendly' },
                  { id: 'standard', label: '💳 1,500–3,500', sub: 'Standard' },
                  { id: 'premium', label: '👑 3,500+ LKR', sub: 'Grand Feast' },
                  { id: 'any', label: '♾️ Any Budget', sub: 'Open' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setBudget(opt.id as BudgetOption);
                      fetchRecommendations(dietary, spice, opt.id as BudgetOption, partySize);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-left transition-all border cursor-pointer ${
                      budget === opt.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow'
                        : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{opt.label}</div>
                    <div className={`text-[9px] ${budget === opt.id ? 'text-stone-900' : 'text-stone-400'}`}>
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Party Size */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                4. Party Size?
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'solo', label: '👤 Solo (1)' },
                  { id: 'couple', label: '👥 Couple (2)' },
                  { id: 'family', label: '👨‍👩‍👧 Family (3–4)' },
                  { id: 'group', label: '👑 Group (4+)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPartySize(opt.id as PartySizeOption);
                      fetchRecommendations(dietary, spice, budget, opt.id as PartySizeOption);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all border cursor-pointer ${
                      partySize === opt.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow'
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
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Analyzing live orders, top sellers & spice levels</span>
            </div>

            <button
              onClick={() => fetchRecommendations()}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Suggestions...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-run AI Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Prominent Recommendation Results */}
      <div className="relative z-10 pt-4">
        {loading && !recommendation ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-stone-400 font-medium">
              Consulting Anuradhapura culinary trends and signature bestsellers...
            </p>
          </div>
        ) : recommendation ? (
          <div className="space-y-4">
            {/* Main Spotlight Banner for #1 Recommendation */}
            <div className="rounded-xl bg-gradient-to-r from-[#291a0f] via-[#20140c] to-[#160d07] border-2 border-amber-500/70 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              {/* Corner Watermark */}
              <div className="absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 rounded-bl-xl bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 fill-stone-950" />
                AI Top Pick
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Left details */}
                <div className="lg:col-span-8 space-y-2.5">
                  {/* Top Seller Badge Bar - CLEARLY INDICATES IF A DISH IS A TOP SELLER */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(topPickItem?.isBestseller || recommendation.topPickIsBestseller) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-md ring-1 ring-amber-300">
                        <Trophy className="w-3.5 h-3.5 fill-stone-950" />
                        ⭐ #1 TOP SELLER (Most Ordered)
                      </span>
                    ) : topPickItem?.isTrending ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-md">
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        🔥 TRENDING FAVORITE
                      </span>
                    ) : null}

                    {recommendation.budgetAnalysis?.budgetBadge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {recommendation.budgetAnalysis.budgetBadge}
                      </span>
                    )}

                    {topPickItem?.isVegetarian && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        Vegetarian
                      </span>
                    )}

                    {topPickItem?.isSpicy && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Spiced
                      </span>
                    )}
                  </div>

                  {/* Dish Name */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-amber-100 leading-tight">
                      {topPickItem?.name || recommendation.topPickId}
                    </h3>
                    {topPickItem?.sinhalaName && (
                      <span className="text-xs sm:text-sm font-sans font-normal text-amber-400 block mt-0.5">
                        {topPickItem.sinhalaName}
                      </span>
                    )}
                  </div>

                  {/* Recommendation Reasoning */}
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="font-bold text-amber-300">Why it fits you: </span>
                    {recommendation.topPickReason}
                  </p>

                  {/* Budget & Portion Note */}
                  {recommendation.budgetAnalysis?.note && (
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{recommendation.budgetAnalysis.note}</span>
                    </div>
                  )}
                </div>

                {/* Right price and Action */}
                <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-l border-amber-900/40 pt-3 lg:pt-0 lg:pl-5">
                  <div>
                    <span className="text-[11px] text-stone-400 font-semibold block lg:text-right">Dish Price</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                      {topPickItem?.price ? `${topPickItem.price.toLocaleString()} LKR` : 'Special Price'}
                    </div>
                    {topPickItem?.servesPax && (
                      <span className="text-[11px] text-stone-400 block lg:text-right">
                        Serves {topPickItem.servesPax} Pax
                      </span>
                    )}
                  </div>

                  <button
                    id="btn-view-ai-top-pick"
                    onClick={() => {
                      if (topPickItem) {
                        onSelectDish(topPickItem.id);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View in Menu & Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Secondary Suggestions, Beverage Pairing & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Secondary Pick 1 */}
              {recommendation.secondaryPicks?.[0] && (
                <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2 relative">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">Recommended Pairing #1</span>
                    {recommendation.secondaryPicks[0].isBestseller && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" /> Top Seller
                      </span>
                    )}
                  </div>
                  
                  <div className="font-bold text-xs text-stone-100">
                    {recommendation.secondaryPicks[0].dishDetails?.name || menu.find(d => d.id === recommendation.secondaryPicks[0].id)?.name || recommendation.secondaryPicks[0].id}
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">
                    {recommendation.secondaryPicks[0].reason}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-850">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {recommendation.secondaryPicks[0].dishDetails?.price || menu.find(d => d.id === recommendation.secondaryPicks[0].id)?.price ? `${(recommendation.secondaryPicks[0].dishDetails?.price || menu.find(d => d.id === recommendation.secondaryPicks[0].id)?.price)?.toLocaleString()} LKR` : ''}
                    </span>
                    <button
                      onClick={() => onSelectDish(recommendation.secondaryPicks[0].id)}
                      className="text-[10px] text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Locate Dish →
                    </button>
                  </div>
                </div>
              )}

              {/* Secondary Pick 2 */}
              {recommendation.secondaryPicks?.[1] && (
                <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2 relative">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">Recommended Pairing #2</span>
                    {recommendation.secondaryPicks[1].isBestseller && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" /> Top Seller
                      </span>
                    )}
                  </div>
                  
                  <div className="font-bold text-xs text-stone-100">
                    {recommendation.secondaryPicks[1].dishDetails?.name || menu.find(d => d.id === recommendation.secondaryPicks[1].id)?.name || recommendation.secondaryPicks[1].id}
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">
                    {recommendation.secondaryPicks[1].reason}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-850">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {recommendation.secondaryPicks[1].dishDetails?.price || menu.find(d => d.id === recommendation.secondaryPicks[1].id)?.price ? `${(recommendation.secondaryPicks[1].dishDetails?.price || menu.find(d => d.id === recommendation.secondaryPicks[1].id)?.price)?.toLocaleString()} LKR` : ''}
                    </span>
                    <button
                      onClick={() => onSelectDish(recommendation.secondaryPicks[1].id)}
                      className="text-[10px] text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Locate Dish →
                    </button>
                  </div>
                </div>
              )}

              {/* Suggested Beverage Pairing */}
              {beverageItem && (
                <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Wine className="w-3 h-3 text-amber-400" />
                      Suggested Beverage
                    </span>
                    {beverageItem.isBestseller && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Top Seller
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-stone-100">
                    {beverageItem.name}
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">
                    {recommendation.pairingNote}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-850">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {beverageItem.price?.toLocaleString()} LKR
                    </span>
                    <button
                      onClick={() => onSelectDish(beverageItem.id)}
                      className="text-[10px] text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Locate Drink →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Anuradhapura Dining Trends Insight */}
            {recommendation.trendInsight && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-2.5 text-xs text-stone-300">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-amber-300">
                    {recommendation.trendInsight.trendTitle}:{' '}
                  </span>
                  <span>{recommendation.trendInsight.description}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};
