import React, { useState } from 'react';
import { ChevronLeft, Bookmark, Flame, Clock, Users, Plus, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { Product, UserPreferences } from '../types/food';
import { MacroRingCard } from './MacroRingCard';
import { checkCompatibility, getNutriscoreDetails, getNovaDetails } from '../utils/nutrition-calculator';

interface DetailScreenProps {
  product: Product;
  userPrefs: UserPreferences;
  onBack: () => void;
  onOpenMealBuilder: (product: Product) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (code: string) => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  product,
  userPrefs,
  onBack,
  onOpenMealBuilder,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'analysis'>('desc');
  const compatibility = checkCompatibility(product, userPrefs);
  const nutriscore = getNutriscoreDetails(product.nutriscore_grade);
  const nova = getNovaDetails(product.nova_group);

  const n = product.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? 0;
  const pro = n.proteins_100g ?? 0;
  const carbs = n.carbohydrates_100g ?? 0;
  const fat = n.fat_100g ?? 0;
  const sugars = n.sugars_100g ?? 0;

  // Macro calorie calculations
  const proKcal = pro * 4;
  const carbKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalMacroKcal = proKcal + carbKcal + fatKcal || 1;

  const proPct = Math.round((proKcal / totalMacroKcal) * 100);
  const carbPct = Math.round((carbKcal / totalMacroKcal) * 100);
  const fatPct = Math.max(0, 100 - proPct - carbPct);

  return (
    <div className="relative flex flex-col h-full bg-white overflow-y-auto no-scrollbar pb-24">
      {/* Top Food Image Container */}
      <div className="relative w-full h-64 bg-slate-900 shrink-0">
        <img
          src={product.image_url || product.image_front_small_url}
          alt={product.product_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        {/* Soft gradient overlay for back/bookmark visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />

        {/* Floating Back Button */}
        <button
          type="button"
          aria-label="Kembali ke halaman sebelumnya"
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-800" />
        </button>

        {/* Floating Bookmark Button */}
        {onToggleBookmark && (
          <button
            type="button"
            aria-label={isBookmarked ? 'Hapus bookmark' : 'Simpan ke favorit'}
            onClick={() => onToggleBookmark(product.code)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-pink-500 text-pink-500' : 'text-slate-700'
              }`}
            />
          </button>
        )}
      </div>

      {/* Sheet Content Card overlapping top photo */}
      <div className="relative -mt-6 bg-white rounded-t-3xl px-5 pt-5 flex-1 flex flex-col">
        {/* Title & Brand */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {product.product_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {product.brands || 'Open Food Facts Database'}
          </p>

          {/* Quick Stat Badges (matching Screenshot 2: 273 kcal, 10 min, Serves 5) */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {Math.round(kcal)} kcal / 100g
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-semibold text-xs border border-pink-200">
              <Clock className="w-3.5 h-3.5" />
              {product.prep_time_minutes || 10} min
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200">
              <Users className="w-3.5 h-3.5" />
              Serves {product.servings || 2}
            </span>
          </div>
        </div>

        {/* 3 Macro Rings Side by Side (Protein, Carbs, Fat) */}
        <div className="flex items-center justify-between gap-2.5 mb-5">
          <MacroRingCard
            label="Protein"
            percentage={proPct}
            weightGrams={pro}
            colorTheme="pink"
          />
          <MacroRingCard
            label="Carbs"
            percentage={carbPct}
            weightGrams={carbs}
            colorTheme="green"
          />
          <MacroRingCard
            label="Fat"
            percentage={fatPct}
            weightGrams={fat}
            colorTheme="orange"
          />
        </div>

        {/* Segmented Tabs (Description, Ingredients, Instructions / Analysis) */}
        <div className="border-b border-slate-100 flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'desc'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'ingredients'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Ingredients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'analysis'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Nutri-Score & NOVA
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-4">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tentang Produk Ini
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description ||
                  'Produk makanan berkualitas yang terdaftar pada database publik Open Food Facts, diverifikasi komposisi dan nilai gizinya.'}
              </p>

              {/* Compatibility Summary */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Kecocokan Preferensi Anda:
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      compatibility.matchScore >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {compatibility.matchScore}% Cocok
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility.matchingBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {badge}
                    </span>
                  ))}
                  {compatibility.unmetCriteria.map((unmet, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-rose-100/70 text-rose-800"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {unmet}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Komposisi Bahan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {product.ingredients_text || 'Informasi bahan belum tersedia dari kemasan produk ini.'}
              </p>

              <div className="mt-3">
                <h5 className="text-[11px] font-bold text-slate-700 mb-2">
                  Kandungan Gula & Serat per 100g:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                    <span className="text-[10px] text-orange-600 font-medium block">Gula (Sugars)</span>
                    <span className="font-bold text-orange-950 text-sm">{sugars}g</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                    <span className="text-[10px] text-teal-600 font-medium block">Serat (Fiber)</span>
                    <span className="font-bold text-teal-950 text-sm">{n.fiber_100g || 0}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {/* Nutri-Score Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Nutri-Score Perancis
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {nutriscore.label}
                  </span>
                </div>
                {/* Visual Nutri-Score 5 letters A B C D E */}
                <div className="flex items-center gap-1 my-2">
                  {(['a', 'b', 'c', 'd', 'e'] as const).map((grade) => {
                    const isSelected = (product.nutriscore_grade || '').toLowerCase() === grade;
                    const gradeColors: Record<string, string> = {
                      a: 'bg-[#038141]',
                      b: 'bg-[#85BB2F]',
                      c: 'bg-[#FECB02]',
                      d: 'bg-[#EE8100]',
                      e: 'bg-[#E63E11]',
                    };
                    return (
                      <div
                        key={grade}
                        className={`flex-1 text-center py-1.5 rounded-lg text-white font-black text-xs uppercase transition-all ${
                          gradeColors[grade]
                        } ${isSelected ? 'scale-110 shadow-md ring-2 ring-slate-900' : 'opacity-40'}`}
                      >
                        {grade}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {nutriscore.desc}
                </p>
              </div>

              {/* NOVA Group Details */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Tingkat Pemrosesan NOVA
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${nova.badgeBg}`}>
                    {nova.badgeText}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  {nova.title}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {nova.desc}
                </p>
              </div>

              {/* Analysis Tags */}
              {product.ingredients_analysis_tags && product.ingredients_analysis_tags.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">
                    Tag Analisis Bahan Terdeteksi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients_analysis_tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {tag.replace('en:', '').replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Button: Calculate & Add to Meal */}
        <div className="pt-4 mt-auto">
          <button
            type="button"
            onClick={() => onOpenMealBuilder(product)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#F472B6] hover:bg-[#ec4899] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Meal Builder: Hitung Porsi Makanan Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
