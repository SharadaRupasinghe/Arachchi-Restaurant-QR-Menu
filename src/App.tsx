import React, { useState, useEffect } from 'react';
import { MenuItem, CustomerReview, SupportedLanguage, CategoryId, CuisineType } from './types';
import { INITIAL_MENU } from './data/initialMenu';
import { INITIAL_REVIEWS } from './data/initialReviews';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { HeroBestseller } from './components/HeroBestseller';
import { AiRecommendationSection } from './components/AiRecommendationSection';
import { MenuSection } from './components/MenuSection';
import { AiRecommendationModal } from './components/AiRecommendationModal';
import { BackOfficeModal } from './components/BackOfficeModal';
import { FeedbackModal } from './components/FeedbackModal';
import { QrGeneratorModal } from './components/QrGeneratorModal';
import { Footer } from './components/Footer';
import { Sparkles, Star, QrCode, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Local or API state
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('arachchi_menu_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MENU;
      }
    }
    return INITIAL_MENU;
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('arachchi_reviews_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('arachchi_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  // Table number from QR URL: e.g. ?table=5
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('All');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isBackOfficeOpen, setIsBackOfficeOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLang];

  // Check URL table query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    if (tbl) {
      setTableNumber(tbl);
      localStorage.setItem('arachchi_table', tbl);
    } else {
      const stored = localStorage.getItem('arachchi_table');
      if (stored) setTableNumber(stored);
    }
  }, []);

  // Online/Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch live menu from server on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        const menuList = data.menu || data.data;
        if (data.success && Array.isArray(menuList)) {
          setMenu(menuList);
          localStorage.setItem('arachchi_menu_v1', JSON.stringify(menuList));
        }
      } catch (err) {
        console.log('Using offline cached menu');
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        const reviewsList = data.reviews || data.data;
        if (data.success && Array.isArray(reviewsList)) {
          setReviews(reviewsList);
          localStorage.setItem('arachchi_reviews_v1', JSON.stringify(reviewsList));
        }
      } catch (err) {
        console.log('Using cached reviews');
      }
    };

    fetchMenu();
    fetchReviews();
  }, []);

  // Persist language
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('arachchi_lang', lang);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Back-office: Update price or item properties
  const handleUpdateItem = async (id: string, updates: Partial<MenuItem>): Promise<boolean> => {
    const updatedMenu = menu.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setMenu(updatedMenu);
    localStorage.setItem('arachchi_menu_v1', JSON.stringify(updatedMenu));

    try {
      await fetch('/api/menu/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      showToast('Price & item updated successfully');
      return true;
    } catch (e) {
      showToast('Saved locally (Offline Mode)');
      return true;
    }
  };

  // Back-office: Add new item
  const handleAddItem = async (newItem: Partial<MenuItem>): Promise<boolean> => {
    const item: MenuItem = {
      id: `custom_${Date.now()}`,
      name: newItem.name || 'New Special',
      sinhalaName: newItem.sinhalaName,
      category: newItem.category || 'arachchi_specials',
      cuisine: newItem.cuisine || 'Arachchi Specials',
      price: newItem.price || 1000,
      description: newItem.description || '',
      isAvailable: true,
      isBestseller: newItem.isBestseller || false,
    };

    const updatedMenu = [item, ...menu];
    setMenu(updatedMenu);
    localStorage.setItem('arachchi_menu_v1', JSON.stringify(updatedMenu));

    try {
      await fetch('/api/menu/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, updates: item }),
      });
      showToast(`Added "${item.name}" to menu`);
      return true;
    } catch (e) {
      showToast(`Added "${item.name}" locally`);
      return true;
    }
  };

  // Back-office: Reset menu
  const handleResetMenu = async (): Promise<boolean> => {
    setMenu(INITIAL_MENU);
    localStorage.setItem('arachchi_menu_v1', JSON.stringify(INITIAL_MENU));
    try {
      await fetch('/api/menu/reset', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    showToast('Menu reset to initial state');
    return true;
  };

  // Feedback Submission
  const handleSubmitReview = async (reviewData: Omit<CustomerReview, 'id' | 'date'>): Promise<boolean> => {
    const newRev: CustomerReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('arachchi_reviews_v1', JSON.stringify(updatedReviews));

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
    } catch (e) {
      console.log('Review saved locally');
    }
    showToast('Thank you for your feedback!');
    return true;
  };

  // Dish Sharing
  const handleShareDish = (dish: MenuItem) => {
    const shareText = `Check out "${dish.name}" at Arachchi Restaurant Anuradhapura for LKR ${dish.price.toLocaleString()}!`;
    if (navigator.share) {
      navigator.share({
        title: `${dish.name} - Arachchi Restaurant`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      showToast(`Copied ${dish.name} info to clipboard`);
    }
  };

  // Scroll to dish
  const handleSelectDish = (dishId: string) => {
    const el = document.getElementById(`dish-card-${dishId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 3000);
    }
  };

  const bestsellers = menu.filter((item) => item.isBestseller || item.isTrending);

  return (
    <div className="min-h-screen bg-[#0d0906] text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        tableNumber={tableNumber}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenBackOffice={() => setIsBackOfficeOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {/* Top Selling Dish & Trends Spotlight */}
        <HeroBestseller
          currentLang={currentLang}
          bestsellers={bestsellers}
          onSelectDish={handleSelectDish}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />

        {/* Dedicated Prominent AI Recommendation Section */}
        <AiRecommendationSection
          menu={menu}
          currentLang={currentLang}
          onSelectDish={handleSelectDish}
          onOpenModal={() => setIsAiModalOpen(true)}
        />

        {/* Menu Section with Search, Category, Cuisine & Diet Filter */}
        <MenuSection
          menu={menu}
          currentLang={currentLang}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          onShareDish={handleShareDish}
          onEditPrice={(dish) => setIsBackOfficeOpen(true)}
        />
      </main>

      {/* Mobile Floating Quick Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#140e09]/95 backdrop-blur-md border-t border-amber-900/40 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center text-amber-400 font-semibold text-[10px] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>AI Picks</span>
        </button>

        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="flex flex-col items-center text-stone-300 font-semibold text-[10px] cursor-pointer"
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>Reviews</span>
        </button>

        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex flex-col items-center text-stone-300 font-semibold text-[10px] cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Table QR</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenBackOffice={() => setIsBackOfficeOpen(true)}
        isOnline={isOnline}
      />

      {/* Modals */}
      <AiRecommendationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        menu={menu}
        currentLang={currentLang}
        onSelectDish={handleSelectDish}
      />

      <BackOfficeModal
        isOpen={isBackOfficeOpen}
        onClose={() => setIsBackOfficeOpen(false)}
        menu={menu}
        onUpdateItem={handleUpdateItem}
        onAddItem={handleAddItem}
        onResetMenu={handleResetMenu}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        reviews={reviews}
        onSubmitReview={handleSubmitReview}
        currentLang={currentLang}
        tableNumber={tableNumber}
      />

      <QrGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        currentTable={tableNumber}
      />
    </div>
  );
}
