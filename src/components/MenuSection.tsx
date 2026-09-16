import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Sparkles, X, ChevronRight, Utensils } from 'lucide-react';
import { MenuItem, CategoryId, CuisineType, SupportedLanguage } from '../types';
import { CATEGORIES } from '../data/initialMenu';
import { TRANSLATIONS } from '../data/translations';
import { DishCard } from './DishCard';

interface MenuSectionProps {
  menu: MenuItem[];
  currentLang: SupportedLanguage;
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  selectedCuisine: CuisineType;
  onSelectCuisine: (cuisine: CuisineType) => void;
  onShareDish: (dish: MenuItem) => void;
  onEditPrice?: (dish: MenuItem) => void;
  isStaffMode?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menu,
  currentLang,
  selectedCategory,
  onSelectCategory,
  selectedCuisine,
  onSelectCuisine,
  onShareDish,
  onEditPrice,
  isStaffMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterSeafoodOnly, setFilterSeafoodOnly] = useState(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState(false);
  const [filterSpicyOnly, setFilterSpicyOnly] = useState(false);

  const t = TRANSLATIONS[currentLang];

  const cuisines: CuisineType[] = [
    'All',
    'Arachchi Specials',
    'Indian',
    'Chinese & Fusion',
    'Beverages & Desserts',
  ];

  // Filtered menu calculation
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      // Cuisine filter
      if (selectedCuisine !== 'All' && item.cuisine !== selectedCuisine) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Dietary filters
      if (filterVegOnly && !item.isVegetarian) return false;
      if (filterSeafoodOnly && !item.isSeafood) return false;
      if (filterBestsellerOnly && !item.isBestseller) return false;
      if (filterSpicyOnly && !item.isSpicy) return false;

      // Search query (matches name, sinhala name, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSinhala = item.sinhalaName?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSinhala && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [
    menu,
    selectedCuisine,
    selectedCategory,
    filterVegOnly,
    filterSeafoodOnly,
    filterBestsellerOnly,
    filterSpicyOnly,
    searchQuery,
  ]);

  // Group by category when viewing 'all'
  const groupedCategories = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery.trim()) {
      return null;
    }
    const groups: { category: typeof CATEGORIES[0]; items: MenuItem[] }[] = [];
    CATEGORIES.forEach((cat) => {
      const items = filteredMenu.filter((item) => item.category === cat.id);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    });
    return groups;
  }, [filteredMenu, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Quick Filters Bar */}
      <div className="bg-[#18110a] p-3.5 sm:p-4 rounded-2xl border border-amber-900/40 shadow-xl space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/80" />
          <input
            id="input-menu-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-900/90 text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm border border-stone-700/80 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar-amber">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => {
                onSelectCuisine(c);
                if (c !== 'All') onSelectCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCuisine === c
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-900/30'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-800'
              }`}
            >
              {c === 'All' ? t.allCuisines : c}
            </button>
          ))}
        </div>

        {/* Dietary Tag Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-stone-800/80">
          <span className="text-[11px] text-stone-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" /> Filter:
          </span>
          <button
            onClick={() => setFilterBestsellerOnly(!filterBestsellerOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              filterBestsellerOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            ★ {t.bestseller}
          </button>
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              filterVegOnly
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            🌱 {t.vegetarian}
          </button>
          <button
            onClick={() => setFilterSeafoodOnly(!filterSeafoodOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              filterSeafoodOnly
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            🦐 {t.seafood}
          </button>
          <button
            onClick={() => setFilterSpicyOnly(!filterSpicyOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              filterSpicyOnly
                ? 'bg-red-950 text-red-300 border border-red-500'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            🌶️ {t.spicy}
          </button>

          {(filterBestsellerOnly || filterVegOnly || filterSeafoodOnly || filterSpicyOnly) && (
            <button
              onClick={() => {
                setFilterBestsellerOnly(false);
                setFilterVegOnly(false);
                setFilterSeafoodOnly(false);
                setFilterSpicyOnly(false);
              }}
              className="px-2 py-1 text-[11px] text-amber-400 hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-0.5 custom-scrollbar-amber">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          {t.allCuisines} ({menu.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = menu.filter((i) => i.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-900/40'
                  : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{currentLang === 'si' ? cat.sinhalaName : currentLang === 'ta' ? cat.tamilName : cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-950/40 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>
          Showing <strong className="text-amber-400 font-mono">{filteredMenu.length}</strong> items
          {selectedCategory !== 'all' && ` in ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`}
        </span>
        <span className="text-[11px] text-amber-500/80">Prices in Sri Lankan Rupees (LKR)</span>
      </div>

      {/* Dishes List: Grouped or Filtered Grid */}
      {groupedCategories ? (
        <div className="space-y-10">
          {groupedCategories.map(({ category, items }) => (
            <motion.section
              key={category.id}
              id={`category-sec-${category.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {currentLang === 'si' ? category.sinhalaName : currentLang === 'ta' ? category.tamilName : category.name}
                  </h3>
                  {currentLang !== 'si' && (
                    <span className="text-xs text-amber-400/70 font-normal">
                      {category.sinhalaName}
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {items.length} dishes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {items.map((item) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    currentLang={currentLang}
                    onQuickShare={onShareDish}
                    onEditPrice={onEditPrice}
                    isStaffMode={isStaffMode}
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredMenu.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              currentLang={currentLang}
              onQuickShare={onShareDish}
              onEditPrice={onEditPrice}
              isStaffMode={isStaffMode}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMenu.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-stone-950/50 border border-stone-800 p-6 space-y-3">
          <Utensils className="w-10 h-10 text-stone-600 mx-auto" />
          <h4 className="text-base font-bold text-stone-300">No dishes match your criteria</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the dietary filters to see our full Sri Lankan and Indian menu.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
              onSelectCuisine('All');
              setFilterBestsellerOnly(false);
              setFilterVegOnly(false);
              setFilterSeafoodOnly(false);
              setFilterSpicyOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer"
          >
            Show Full Menu
          </button>
        </div>
      )}
    </div>
  );
};
