/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  SlidersHorizontal,
  Code2,
  Bookmark,
  Sparkles,
  Flame,
  Plus,
  Clock,
  Users,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Bell,
  Trash2,
  Scale,
  Check,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Layers,
  Heart,
  Compass,
  BookText,
  BookOpen,
} from 'lucide-react';
import { Product, JournalEntry, UserPreferences, MealItem } from './types/food';
import { PRESET_FOODS } from './data/presetFoods';
import { searchOpenFoodFacts } from './services/openFoodFactsService';
import {
  calculateItemMacros,
  calculateMealTotal,
  checkCompatibility,
  getNutriscoreDetails,
  getNovaDetails,
} from './utils/nutrition-calculator';
import { CircularCalorieGauge } from './components/CircularCalorieGauge';
import { MacroRingCard } from './components/MacroRingCard';
import { FoodCard } from './components/FoodCard';
import { PreferencesModal } from './components/PreferencesModal';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { QuickMealBuilderModal } from './components/QuickMealBuilderModal';
import { BottomNavBar } from './components/BottomNavBar';

export default function App() {
  // Products & Active Selection
  const [products, setProducts] = useState<Product[]>(PRESET_FOODS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRESET_FOODS[1]); // Spaghetti alla Carbonara
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'preferences' | 'all'>('preferences');
  const [detailTab, setDetailTab] = useState<'desc' | 'ingredients' | 'analysis'>('desc');
  const [bookmarkedCodes, setBookmarkedCodes] = useState<Set<string>>(
    new Set(['8000050012345', '7350083710001'])
  );

  // Mobile View Navigation Tab ('explore' | 'detail' | 'journal')
  const [mobileTab, setMobileTab] = useState<'explore' | 'detail' | 'journal'>('explore');

  // User Dietary Preferences
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    vegetarian: true,
    vegan: false,
    lowSugar: true,
    lowCalorie: false,
    unprocessedOnly: false,
    palmOilFree: true,
    glutenFree: false,
    dailyCalorieTarget: 1805,
    dailyProteinTarget: 79,
    dailyCarbsTarget: 196,
    dailyFatTarget: 52,
  });

  // Journal Entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: 'entry-1',
      title: 'Salmon with Herb & Garlic Butter',
      mealType: 'Lunch',
      time: '12:30 PM',
      items: [calculateItemMacros(PRESET_FOODS[2], 130)],
      totalCalories: 273,
      totalProteins: 26.5,
      totalCarbs: 0.6,
      totalFat: 17.4,
      imageUrl: PRESET_FOODS[2].image_front_small_url,
      servings: 3,
    },
    {
      id: 'entry-2',
      title: 'Morning Berry Oat Meal',
      mealType: 'Breakfast',
      time: '08:15 AM',
      items: [calculateItemMacros(PRESET_FOODS[4], 280)],
      totalCalories: 272,
      totalProteins: 28.5,
      totalCarbs: 23.8,
      totalFat: 3.4,
      imageUrl: PRESET_FOODS[4].image_front_small_url,
      servings: 5,
    },
  ]);

  // Quick Builder Slider state for selected product
  const [builderPortionGrams, setBuilderPortionGrams] = useState<number>(150);

  // Modals
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isFlutterCodeModalOpen, setIsFlutterCodeModalOpen] = useState<boolean>(false);
  const [isQuickBuilderModalOpen, setIsQuickBuilderModalOpen] = useState<boolean>(false);
  const [quickBuilderModalProduct, setQuickBuilderModalProduct] = useState<Product | null>(null);

  // Computed Values
  const totalJournalCalories = journalEntries.reduce((acc, curr) => acc + curr.totalCalories, 0);
  const totalJournalProtein =
    Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalProteins, 0) * 10) / 10;
  const totalJournalCarbs =
    Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalCarbs, 0) * 10) / 10;
  const totalJournalFat =
    Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalFat, 0) * 10) / 10;

  // Selected product scaled nutrition
  const scaledSelectedNutrition = calculateItemMacros(selectedProduct, builderPortionGrams);
  const selectedCompat = checkCompatibility(selectedProduct, userPrefs);
  const selectedNutriscore = getNutriscoreDetails(selectedProduct.nutriscore_grade);
  const selectedNova = getNovaDetails(selectedProduct.nova_group);

  // Categories
  const categories = [
    {
      id: 'All',
      label: 'Semua',
      image:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'Vegan',
      label: 'Vegan',
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'Vegetarian',
      label: 'Vegetarian',
      image:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'Low calorie',
      label: 'Low calorie',
      image:
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'Low sugar',
      label: 'Low sugar',
      image:
        'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=150&q=80',
    },
  ];

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await searchOpenFoodFacts(searchInput, 12);
      setProducts(res.products);
      setIsLiveApi(res.isLive);
    } catch {
      setProducts(PRESET_FOODS);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (code: string) => {
    setBookmarkedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Add calculated portion directly to journal
  const handleAddPortionToJournal = (product: Product, grams: number) => {
    const item = calculateItemMacros(product, grams);
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: product.product_name,
      mealType: product.category === 'Breakfast' ? 'Breakfast' : 'Lunch',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [item],
      totalCalories: Math.round(item.calculatedCalories),
      totalProteins: item.calculatedProteins,
      totalCarbs: item.calculatedCarbs,
      totalFat: item.calculatedFat,
      imageUrl: product.image_front_small_url,
      servings: 1,
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setMobileTab('journal');
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'Vegan') {
      if (!p.ingredients_analysis_tags?.includes('en:vegan')) return false;
    } else if (selectedCategory === 'Vegetarian') {
      const isVeg =
        p.ingredients_analysis_tags?.includes('en:vegetarian') &&
        !p.ingredients_analysis_tags?.includes('en:non-vegetarian');
      if (!isVeg) return false;
    } else if (selectedCategory === 'Low calorie') {
      if ((p.nutriments['energy-kcal_100g'] ?? 0) > 200) return false;
    } else if (selectedCategory === 'Low sugar') {
      if ((p.nutriments.sugars100g ?? 0) > 5) return false;
    }

    if (activeTab === 'preferences') {
      const comp = checkCompatibility(p, userPrefs);
      return comp.isCompatible;
    }
    return true;
  });

  // Calculate Macro Percentages for Selected Product
  const selN = selectedProduct.nutriments || {};
  const selKcal = selN['energy-kcal_100g'] ?? 0;
  const selPro = selN.proteins_100g ?? 0;
  const selCarb = selN.carbohydrates_100g ?? 0;
  const selFat = selN.fat_100g ?? 0;
  const selTotalKcal = selPro * 4 + selCarb * 4 + selFat * 9 || 1;
  const selProPct = Math.round(((selPro * 4) / selTotalKcal) * 100);
  const selCarbPct = Math.round(((selCarb * 4) / selTotalKcal) * 100);
  const selFatPct = Math.max(0, 100 - selProPct - selCarbPct);

  return (
    <div className="min-h-screen bg-[#F6F5FD] text-slate-900 flex flex-col font-sans selection:bg-pink-200">
      {/* Top Application Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  FoodMatch
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Open Food Facts API
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                Explore, Compatibility & Quick Meal Nutrition Calculator
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Preferensi Diet</span>
              {userPrefs.vegetarian && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFlutterCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kode Flutter Riverpod</span>
            </button>
          </div>
        </div>
      </header>


      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-32 sm:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================== */}
          {/* LEFT & CENTER COLUMN (Explore & Product Detail)           */}
          {/* ========================================================== */}
          <div
            className={`lg:col-span-7 xl:col-span-8 space-y-6 ${
              mobileTab === 'journal' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* 1. Explore & Recipes Banner Section (Pistachio Green matching Screen 3) */}
            <div
              id="explore-section"
              className={`bg-[#D3F5C9] p-5 sm:p-6 rounded-3xl shadow-xs space-y-4 scroll-mt-20 ${
                mobileTab === 'detail' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Recipes & Foods Explore
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cari produk pangan dari Open Food Facts API & cek kompatibilitas diet
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-emerald-900 shadow-xs flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLiveApi ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isLiveApi ? 'Open Food Facts Live' : 'Database Terkurasi'}
                  </span>
                </div>
              </div>

              {/* Search Bar Input */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari Open Food Facts (cth: oat, carbonara, salmon, yogurt)..."
                  className="w-full bg-white pl-10 pr-24 py-3 rounded-2xl text-xs text-slate-800 placeholder-slate-400 shadow-sm border border-white/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
                </button>
              </form>

              {/* Horizontal Category Chips */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-1 pb-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-hidden"
                    >
                      <div
                        className={`w-13 h-13 rounded-2xl overflow-hidden p-0.5 transition-all shadow-xs ${
                          isSelected
                            ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105'
                            : 'opacity-80 group-hover:opacity-100'
                        }`}
                      >
                        <img
                          src={cat.image}
                          alt={cat.label}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <span
                        className={`text-[11px] font-semibold transition-colors ${
                          isSelected ? 'text-slate-900 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Preference / All Tabs */}
              <div className="flex items-center justify-between border-b border-emerald-900/10 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preferences')}
                    className={`pb-2 px-3 text-xs font-bold transition-all relative ${
                      activeTab === 'preferences'
                        ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 after:rounded-full'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    My preferences
                    {activeTab === 'preferences' && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[9px] font-black">
                        Aktif
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-3 text-xs font-bold transition-all relative ${
                      activeTab === 'all'
                        ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 after:rounded-full'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Products ({products.length})
                  </button>
                </div>

                <span className="text-[11px] text-slate-600 font-medium">
                  {filteredProducts.length} produk ditemukan
                </span>
              </div>

              {/* Food Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-2">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct.code === p.code;
                  return (
                    <div
                      key={p.code}
                      onClick={() => {
                        setSelectedProduct(p);
                        setMobileTab('detail');
                      }}
                      className={`cursor-pointer transition-transform duration-200 ${
                        isSelected ? 'ring-2 ring-emerald-500 rounded-3xl' : ''
                      }`}
                    >
                      <FoodCard
                        product={p}
                        userPrefs={userPrefs}
                        onSelect={(prod) => {
                          setSelectedProduct(prod);
                          setMobileTab('detail');
                        }}
                        onAddToMeal={(prod) => {
                          setQuickBuilderModalProduct(prod);
                          setIsQuickBuilderModalOpen(true);
                        }}
                        isBookmarked={bookmarkedCodes.has(p.code)}
                        onToggleBookmark={handleToggleBookmark}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Detailed Food Nutrition & Macro Rings (Matching Screen 2) */}
            <div
              id="detail-section"
              className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden scroll-mt-20 ${
                mobileTab === 'explore' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Hero Product Image */}
                <div className="md:col-span-5 relative h-64 md:h-auto min-h-[260px] bg-slate-900">
                  <img
                    src={selectedProduct.image_url || selectedProduct.image_front_small_url}
                    alt={selectedProduct.product_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                  <button
                    type="button"
                    aria-label={
                      bookmarkedCodes.has(selectedProduct.code)
                        ? 'Hapus bookmark'
                        : 'Simpan ke favorit'
                    }
                    onClick={() => handleToggleBookmark(selectedProduct.code)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        bookmarkedCodes.has(selectedProduct.code)
                          ? 'fill-pink-500 text-pink-500'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    {selectedProduct.brands}
                  </div>
                </div>

                {/* Nutrition Breakdown & Macro Rings */}
                <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {selectedCompat.matchingBadges[0] && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          {selectedCompat.matchingBadges[0]}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {selectedNova.badgeText}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white ${selectedNutriscore.colorBg}`}
                      >
                        {selectedNutriscore.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedProduct.product_name}
                    </h3>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {Math.round(selKcal)} kcal / 100g
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {selectedProduct.prep_time_minutes || 10} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Porsi {selectedProduct.servings || 1}
                      </span>
                    </div>
                  </div>

                  {/* 3 Circular Macro Rings (Protein Pink, Carbs Green, Fat Orange) */}
                  <div className="flex items-center justify-between gap-2">
                    <MacroRingCard
                      label="Protein"
                      percentage={selProPct}
                      weightGrams={selPro}
                      colorTheme="pink"
                    />
                    <MacroRingCard
                      label="Carbs"
                      percentage={selCarbPct}
                      weightGrams={selCarb}
                      colorTheme="green"
                    />
                    <MacroRingCard
                      label="Fat"
                      percentage={selFatPct}
                      weightGrams={selFat}
                      colorTheme="orange"
                    />
                  </div>

                  {/* Segmented Tabs (Description, Ingredients, Nutri-Score & NOVA) */}
                  <div className="border-b border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDetailTab('desc')}
                      className={`pb-2 text-xs font-bold transition-all relative ${
                        detailTab === 'desc'
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('ingredients')}
                      className={`pb-2 text-xs font-bold transition-all relative ${
                        detailTab === 'ingredients'
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Ingredients
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('analysis')}
                      className={`pb-2 text-xs font-bold transition-all relative ${
                        detailTab === 'analysis'
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Nutri-Score & NOVA
                    </button>
                  </div>

                  {/* Tab Details */}
                  <div className="text-xs text-slate-600 min-h-[64px]">
                    {detailTab === 'desc' && (
                      <p className="leading-relaxed">
                        {selectedProduct.description ||
                          'Produk terdaftar di Open Food Facts, diperiksa nilai nutrisi dan tingkat pemrosesan gizinya.'}
                      </p>
                    )}
                    {detailTab === 'ingredients' && (
                      <div className="space-y-1.5">
                        <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {selectedProduct.ingredients_text ||
                            'Komposisi bahan tidak tercatat pada kemasan.'}
                        </p>
                        <div className="flex gap-2 text-[11px]">
                          <span className="font-semibold text-orange-700">
                            Gula: {selN.sugars_100g ?? 0}g / 100g
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-teal-700">
                            Serat: {selN.fiber_100g ?? 0}g / 100g
                          </span>
                        </div>
                      </div>
                    )}
                    {detailTab === 'analysis' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="font-bold text-slate-800">Nutri-Score:</span>
                          <span className="font-semibold text-emerald-700">
                            {selectedNutriscore.desc}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                          <span className="font-bold text-slate-800">Tingkat NOVA:</span>
                          <span className="font-semibold text-slate-700">
                            {selectedNova.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Embedded Quick Meal Builder Slider for this Product */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-pink-500" />
                        Takar Porsi Cepat:
                      </span>
                      <span className="font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                        {builderPortionGrams} gram = {scaledSelectedNutrition.calculatedCalories} kcal
                      </span>
                    </div>

                    <input
                      type="range"
                      min={20}
                      max={350}
                      step={10}
                      value={builderPortionGrams}
                      onChange={(e) => setBuilderPortionGrams(Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex gap-1">
                        {[50, 100, 150, 200].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setBuilderPortionGrams(g)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              builderPortionGrams === g
                                ? 'bg-pink-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {g}g
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddPortionToJournal(selectedProduct, builderPortionGrams)
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs shadow-pink-200 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat ke Journal</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT SIDEBAR (My Journal, Calorie Gauge, & Quick Builder)  */}
          {/* ========================================================== */}
          <div
            id="journal-section"
            className={`lg:col-span-5 xl:col-span-4 space-y-6 scroll-mt-20 ${
              mobileTab === 'explore' || mobileTab === 'detail'
                ? 'hidden lg:block'
                : 'block'
            }`}
          >
            {/* 1. Lavender Card with Circular Arc Calorie Gauge (Matching Screen 1) */}
            <div className="bg-[#B9B8F4] text-white rounded-3xl p-5 shadow-sm space-y-4">
              {/* Header Date Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">Daily Calorie Target</h3>
                    <p className="text-[10px] text-white/80">Target harian {userPrefs.dailyCalorieTarget} kcal</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <ChevronLeft className="w-3.5 h-3.5 cursor-pointer opacity-75 hover:opacity-100" />
                  <span>Today, 18 Apr</span>
                  <ChevronRight className="w-3.5 h-3.5 cursor-pointer opacity-75 hover:opacity-100" />
                </div>
              </div>

              {/* Arc Calorie Gauge & Macro Progress Bars */}
              <CircularCalorieGauge
                consumedCalories={totalJournalCalories}
                targetCalories={userPrefs.dailyCalorieTarget}
                consumedProtein={totalJournalProtein}
                targetProtein={userPrefs.dailyProteinTarget}
                consumedCarbs={totalJournalCarbs}
                targetCarbs={userPrefs.dailyCarbsTarget}
                consumedFat={totalJournalFat}
                targetFat={userPrefs.dailyFatTarget}
              />
            </div>

            {/* 2. My Journal Meals List */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Journal</h3>
                  <p className="text-xs text-slate-400">
                    {journalEntries.length} menu tercatat hari ini
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuickBuilderModalProduct(selectedProduct);
                    setIsQuickBuilderModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Builder</span>
                </button>
              </div>

              {/* Journal Items */}
              {journalEntries.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada makanan dicatat hari ini.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan tombol '+ Porsi' pada produk untuk mencatat.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {journalEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-3 border border-slate-100 transition-all flex items-center gap-3"
                    >
                      <img
                        src={
                          entry.imageUrl ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={entry.title}
                        className="w-13 h-13 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-pink-600 uppercase tracking-wider">
                            {entry.mealType} • {entry.time}
                          </span>
                          <button
                            type="button"
                            aria-label={`Hapus ${entry.title}`}
                            onClick={() =>
                              setJournalEntries(journalEntries.filter((e) => e.id !== entry.id))
                            }
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {entry.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-bold text-amber-600 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 fill-amber-500" />
                            {entry.totalCalories} kcal
                          </span>
                          <span>•</span>
                          <span>P: {entry.totalProteins}g</span>
                          <span>C: {entry.totalCarbs}g</span>
                          <span>F: {entry.totalFat}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Flutter Architecture Info Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Clean Architecture & Riverpod 2.x
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold">
                Arsitektur Fitur Terstruktur untuk Flutter
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fitur ini memisahkan secara murni <strong>Domain Entity</strong>, <strong>Use Cases (Kalkulasi & Kecocokan)</strong>, <strong>Open Food Facts Data Source</strong>, dan <strong>Riverpod State Notifiers</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsFlutterCodeModalOpen(true)}
                className="w-full py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Code2 className="w-4 h-4" />
                <span>Buka Kode Lengkap Flutter Dart</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom App Navigation Bar (Fixed like a native mobile app) */}
      <BottomNavBar
        activeScreen={mobileTab}
        onNavigate={(screen) => {
          setMobileTab(screen);
          if (screen === 'explore') {
            document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (screen === 'detail') {
            document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (screen === 'journal') {
            document.getElementById('journal-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onCenterAction={() => {
          setQuickBuilderModalProduct(selectedProduct);
          setIsQuickBuilderModalOpen(true);
        }}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        journalCount={journalEntries.length}
      />

      {/* Preferences Modal */}
      {isPreferencesOpen && (
        <PreferencesModal
          preferences={userPrefs}
          onSave={(updated) => setUserPrefs(updated)}
          onClose={() => setIsPreferencesOpen(false)}
        />
      )}

      {/* Quick Meal Builder Modal */}
      {isQuickBuilderModalOpen && (
        <QuickMealBuilderModal
          initialProduct={quickBuilderModalProduct || selectedProduct}
          allProducts={products}
          userPrefs={userPrefs}
          onClose={() => setIsQuickBuilderModalOpen(false)}
          onSaveToJournal={(title, mealType, items, imageUrl) => {
            const summary = calculateMealTotal(items);
            const newEntry: JournalEntry = {
              id: `entry-${Date.now()}`,
              title,
              mealType,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              items,
              totalCalories: summary.totalCalories,
              totalProteins: summary.totalProteins,
              totalCarbs: summary.totalCarbs,
              totalFat: summary.totalFat,
              imageUrl,
              servings: items.length,
            };
            setJournalEntries([newEntry, ...journalEntries]);
            setMobileTab('journal');
          }}
        />
      )}

      {/* Flutter Clean Architecture Code Modal */}
      {isFlutterCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[88vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-800">
            <button
              type="button"
              onClick={() => setIsFlutterCodeModalOpen(false)}
              className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              ✕ Tutup
            </button>
            <FlutterCodeViewer />
          </div>
        </div>
      )}
    </div>
  );
}
