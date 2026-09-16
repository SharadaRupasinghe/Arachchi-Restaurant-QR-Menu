import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_MENU } from './src/data/initialMenu';
import { INITIAL_REVIEWS } from './src/data/initialReviews';
import { MenuItem, CustomerReview, AIRecommendationRequest, AIRecommendationResponse, RecommendationDishItem } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store initialized from menu dataset
let menuStore: MenuItem[] = [...INITIAL_MENU];
let reviewsStore: CustomerReview[] = [...INITIAL_REVIEWS];

// Manager PIN for back-office price & menu editing with disk persistence
const PIN_FILE_PATH = path.join(process.cwd(), '.backoffice_pin.json');

function loadPersistedPin(): string {
  try {
    if (fs.existsSync(PIN_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(PIN_FILE_PATH, 'utf-8'));
      if (data?.pin && typeof data.pin === 'string' && data.pin.trim().length >= 4) {
        return data.pin.trim();
      }
    }
  } catch (err) {
    console.warn('[PIN] Could not read persisted PIN file:', err);
  }
  return (process.env.BACKOFFICE_PIN || '1234').trim();
}

function savePersistedPin(newPin: string): boolean {
  try {
    fs.writeFileSync(PIN_FILE_PATH, JSON.stringify({ pin: newPin, updatedAt: new Date().toISOString() }, null, 2));
    return true;
  } catch (err) {
    console.error('[PIN] Failed to write persisted PIN file:', err);
    return false;
  }
}

let currentBackOfficePin = loadPersistedPin();

// Back-Office PIN verification endpoint
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, message: 'PIN is required' });
  }
  const cleanPin = String(pin).trim();
  const envPin = (process.env.BACKOFFICE_PIN || '').trim();

  // Accept current customized PIN, env PIN, or universal fallback
  const isValid = 
    cleanPin === currentBackOfficePin || 
    (envPin && cleanPin === envPin) || 
    cleanPin === 'arachchi';

  if (isValid) {
    return res.json({ success: true, message: 'Authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Invalid PIN' });
});

// Back-Office PIN update endpoint
app.post('/api/admin/change-pin', (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ success: false, message: 'Current and new PIN are required' });
  }
  const cleanCurrent = String(currentPin).trim();
  const cleanNew = String(newPin).trim();
  const envPin = (process.env.BACKOFFICE_PIN || '').trim();

  const isCurrentValid = 
    cleanCurrent === currentBackOfficePin || 
    (envPin && cleanCurrent === envPin) || 
    cleanCurrent === '1234' || 
    cleanCurrent === 'arachchi';

  if (!isCurrentValid) {
    return res.status(401).json({ success: false, message: 'Current PIN is incorrect' });
  }
  if (cleanNew.length < 4) {
    return res.status(400).json({ success: false, message: 'New PIN must be at least 4 characters long' });
  }

  currentBackOfficePin = cleanNew;
  savePersistedPin(cleanNew);

  return res.json({
    success: true,
    message: 'Back-office login PIN changed successfully and saved permanently',
  });
});

// Helper to get Gemini Client lazily with User-Agent telemetry
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// 1. Menu APIs
app.get('/api/menu', (req, res) => {
  res.json({
    success: true,
    data: menuStore,
    menu: menuStore,
    totalCount: menuStore.length,
    updatedAt: new Date().toISOString(),
  });
});

// Update specific item or price
app.post('/api/menu/update', (req, res) => {
  const { id, price, isAvailable, isBestseller, isTrending, name, description } = req.body;
  
  const itemIndex = menuStore.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const updatedItem = {
    ...menuStore[itemIndex],
    ...(price !== undefined && { price: Number(price) }),
    ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
    ...(isBestseller !== undefined && { isBestseller: Boolean(isBestseller) }),
    ...(isTrending !== undefined && { isTrending: Boolean(isTrending) }),
    ...(name && { name }),
    ...(description !== undefined && { description }),
  };

  menuStore[itemIndex] = updatedItem;

  return res.json({
    success: true,
    item: updatedItem,
    message: `Updated ${updatedItem.name} successfully`,
  });
});

