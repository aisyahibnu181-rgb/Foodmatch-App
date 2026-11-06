import React from 'react';
import { Compass, BookText, Plus, BookOpen, SlidersHorizontal, Flame } from 'lucide-react';

export type ActiveScreen = 'explore' | 'detail' | 'journal';

interface BottomNavBarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onCenterAction: () => void;
  onOpenPreferences?: () => void;
  journalCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onNavigate,
  onCenterAction,
  onOpenPreferences,
  journalCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-1 pointer-events-none">
      <nav
        aria-label="Navigasi Aplikasi FoodMatch"
        className="bg-white/95 backdrop-blur-xl rounded-full px-5 py-2 shadow-[0_12px_45px_-8px_rgba(0,0,0,0.18)] border border-slate-200/90 flex items-center justify-between pointer-events-auto max-w-md mx-auto transition-all"
      >
        {/* 1. Compass / Discover (Explore) */}
        <button
          type="button"
          aria-label="Jelajahi Makanan (Explore)"
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
            activeScreen === 'explore'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-700 hover:scale-105'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeScreen === 'explore' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">Explore</span>
        </button>

        {/* 2. Journal */}
        <button
          type="button"
          aria-label="Catatan Harian (Journal)"
          onClick={() => onNavigate('journal')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
            activeScreen === 'journal'
              ? 'text-indigo-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-700 hover:scale-105'
          }`}
        >
          <BookText className={`w-5 h-5 ${activeScreen === 'journal' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">Journal</span>
          {journalCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              {journalCount}
            </span>
          )}
        </button>

        {/* 3. Center Floating Elevated Pink Plus Button (Matching reference design) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            aria-label="Quick Meal Builder: Hitung Porsi Makanan"
            onClick={onCenterAction}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ec4899] to-[#F472B6] hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-pink-400/50 active:scale-95 transition-all ring-4 ring-white"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-bold text-slate-700 mt-1 whitespace-nowrap bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs border border-slate-100">
            + Porsi
          </span>
        </div>

        {/* 4. Recipes / Detail */}
        <button
          type="button"
          aria-label="Detail & Analisis Produk"
          onClick={() => onNavigate('detail')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
            activeScreen === 'detail'
              ? 'text-pink-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-700 hover:scale-105'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeScreen === 'detail' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 font-medium leading-none">Detail</span>
        </button>

        {/* 5. Diet Preferences / Settings */}
        <button
          type="button"
          aria-label="Atur Preferensi Diet"
          onClick={onOpenPreferences}
          className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-slate-400 hover:text-slate-700 hover:scale-105"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium leading-none">Diet</span>
        </button>
      </nav>
    </div>
  );
};
