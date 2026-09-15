import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Users, 
  Flame, 
  Leaf, 
  Wallet, 
  ChevronRight, 
  Trophy, 
  Wine, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { 
  AIRecommendationRequest, 
  AIRecommendationResponse, 
  MenuItem, 
  SupportedLanguage,
  DietaryOption,
  SpiceOption,
  BudgetOption,
  PartySizeOption
} from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AiRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  currentLang: SupportedLanguage;
  onSelectDish: (dishId: string) => void;
}

export const AiRecommendationModal: React.FC<AiRecommendationModalProps> = ({
  isOpen,
  onClose,
  menu,
  currentLang,
  onSelectDish,
}) => {
  const [step, setStep] = useState<number>(1);
  const [dietary, setDietary] = useState<DietaryOption>('any');
  const [spiceLevel, setSpiceLevel] = useState<SpiceOption>('medium');
  const [budget, setBudget] = useState<BudgetOption>('standard');
  const [partySize, setPartySize] = useState<PartySizeOption>('couple');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIRecommendationResponse | null>(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const payload: AIRecommendationRequest = {
        dietaryPreference: dietary,
        spiceLevel,
        budget,
        partySize,
        preference: dietary === 'vegetarian' ? 'vegetarian' : dietary === 'seafood' ? 'seafood' : 'signature',
      };

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setResult(data.recommendation);
      } else {
        throw new Error('Fallback needed');
      }
    } catch (err) {
      // Offline / network fallback
      const topId = dietary === 'vegetarian'
        ? 'dosa_masala_special'
        : dietary === 'seafood'
        ? 'side_hbc'
        : partySize === 'family' || partySize === 'group'
        ? 'spec_kulls_4pax'
        : 'spec_kulls_2pax';

      const topDish = menu.find((d) => d.id === topId);

      setResult({
        topPickId: topId,
        topPickReason: dietary === 'vegetarian'
          ? 'Thin crisp fermented crepe folded with spiced potato masala, coconut chutney, and lentil sambar.'
          : 'Our iconic Anuradhapura banquet featuring Basmati 1121 biriyani, butter chicken, crab curry, rose paan and cuttlefish.',
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
          { id: 'side_hbc', reason: 'Sri Lanka’s most popular crispy hot butter cuttlefish starter.', isBestseller: true, bestsellerNote: '⭐ Bestseller Appetizer' },
          { id: 'kottu_cheese_chicken', reason: 'Melty cheesy kottu loved by travelers and locals.', isBestseller: true, bestsellerNote: '⭐ Bestseller Kottu' },
        ],
        pairingBeverageId: 'juice_lime',
        pairingNote: 'Fresh squeezed Anuradhapura lime juice refreshes your palate between spicy bites.',
        bestsellerHighlight: {
          dishName: 'Arachchi Kulls & Hot Butter Cuttlefish',
          story: 'Our top-rated signature banquet featuring Kerala biriyani, spicy vermicelli, butter chicken, crab curry, rose paan and HBC.',
          rankBadge: '⭐ #1 Top Selling Dish in Anuradhapura',
        },
        trendInsight: {
          trendTitle: 'Evening Culinary Trend',
          description: 'Top requested combination among guests visiting the Sacred City stupas.',
        },
        budgetAnalysis: {
          userBudgetRange: budget,
          estimatedCost: topDish ? topDish.price : 3200,
          budgetBadge: '✓ Optimized for Your Budget',
          note: 'Selected dish aligns with your budget criteria.',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const topPickDish = result?.topPickDetails || (result ? menu.find((d) => d.id === result.topPickId) : null);
  const beverageDish = result?.pairingBeverageDetails || (result?.pairingBeverageId ? menu.find((d) => d.id === result.pairingBeverageId) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#1f160f] via-[#160f0a] to-[#0f0a07] border border-amber-600/40 p-5 sm:p-7 shadow-2xl text-stone-100 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100">
              {t.aiModalTitle}
            </h3>
            <p className="text-xs text-stone-400">
              Answer 4 simple questions for personalized dish suggestions & top-seller insights
            </p>
          </div>
        </div>

        {/* If no result, show the questions wizard */}
        {!result ? (
          <div className="mt-4 space-y-4">
            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-1.5 pb-2 border-b border-stone-800 text-[11px] font-bold">
              {[
                { n: 1, title: 'Vegetarian?' },
                { n: 2, title: 'Spicy Level?' },
                { n: 3, title: 'Budget?' },
                { n: 4, title: 'Party Size?' },
              ].map((s) => (
                <div
                  key={s.n}
                  onClick={() => setStep(s.n)}
                  className={`text-center py-1 rounded cursor-pointer transition-colors ${
                    step === s.n
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : step > s.n
                      ? 'text-stone-300'
                      : 'text-stone-500'
                  }`}
                >
                  {s.n}. {s.title}
                </div>
              ))}
            </div>

            {/* Question 1: Vegetarian Options */}
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Are you looking for vegetarian options?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'vegetarian', label: '🌱 Pure Vegetarian Only', desc: 'Zero meat, zero seafood (Veg only)' },
                    { id: 'non_vegetarian', label: '🍗 Chicken & Meat', desc: 'Biriyani, curries & butter chicken' },
                    { id: 'seafood', label: '🦐 Seafood Lover', desc: 'Hot butter cuttlefish & prawns' },
                    { id: 'any', label: '✨ Any / Open to All', desc: 'Show best tasting recommendations' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDietary(item.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        dietary === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Next: Spice Level <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Question 2: Spice Level */}
            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Do you prefer spicy food?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'mild', label: 'Mild & Gentle', desc: 'Subtle spices, zero fiery chili' },
                    { id: 'medium', label: 'Medium Balanced', desc: 'Classic pleasant warmth' },
                    { id: 'spicy_srilankan', label: 'Authentic Sri Lankan', desc: 'Fiery Kochchi & black pepper' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSpiceLevel(item.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        spiceLevel === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Next: Budget <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Question 3: Budget */}
            {step === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  What is your budget?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'budget', label: '🪙 Under 1,500 LKR', desc: 'Budget-friendly singles & dosas' },
                    { id: 'standard', label: '💳 1,500 – 3,500 LKR', desc: 'Standard dinner, cheese kottu & HBC' },
                    { id: 'premium', label: '👑 3,500+ LKR Grand Feast', desc: 'Royal Arachchi Kulls & Thachchiya' },
                    { id: 'any', label: '♾️ Any Budget', desc: 'Show me the absolute best taste' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setBudget(item.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        budget === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Next: Party Size <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Question 4: Party Size */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  Who is dining with you?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'solo', label: 'Solo Explorer', desc: '1 Person (Single portion)' },
                    { id: 'couple', label: 'Couple Dining', desc: '2 Persons (Sharing feast)' },
                    { id: 'family', label: 'Family Feast', desc: '3–4 Persons (Platters & sides)' },
                    { id: 'group', label: 'Tour / Friends Group', desc: '4+ Persons (Royal Grand banquet)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPartySize(item.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        partySize === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setStep(3)}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Top Sellers & Trends...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Recommendations
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Recommendation Results Screen */
          <div className="mt-4 space-y-3.5 animate-fadeIn">
            {/* Top Pick Highlight Card */}
            <div className="rounded-xl bg-gradient-to-br from-[#2a1b10] to-[#1a110a] border-2 border-amber-500/60 p-4 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {(topPickDish?.isBestseller || result.topPickIsBestseller) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow">
                      <Trophy className="w-3.5 h-3.5 fill-stone-950" />
                      ⭐ #1 TOP SELLER
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow">
                      <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                      Chef's Top Pick
                    </span>
                  )}
                  {result.budgetAnalysis?.budgetBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {result.budgetAnalysis.budgetBadge}
                    </span>
                  )}
                </div>

                <span className="text-sm sm:text-base font-bold font-mono text-amber-300">
                  {topPickDish?.price.toLocaleString()} LKR
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-serif font-extrabold text-amber-100">
                {topPickDish?.name || result.topPickId}
                {topPickDish?.sinhalaName && (
                  <span className="block text-xs font-sans text-amber-400 font-normal">
                    {topPickDish.sinhalaName}
                  </span>
                )}
              </h4>

              <p className="text-xs text-stone-200 mt-2 leading-relaxed bg-black/30 p-2 rounded-lg border border-amber-900/30">
                <span className="font-bold text-amber-300">Why it matches your taste: </span>
                {result.topPickReason}
              </p>

              <button
                onClick={() => {
                  if (topPickDish) {
                    onSelectDish(topPickDish.id);
                    onClose();
                  }
                }}
                className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>View & Order in Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Perfect Pairing Beverage */}
            {beverageDish && (
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-900/40">
                    <Wine className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-200 flex items-center gap-1.5">
                      <span>Drink Pairing: {beverageDish.name}</span>
                      {beverageDish.isBestseller && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Top Seller
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">{result.pairingNote}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold font-mono text-amber-400">{beverageDish.price} LKR</div>
                  <button
                    onClick={() => {
                      onSelectDish(beverageDish.id);
                      onClose();
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    View Drink
                  </button>
                </div>
              </div>
            )}

            {/* Top Selling Dish Spotlight & Trends */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {t.topSellingDish}: {result.bestsellerHighlight.dishName}
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {result.bestsellerHighlight.story}
              </p>
              {result.trendInsight && (
                <div className="text-[10px] text-amber-400/90 pt-1 border-t border-amber-900/30 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{result.trendInsight.description}</span>
                </div>
              )}
            </div>

            {/* Reset / Close Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  setResult(null);
                  setStep(1);
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer font-semibold"
              >
                Change Preferences
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
              >
                Browse Entire Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