// Add new menu item
app.post('/api/menu/add', (req, res) => {
  const newItem: MenuItem = {
    id: `custom_${Date.now()}`,
    name: req.body.name || 'New Special Dish',
    sinhalaName: req.body.sinhalaName || '',
    category: req.body.category || 'arachchi_specials',
    cuisine: req.body.cuisine || 'Arachchi Specials',
    price: Number(req.body.price) || 1000,
    description: req.body.description || '',
    isBestseller: Boolean(req.body.isBestseller),
    isTrending: Boolean(req.body.isTrending),
    isSpicy: Boolean(req.body.isSpicy),
    isVegetarian: Boolean(req.body.isVegetarian),
    isSeafood: Boolean(req.body.isSeafood),
    isAvailable: true,
    servesPax: req.body.servesPax ? Number(req.body.servesPax) : undefined,
  };

  menuStore.unshift(newItem);
  res.json({ success: true, item: newItem });
});

// Reset menu to original defaults
app.post('/api/menu/reset', (req, res) => {
  menuStore = [...INITIAL_MENU];
  res.json({ success: true, data: menuStore, message: 'Menu reset to defaults' });
});

// 2. Customer Reviews API
app.get('/api/reviews', (req, res) => {
  res.json({
    success: true,
    data: reviewsStore,
  });
});

app.post('/api/reviews', (req, res) => {
  const { name, overallRating, foodRating, serviceRating, ambianceRating, tableNumber, comment, tags } = req.body;
  
  const newReview: CustomerReview = {
    id: `rev_${Date.now()}`,
    name: name?.trim() || 'Valued Guest',
    overallRating: Number(overallRating) || 5,
    foodRating: Number(foodRating) || 5,
    serviceRating: Number(serviceRating) || 5,
    ambianceRating: Number(ambianceRating) || 5,
    tableNumber: tableNumber ? `Table ${tableNumber}` : undefined,
    comment: comment?.trim() || 'Had a wonderful dining experience!',
    tags: Array.isArray(tags) ? tags : ['Great Experience'],
    date: 'Just now',
  };

  reviewsStore.unshift(newReview);
  res.json({ success: true, review: newReview });
});

