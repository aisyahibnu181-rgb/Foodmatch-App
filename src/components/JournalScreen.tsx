import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Grid, List, Plus, Flame, Users, Sparkles, Trash2 } from 'lucide-react';
import { CircularCalorieGauge } from './CircularCalorieGauge';
import { JournalEntry, Product, UserPreferences } from '../types/food';

interface JournalScreenProps {
  journalEntries: JournalEntry[];
  userPrefs: UserPreferences;
  onSelectProduct: (product: Product) => void;
  onOpenQuickMealBuilder: () => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  journalEntries,
  userPrefs,
  onSelectProduct,
  onOpenQuickMealBuilder,
  onDeleteEntry,
}) => {
  const [selectedDate, setSelectedDate] = useState('Today, 18 Apr');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compute total consumed from journal entries
  const totalCalories = journalEntries.reduce((acc, curr) => acc + curr.totalCalories, 0);
  const totalProtein = Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalProteins, 0) * 10) / 10;
  const totalCarbs = Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalCarbs, 0) * 10) / 10;
  const totalFat = Math.round(journalEntries.reduce((acc, curr) => acc + curr.totalFat, 0) * 10) / 10;

  return (
    <div className="flex flex-col h-full bg-[#FBFBFE] overflow-y-auto no-scrollbar pb-24 px-5 pt-3">
      {/* Top Header matching reference screen 1 */}
      <div className="flex items-center justify-between mb-4">
        {/* User avatar on left */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
        </div>

        {/* Date Selector in center */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-xs">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            onClick={() => setSelectedDate('Yesterday, 17 Apr')}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-1">
            {selectedDate}
          </span>
          <button
            type="button"
            aria-label="Hari berikutnya"
            onClick={() => setSelectedDate('Tomorrow, 19 Apr')}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Bell on right */}
        <button
          type="button"
          aria-label="Notifikasi harian nutrisi"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-xs text-slate-700 hover:bg-slate-50 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full" />
        </button>
      </div>

      {/* Main Calorie Meter Lavender Card */}
      <div className="mb-6">
        <CircularCalorieGauge
          consumedCalories={totalCalories}
          targetCalories={userPrefs.dailyCalorieTarget}
          consumedProtein={totalProtein}
          targetProtein={userPrefs.dailyProteinTarget}
          consumedCarbs={totalCarbs}
          targetCarbs={userPrefs.dailyCarbsTarget}
          consumedFat={totalFat}
          targetFat={userPrefs.dailyFatTarget}
        />
      </div>

      {/* Section Header: "My Journal" */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            My Journal
          </h3>
          <p className="text-[11px] text-slate-400">
            {journalEntries.length} menu tercatat hari ini
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100">
          <button
            type="button"
            aria-label="Tampilan grid"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Tampilan list"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Journal Cards List / Grid */}
      {journalEntries.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 mt-2">
          <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-800">Belum ada makanan dicatat</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Gunakan Quick Meal Builder atau jelajahi menu untuk mencatat kalori porsi makanan.
          </p>
          <button
            type="button"
            onClick={onOpenQuickMealBuilder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-xs hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Bangun Menu Sekarang</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {journalEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => {
                if (entry.items[0]?.product) {
                  onSelectProduct(entry.items[0].product);
                }
              }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <img
                  src={
                    entry.imageUrl ||
                    entry.items[0]?.product?.image_front_small_url ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={entry.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top right delete button */}
                <button
                  type="button"
                  aria-label={`Hapus ${entry.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Bottom title & flame badge on image (matching screenshot) */}
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="text-white text-xs font-bold truncate drop-shadow-sm">
                    {entry.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs">
                      <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      {entry.totalCalories} kcal
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-white/90 font-semibold drop-shadow-xs">
                      <Users className="w-2.5 h-2.5" />
                      {entry.servings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Macro breakdown footer */}
              <div className="p-2.5 bg-slate-50/70 text-[10px] text-slate-500 flex justify-between font-medium">
                <span>P: {entry.totalProteins}g</span>
                <span>C: {entry.totalCarbs}g</span>
                <span>F: {entry.totalFat}g</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {journalEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => {
                if (entry.items[0]?.product) {
                  onSelectProduct(entry.items[0].product);
                }
              }}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <img
                src={
                  entry.imageUrl ||
                  entry.items[0]?.product?.image_front_small_url ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                }
                alt={entry.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                  {entry.mealType} • {entry.time}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {entry.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                  <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-amber-500" />
                    {entry.totalCalories} kcal
                  </span>
                  <span>•</span>
                  <span>P: {entry.totalProteins}g</span>
                  <span>C: {entry.totalCarbs}g</span>
                  <span>F: {entry.totalFat}g</span>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Hapus ${entry.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEntry(entry.id);
                }}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
