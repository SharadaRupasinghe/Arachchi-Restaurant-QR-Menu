export type CuisineType = 'All' | 'Arachchi Specials' | 'Indian' | 'Chinese & Fusion' | 'Beverages & Desserts';

export type CategoryId = 
  | 'arachchi_specials'
  | 'dosa'
  | 'uttapam'
  | 'naan'
  | 'kottu'
  | 'rice_noodles'
  | 'spaghetti'
  | 'soup'
  | 'sides'
  | 'coffee'
  | 'juice'
  | 'drinks';

export interface MenuItem {
  id: string;
  name: string;
  sinhalaName?: string;
  tamilName?: string;
  category: CategoryId;
  cuisine: 'Arachchi Specials' | 'Indian' | 'Chinese & Fusion' | 'Beverages & Desserts';
  price: number; // In LKR
  description?: string;
  sinhalaDescription?: string;
  isBestseller?: boolean;
  isTrending?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isSeafood?: boolean;
  isAvailable: boolean;
  servesPax?: number;
  highlightNote?: string;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  sinhalaName: string;
  tamilName: string;
  cuisine: string;
  iconName: string;
  count?: number;
}

export type SupportedLanguage = 'en' | 'si' | 'ta' | 'fr' | 'de' | 'zh' | 'ru';

export interface CustomerReview {
  id: string;
  name: string;
  overallRating: number;
  foodRating: number;
  serviceRating: number;
  ambianceRating: number;
  tableNumber?: string;
  comment: string;
  tags: string[];
  date: string;
}

export type DietaryOption = 'vegetarian' | 'non_vegetarian' | 'seafood' | 'any';
export type SpiceOption = 'mild' | 'medium' | 'spicy_srilankan';
export type BudgetOption = 'budget' | 'standard' | 'premium' | 'any';
export type PartySizeOption = 'solo' | 'couple' | 'family' | 'group';

export interface AIRecommendationRequest {
  dietaryPreference?: DietaryOption;
  spiceLevel: SpiceOption;
  budget?: BudgetOption;
  partySize: PartySizeOption;
  preference?: 'signature' | 'seafood' | 'meat' | 'kottu' | 'vegetarian';
  occasion?: 'quick' | 'relaxed_dinner' | 'celebration' | 'tourist_special';
}

export interface RecommendationDishItem {
  id: string;
  name: string;
  sinhalaName?: string;
  price: number;
  category?: string;
  isBestseller: boolean;
  isTrending: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  servesPax?: number;
  topSellerBadge?: string;
  reason: string;
}

export interface AIRecommendationResponse {
  topPickId: string;
  topPickReason: string;
  topPickIsBestseller?: boolean;
  topPickBestsellerNote?: string;
  topPickDetails?: RecommendationDishItem;
  secondaryPicks: {
    id: string;
    reason: string;
    isBestseller?: boolean;
    bestsellerNote?: string;
    dishDetails?: RecommendationDishItem;
  }[];
  pairingBeverageId?: string;
  pairingNote?: string;
  pairingBeverageDetails?: RecommendationDishItem;
  bestsellerHighlight: {
    dishName: string;
    story: string;
    rankBadge?: string;
  };
  trendInsight?: {
    trendTitle: string;
    description: string;
  };
  budgetAnalysis?: {
    userBudgetRange: string;
    estimatedCost: number;
    budgetBadge: string;
    note: string;
  };
}