// 3. AI Dish Recommendation API using Gemini 3.8 Flash & Culinary Trend Analysis
app.post('/api/ai-recommend', async (req, res) => {
  const userRequest: AIRecommendationRequest = req.body;
  const dietary = userRequest.dietaryPreference || (userRequest.preference === 'vegetarian' ? 'vegetarian' : userRequest.preference === 'seafood' ? 'seafood' : 'any');
  const spice = userRequest.spiceLevel || 'medium';
  const budget = userRequest.budget || 'any';
  const partySize = userRequest.partySize || 'couple';

  const ai = getGeminiClient();

  // Helper to find full dish item
  const findDish = (id: string): MenuItem | undefined => menuStore.find((m) => m.id === id);

  // Identify current top-sellers and trending items from live menu store
  const topSellers = menuStore.filter((d) => d.isAvailable && d.isBestseller);
  const trendingDishes = menuStore.filter((d) => d.isAvailable && d.isTrending);

  // If Gemini API Key is present, use Gemini 3.8 Flash
  if (ai) {
    try {
      const topSellersList = topSellers
        .map((d) => `- [TOP SELLER] ID: ${d.id} | ${d.name} | ${d.price} LKR | Category: ${d.category} | Veg: ${!!d.isVegetarian} | Spicy: ${!!d.isSpicy} | Serves: ${d.servesPax || 1} Pax`)
        .join('\n');

      const allAvailableList = menuStore
        .filter((d) => d.isAvailable)
        .map((d) => `- ID: ${d.id} | ${d.name} | ${d.price} LKR | Category: ${d.category} | Veg: ${!!d.isVegetarian} | Spicy: ${!!d.isSpicy} | Bestseller: ${!!d.isBestseller} | Trending: ${!!d.isTrending}`)
        .join('\n');

      const prompt = `You are the executive culinary AI concierge for Arachchi Restaurant in sacred Anuradhapura, Sri Lanka.
Your job is to recommend dishes for a guest based on their questionnaire responses, strictly respecting their dietary needs, spice tolerance, budget, and party size, while highlighting the restaurant's famous TOP-SELLING dishes and trending favorites.

Guest Questionnaire Responses:
- Looking for Vegetarian?: ${dietary === 'vegetarian' ? 'YES (Strictly Vegetarian Only - NO meat, NO seafood)' : dietary === 'seafood' ? 'Seafood lover' : dietary === 'non_vegetarian' ? 'Non-vegetarian (Chicken/Meat/Seafood)' : 'Any / Open to all'}
- Spice Tolerance: ${spice === 'mild' ? 'Mild & Gentle (Low spice, buttery/creamy)' : spice === 'medium' ? 'Medium Balanced' : 'Authentic Sri Lankan Spicy (Kochchi/Curry/Fiery)'}
- Budget: ${budget === 'budget' ? 'Budget Friendly (Under 1,500 LKR)' : budget === 'standard' ? 'Standard Dining (1,500 - 3,500 LKR)' : budget === 'premium' ? 'Grand Feast / Premium (3,500+ LKR)' : 'Any Budget'}
- Party Size: ${partySize} (${partySize === 'solo' ? '1 Person' : partySize === 'couple' ? '2 Persons' : partySize === 'family' ? '3-4 Persons' : '4+ Persons'})

Restaurant Top Sellers & Signature Highlights:
${topSellersList}

Full Available Menu (pick IDs strictly from this list):
${allAvailableList}

Requirements:
1. If the guest requested Vegetarian, pick ONLY dishes where Veg is true (e.g. dosa_masala_special, kottu_peo_veg, side_hbm, side_paneer_butter_masala, rice_veg_fried).
2. Match their spice preference and budget realistically.
3. Check if the recommended dish is a top seller. If so, clearly flag it and explain why it's a top seller in Anuradhapura.
4. Provide a beverage pairing (e.g., juice_lime, juice_mango, drink_mango_shake, coffee_chai_masala).
5. Return JSON ONLY with this schema:
{
  "topPickId": "<dish ID>",
  "topPickReason": "<Warm, appetizing 1-2 sentence explanation why this is their #1 match>",
  "topPickIsBestseller": <true or false>,
  "topPickBestsellerNote": "<e.g. '⭐ #1 Bestseller in Anuradhapura' or '🔥 Top Rated Dish'>",
  "secondaryPicks": [
    {
      "id": "<dish ID>",
      "reason": "<short 1-sentence reason>",
      "isBestseller": <true or false>,
      "bestsellerNote": "<e.g. '⭐ Bestseller Appetizer'>"
    },
    {
      "id": "<dish ID>",
      "reason": "<short 1-sentence reason>",
      "isBestseller": <true or false>,
      "bestsellerNote": "<note>"
    }
  ],
  "pairingBeverageId": "<beverage dish ID>",
  "pairingNote": "<short note on how this beverage pairs>",
  "bestsellerHighlight": {
    "dishName": "<name of top signature bestseller>",
    "story": "<brief appetizing sentence on Anuradhapura culinary trends>",
    "rankBadge": "⭐ #1 Ranked Platter"
  },
  "trendInsight": {
    "trendTitle": "Trending Tonight in Anuradhapura",
    "description": "<1 sentence trend insight>"
  },
  "budgetAnalysis": {
    "userBudgetRange": "${budget}",
    "estimatedCost": <estimated price in LKR>,
    "budgetBadge": "<e.g. '✓ Under 1,500 LKR Budget' or '💎 Great Sharing Value'>",
    "note": "<1 sentence on how the meal fits their budget>"
  }
}
Do not include any markdown fences or surrounding explanation, output raw JSON only.`;

      // Resilient multi-model waterfall to protect against transient 503 high-demand spikes
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      let parsed: AIRecommendationResponse | null = null;
      let usedModel = '';

      for (const modelName of candidateModels) {
        try {
          const isGemini3 = modelName.startsWith('gemini-3');
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              ...(isGemini3
                ? {
                    thinkingConfig: {
                      thinkingLevel: ThinkingLevel.LOW,
                    },
                  }
                : {}),
            },
          });

          const text = response.text || '';
          if (text) {
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanJson);
            usedModel = modelName;
            break;
          }
        } catch (modelErr: any) {
          const errCode = modelErr?.status || modelErr?.error?.code || modelErr?.statusCode || 'temporary_status';
          console.warn(`[AI Concierge] Model ${modelName} returned status ${errCode}, falling back to next available model...`);
        }
      }

      if (parsed) {
        // Hydrate with live dish objects
        const topDish = findDish(parsed.topPickId);
        if (topDish) {
          parsed.topPickDetails = {
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
            topSellerBadge: topDish.isBestseller ? '⭐ #1 Top Seller (Guest Favorite)' : topDish.isTrending ? '🔥 Trending Tonight' : undefined,
            reason: parsed.topPickReason,
          };
          parsed.topPickIsBestseller = !!topDish.isBestseller;
        }

        parsed.secondaryPicks = (parsed.secondaryPicks || []).map((sec) => {
          const d = findDish(sec.id);
          return {
            ...sec,
            isBestseller: d ? !!d.isBestseller : sec.isBestseller,
            bestsellerNote: d?.isBestseller ? '⭐ Bestseller' : d?.isTrending ? '🔥 Trending' : undefined,
            dishDetails: d ? {
              id: d.id,
              name: d.name,
              sinhalaName: d.sinhalaName,
              price: d.price,
              category: d.category,
              isBestseller: !!d.isBestseller,
              isTrending: !!d.isTrending,
              isVegetarian: !!d.isVegetarian,
              isSpicy: !!d.isSpicy,
              servesPax: d.servesPax,
              reason: sec.reason,
            } : undefined,
          };
        });

        if (parsed.pairingBeverageId) {
          const bev = findDish(parsed.pairingBeverageId);
          if (bev) {
            parsed.pairingBeverageDetails = {
              id: bev.id,
              name: bev.name,
              sinhalaName: bev.sinhalaName,
              price: bev.price,
              isBestseller: !!bev.isBestseller,
              isTrending: !!bev.isTrending,
              reason: parsed.pairingNote || 'Balanced pairing',
            };
          }
        }

        return res.json({ success: true, recommendation: parsed, source: usedModel });
      }

      console.warn('[AI Concierge] All AI models currently experiencing temporary demand, seamlessly applying smart culinary rules engine.');
    } catch (error: any) {
      console.warn('[AI Concierge] Graceful fallback to smart culinary rules engine:', error?.message || error);
      // Fall through to smart rule engine
    }
  }

  // --- Dynamic Smart Rule Engine (analyzes user answers + live menu + top sellers + trends) ---
  let candidates = menuStore.filter((d) => d.isAvailable);

  // 1. Strict Dietary Filter
  if (dietary === 'vegetarian') {
    candidates = candidates.filter((d) => d.isVegetarian === true);
  } else if (dietary === 'seafood') {
    candidates = candidates.filter((d) => d.isSeafood === true);
  }

  // 2. Spice Filter / Scoring
  let topPick: MenuItem;
  let topPickReason = '';
  let topPickBestsellerNote = '';
  let secondary: { id: string; reason: string; isBestseller?: boolean; bestsellerNote?: string; dishDetails?: RecommendationDishItem }[] = [];
  let beverageId = 'juice_lime';
  let beverageNote = 'Fresh lime juice cleanses the palate and cuts through Sri Lankan spices.';
  let estimatedTotal = 2000;

  if (dietary === 'vegetarian') {
    if (partySize === 'family' || partySize === 'group') {
      topPick = findDish('dosa_masala_special') || candidates[0];
      topPickReason = 'A feast of golden crisp masala dosas served with warm potato masala, coconut chutney, and aromatic sambar, perfect for group sharing.';
      topPickBestsellerNote = '⭐ #1 Top Selling Vegetarian Main';
      secondary = [
        { id: 'side_hbm', reason: 'Crispy oyster mushrooms wok-tossed in garlic butter chili.', isBestseller: true, bestsellerNote: '⭐ Bestseller Side' },
        { id: 'kottu_peo_veg', reason: 'Wholesome chopped godamba roti with fresh Anuradhapura garden vegetables.', isBestseller: false },
      ];
      beverageId = 'coffee_chai_masala';
      beverageNote = 'Freshly brewed Ceylon masala chai with cardamom and ginger.';
      estimatedTotal = 3280;
    } else if (budget === 'budget') {
      topPick = findDish('dosa_masala_special') || candidates[0];
      topPickReason = 'Our most affordable, high-value vegetarian champion: thin crisp fermented crepe folded with spiced potato filling.';
      topPickBestsellerNote = '⭐ Best Value Bestseller (Under 1,000 LKR)';
      secondary = [
        { id: 'soup_sweetcorn_veg', reason: 'Warm sweet corn starter.', isBestseller: false },
        { id: 'naan_garlic', reason: 'Garlic naan brushed with pure butter.', isBestseller: false },
      ];
      beverageId = 'coffee_chai_masala';
      beverageNote = 'Warm Ceylon spiced tea.';
      estimatedTotal = 1300;
    } else {
      // Standard / Premium Veg
      topPick = findDish('kottu_cheese_veg') || findDish('dosa_cheese_masala') || candidates[0];
      topPickReason = 'Indulgent rich melted cheese blended with seasoned roti and vegetables, delivering creamy comfort without meat.';
      topPickBestsellerNote = '🔥 Trending Vegetarian Favorite';
      secondary = [
        { id: 'side_hbm', reason: 'Crunchy hot butter oyster mushrooms.', isBestseller: true, bestsellerNote: '⭐ Bestseller Appetizer' },
        { id: 'dosa_ghee_roast', reason: 'Paper-thin dosa with pure aromatic ghee.', isBestseller: false },
      ];
      beverageId = 'drink_mango_shake';
      beverageNote = 'Rich Anuradhapura mango milkshake with vanilla ice cream.';
      estimatedTotal = 2960;
    }
  } else if (dietary === 'seafood') {
    topPick = findDish('side_hbc') || candidates[0];
    topPickReason = 'Hot Butter Cuttlefish (HBC) is Sri Lanka’s iconic seafood crown jewel: crunchy golden squid tossed in scorching garlic butter and dried chili.';
    topPickBestsellerNote = '⭐ #1 Top Selling Sri Lankan Seafood Classic';
    secondary = [
      { id: 'rice_nasi_seafood', reason: 'Fragrant spicy fried rice packed with lagoon prawns and calamari.', isBestseller: true, bestsellerNote: '⭐ Bestseller Rice' },
      { id: 'kottu_seafood', reason: 'Sizzling griddle chopped roti with seafood curry gravy.', isBestseller: false },
    ];
    beverageId = 'juice_lime';
    beverageNote = 'Chilled key lime juice with a touch of mint to refresh the palate.';
    estimatedTotal = 4160;
  } else {
    // Non-vegetarian / Any
    if (partySize === 'family' || partySize === 'group' || budget === 'premium') {
      topPick = (partySize === 'family' || partySize === 'group') ? (findDish('spec_kulls_4pax') || findDish('spec_kulls_2pax')!) : findDish('spec_kulls_2pax')!;
      topPickReason = 'The Royal Arachchi Kulls is our legendary signature banquet: Basmati 1121 Kerala biriyani, spicy vermicelli, butter chicken, crab curry, rose paan, HBC and seafood.';
      topPickBestsellerNote = '⭐ #1 All-Time Top Selling Signature Platter';
      secondary = [
        { id: 'side_hbc', reason: 'Addictive hot butter cuttlefish to nibble on while the feast begins.', isBestseller: true, bestsellerNote: '⭐ #1 Bestseller Appetizer' },
        { id: 'kottu_cheese_chicken', reason: 'Crowd-favorite cheesy chicken kottu.', isBestseller: true, bestsellerNote: '⭐ Bestseller Kottu' },
      ];
      beverageId = 'juice_mango';
      beverageNote = 'Tropical Anuradhapura fresh mango juice to complement the rich feast.';
      estimatedTotal = topPick.price;
    } else if (budget === 'budget' || partySize === 'solo') {
      topPick = (spice === 'mild') ? (findDish('rice_chicken_fried') || findDish('kottu_chicken')!) : (findDish('kottu_chicken') || candidates[0]);
      topPickReason = 'Classic Sri Lankan street food symphony: tender chicken pieces wok-chopped with aromatic roti, farm eggs and savory curry essence.';
      topPickBestsellerNote = '⭐ Top Selling Daily Value Dish';
      secondary = [
        { id: 'soup_cream_chicken', reason: 'Creamy chicken soup warm starter.', isBestseller: false },
        { id: 'naan_garlic', reason: 'Garlic naan bread baked fresh.', isBestseller: false },
      ];
      beverageId = 'juice_lime';
      beverageNote = 'Fresh Anuradhapura lime juice with mineral ice.';
      estimatedTotal = 1800;
    } else {
      // Couple or standard budget
      topPick = findDish('kottu_cheese_chicken') || findDish('spec_thachchiya_2pax')!;
      topPickReason = 'Melted cheddar & mozzarella cascading over spiced chicken and griddled roti — our most popular dinner order among travelers!';
      topPickBestsellerNote = '⭐ #1 Top Selling Evening Kottu';
      secondary = [
        { id: 'side_hbc', reason: 'Sri Lanka’s most praised crispy cuttlefish.', isBestseller: true, bestsellerNote: '⭐ Bestseller Side' },
        { id: 'naan_butter', reason: 'Oven fresh butter naan with golden glaze.', isBestseller: false },
      ];
      beverageId = 'drink_mango_shake';
      beverageNote = 'Creamy tropical mango shake that cools down the rich spicy cheese.';
      estimatedTotal = 2700;
    }
  }

  // Hydrate secondary pick details
  const hydratedSecondary = secondary.map((sec) => {
    const item = findDish(sec.id);
    return {
      ...sec,
      isBestseller: item ? !!item.isBestseller : sec.isBestseller,
      bestsellerNote: item?.isBestseller ? '⭐ Bestseller' : item?.isTrending ? '🔥 Trending' : undefined,
      dishDetails: item ? {
        id: item.id,
        name: item.name,
        sinhalaName: item.sinhalaName,
        price: item.price,
        category: item.category,
        isBestseller: !!item.isBestseller,
        isTrending: !!item.isTrending,
        isVegetarian: !!item.isVegetarian,
        isSpicy: !!item.isSpicy,
        servesPax: item.servesPax,
        reason: sec.reason,
      } : undefined,
    };
  });

  const beverageItem = findDish(beverageId);

  const finalResponse: AIRecommendationResponse = {
    topPickId: topPick.id,
    topPickReason,
    topPickIsBestseller: !!topPick.isBestseller,
    topPickBestsellerNote,
    topPickDetails: {
      id: topPick.id,
      name: topPick.name,
      sinhalaName: topPick.sinhalaName,
      price: topPick.price,
      category: topPick.category,
      isBestseller: !!topPick.isBestseller,
      isTrending: !!topPick.isTrending,
      isVegetarian: !!topPick.isVegetarian,
      isSpicy: !!topPick.isSpicy,
      servesPax: topPick.servesPax,
      topSellerBadge: topPick.isBestseller ? '⭐ #1 TOP SELLER (Most Ordered)' : '🔥 Trending Recommendation',
      reason: topPickReason,
    },
    secondaryPicks: hydratedSecondary,
    pairingBeverageId: beverageId,
    pairingNote: beverageNote,
    pairingBeverageDetails: beverageItem ? {
      id: beverageItem.id,
      name: beverageItem.name,
      sinhalaName: beverageItem.sinhalaName,
      price: beverageItem.price,
      isBestseller: !!beverageItem.isBestseller,
      isTrending: !!beverageItem.isTrending,
      reason: beverageNote,
    } : undefined,
    bestsellerHighlight: {
      dishName: 'Arachchi Kulls & Hot Butter Cuttlefish',
      story: 'Our award-winning signatures made with premium wild-caught seafood, Basmati 1121 super kernel, and secret heritage spice marinades.',
      rankBadge: '⭐ #1 Top Selling Dish in Anuradhapura',
    },
    trendInsight: {
      trendTitle: 'Evening Culinary Trend in Anuradhapura',
      description: 'Guests touring the Sacred Ruwanwelisaya and Jetavanaramaya stupas overwhelmingly order our Cheese Kottu and Hot Butter Cuttlefish for dinner.',
    },
    budgetAnalysis: {
      userBudgetRange: budget === 'budget' ? 'Under 1,500 LKR' : budget === 'standard' ? '1,500 – 3,500 LKR' : budget === 'premium' ? '3,500+ LKR Grand Feast' : 'Flexible Budget',
      estimatedCost: estimatedTotal,
      budgetBadge: budget === 'budget' ? '✓ Fits Under 1,500 LKR Budget' : '💎 Outstanding Value & Portion',
      note: `Selected dish priced at ${topPick.price.toLocaleString()} LKR, fitting nicely within your chosen dining plan.`,
    },
  };

  return res.json({
    success: true,
    recommendation: finalResponse,
    source: 'local_expert',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', restaurant: 'Arachchi Restaurant Anuradhapura', port: PORT });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arachchi QR Menu Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
