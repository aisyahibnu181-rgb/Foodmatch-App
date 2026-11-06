import React, { useState } from 'react';
import { Search, Bell, Bookmark, SlidersHorizontal, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Product, UserPreferences } from '../types/food';
import { FoodCard } from './FoodCard';
import { checkCompatibility } from '../utils/nutrition-calculator';

interface ExploreScreenProps {
  products: Product[];
  isLoading: boolean;
  isLiveApi: boolean;
  userPrefs: UserPreferences;
  onSearch: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToMeal: (product: Product) => void;
  bookmarkedCodes: Set<string>;
  onToggleBookmark: (code: string) => void;
  onOpenPreferences: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  products,
  isLoading,
  isLiveApi,
  userPrefs,
  onSearch,
  onSelectProduct,
  onAddToMeal,
  bookmarkedCodes,
  onToggleBookmark,
  onOpenPreferences,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'preferences' | 'all'>('preferences');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: 'Semua', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80' },
    { id: 'Vegan', label: 'Vegan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80' },
    { id: 'Vegetarian', label: 'Vegetarian', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80' },
    { id: 'Low calorie', label: 'Low calorie', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=150&q=80' },
    { id: 'Low sugar', label: 'Low sugar', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=150&q=80' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  // Filter products based on active tab and category
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory === 'Vegan') {
      const isVegan = product.ingredients_analysis_tags?.includes('en:vegan');
      if (!isVegan) return false;
    } else if (selectedCategory === 'Vegetarian') {
      const isVeg =
        product.ingredients_analysis_tags?.includes('en:vegetarian') &&
        !product.ingredients_analysis_tags?.includes('en:non-vegetarian');
      if (!isVeg) return false;
    } else if (selectedCategory === 'Low calorie') {
      const kcal = product.nutriments['energy-kcal_100g'] ?? 0;
      if (kcal > 200) return false;
    } else if (selectedCategory === 'Low sugar') {
      const sugar = product.nutriments.sugars_100g ?? 0;
      if (sugar > 5) return false;
    }

    // Preferences filter
    if (activeTab === 'preferences') {
      const comp = checkCompatibility(product, userPrefs);
      return comp.isCompatible;
    }

    return true;
  });

  // Group by category for section display
  const breakfastItems = filteredProducts.filter(
    (p) => p.category === 'Breakfast' || (p.nutriments['energy-kcal_100g'] || 0) < 250
  );
  const lunchItems = filteredProducts.filter(
    (p) => !breakfastItems.includes(p)
  );

  return (
    <div className="flex flex-col h-full bg-[#FBFBFE] overflow-y-auto no-scrollbar pb-24">
      {/* Light Pistachio Green Header Banner (matching reference Screen 3) */}
      <div className="bg-[#D3F5C9] pt-4 pb-5 px-5 rounded-b-[32px] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Recipes & Foods
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Atur preferensi diet"
              onClick={onOpenPreferences}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
            </button>
            <button
              type="button"
              aria-label="Lihat resep tersimpan"
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-colors relative"
            >
              <Bookmark className="w-4 h-4 text-slate-700" />
              {bookmarkedCodes.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {bookmarkedCodes.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar connecting to Open Food Facts API */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari Open Food Facts (cth: oat, pasta, salmon)..."
            className="w-full bg-white pl-10 pr-20 py-2.5 rounded-2xl text-xs text-slate-800 placeholder-slate-400 shadow-xs border border-white/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {/* Live Open Food Facts API indicator badge */}
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-emerald-900/80">
          <span className="inline-flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
            {isLiveApi ? 'Open Food Facts Live API' : 'Database Kurasi Open Food Facts'}
          </span>
          <span className="text-[10px] text-slate-600 font-medium">
            {filteredProducts.length} produk siap dihitung
          </span>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Horizontal Category Circular Avatars (matching Screenshot 3: Vegan, Vegetarian, Low calorie...) */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
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
                  className={`w-14 h-14 rounded-2xl overflow-hidden p-0.5 transition-all shadow-xs ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105'
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
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Selector: "My preferences" vs "All" (matching Screenshot 3) */}
        <div className="flex items-center border-b border-slate-200/80 mt-4 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'preferences'
                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 after:rounded-full'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            My preferences
            {activeTab === 'preferences' && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-pink-100 text-pink-700 rounded-full text-[9px] font-black">
                Aktif
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'all'
                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 after:rounded-full'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All Products
          </button>
        </div>

        {/* Section 1: Breakfast */}
        {breakfastItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Breakfast</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {breakfastItems.length} menu
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {breakfastItems.slice(0, 4).map((product) => (
                <FoodCard
                  key={product.code}
                  product={product}
                  userPrefs={userPrefs}
                  onSelect={onSelectProduct}
                  onAddToMeal={onAddToMeal}
                  isBookmarked={bookmarkedCodes.has(product.code)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Lunch & Main Meals */}
        {lunchItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Lunch & Main Meals</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {lunchItems.length} menu
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lunchItems.map((product) => (
                <FoodCard
                  key={product.code}
                  product={product}
                  userPrefs={userPrefs}
                  onSelect={onSelectProduct}
                  onAddToMeal={onAddToMeal}
                  isBookmarked={bookmarkedCodes.has(product.code)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 my-4">
            <p className="text-xs font-semibold text-slate-700">
              Tidak ada produk yang cocok dengan filter saat ini.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Coba ganti kata pencarian atau nonaktifkan beberapa preferensi diet.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSelectedCategory('All');
                setSearchInput('');
                onSearch('');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
