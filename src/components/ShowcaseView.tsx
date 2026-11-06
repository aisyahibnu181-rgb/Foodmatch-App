import React from 'react';
import { PhoneFrame } from './PhoneFrame';
import { JournalScreen } from './JournalScreen';
import { DetailScreen } from './DetailScreen';
import { ExploreScreen } from './ExploreScreen';
import { BottomNavBar } from './BottomNavBar';
import { Product, JournalEntry, UserPreferences, MealItem } from '../types/food';

interface ShowcaseViewProps {
  products: Product[];
  journalEntries: JournalEntry[];
  userPrefs: UserPreferences;
  selectedProduct: Product;
  bookmarkedCodes: Set<string>;
  onSelectProduct: (p: Product) => void;
  onOpenMealBuilder: (p?: Product) => void;
  onToggleBookmark: (code: string) => void;
  onDeleteJournalEntry: (id: string) => void;
  onOpenPreferences: () => void;
  onSearch: (q: string) => void;
  isLoading: boolean;
  isLiveApi: boolean;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({
  products,
  journalEntries,
  userPrefs,
  selectedProduct,
  bookmarkedCodes,
  onSelectProduct,
  onOpenMealBuilder,
  onToggleBookmark,
  onDeleteJournalEntry,
  onOpenPreferences,
  onSearch,
  isLoading,
  isLiveApi,
}) => {
  return (
    <div className="w-full py-8 px-4 overflow-x-auto no-scrollbar">
      <div className="text-center mb-6 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full">
          3-Screen FoodMatch Design Showcase
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-2">
          Desain Visual Sesuai Mockup Referensi
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Layaknya mockup Figma/Dribbble: Layar Journal Kalori (Kiri), Layar Detail & Macro Rings (Tengah), dan Layar Explore Resep Open Food Facts (Kanan).
        </p>
      </div>

      {/* 3 Mobile Screens side by side on soft canvas */}
      <div className="flex items-start justify-center gap-6 min-w-[1100px] pb-6">
        {/* Screen 1: My Journal */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700 mb-2 px-3 py-1 bg-white rounded-full shadow-xs border border-slate-200">
            Layar 1: My Journal & Calorie Gauge
          </span>
          <PhoneFrame titleBarBg="bg-[#FBFBFE]">
            <JournalScreen
              journalEntries={journalEntries}
              userPrefs={userPrefs}
              onSelectProduct={onSelectProduct}
              onOpenQuickMealBuilder={() => onOpenMealBuilder()}
              onDeleteEntry={onDeleteJournalEntry}
            />
            <BottomNavBar
              activeScreen="journal"
              onNavigate={() => {}}
              onCenterAction={() => onOpenMealBuilder()}
            />
          </PhoneFrame>
        </div>

        {/* Screen 2: Food Details with Macro Rings */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700 mb-2 px-3 py-1 bg-white rounded-full shadow-xs border border-slate-200">
            Layar 2: Food Detail & Circular Macro Rings
          </span>
          <PhoneFrame titleBarBg="bg-transparent">
            <DetailScreen
              product={selectedProduct}
              userPrefs={userPrefs}
              onBack={() => {}}
              onOpenMealBuilder={(p) => onOpenMealBuilder(p)}
              isBookmarked={bookmarkedCodes.has(selectedProduct.code)}
              onToggleBookmark={onToggleBookmark}
            />
            <BottomNavBar
              activeScreen="detail"
              onNavigate={() => {}}
              onCenterAction={() => onOpenMealBuilder(selectedProduct)}
            />
          </PhoneFrame>
        </div>

        {/* Screen 3: Explore / Recipes */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700 mb-2 px-3 py-1 bg-white rounded-full shadow-xs border border-slate-200">
            Layar 3: Recipes & Compatibility Explore
          </span>
          <PhoneFrame titleBarBg="bg-[#D3F5C9]">
            <ExploreScreen
              products={products}
              isLoading={isLoading}
              isLiveApi={isLiveApi}
              userPrefs={userPrefs}
              onSearch={onSearch}
              onSelectProduct={onSelectProduct}
              onAddToMeal={(p) => onOpenMealBuilder(p)}
              bookmarkedCodes={bookmarkedCodes}
              onToggleBookmark={onToggleBookmark}
              onOpenPreferences={onOpenPreferences}
            />
            <BottomNavBar
              activeScreen="explore"
              onNavigate={() => {}}
              onCenterAction={() => onOpenMealBuilder()}
            />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
};
