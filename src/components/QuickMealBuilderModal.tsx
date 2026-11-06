import React, { useState } from 'react';
import { X, Plus, Trash2, Flame, Scale, Check, Sparkles, ChefHat } from 'lucide-react';
import { Product, MealItem, UserPreferences } from '../types/food';
import { calculateItemMacros, calculateMealTotal } from '../utils/nutrition-calculator';
import { MacroRingCard } from './MacroRingCard';

interface QuickMealBuilderModalProps {
  initialProduct?: Product | null;
  allProducts: Product[];
  userPrefs: UserPreferences;
  onClose: () => void;
  onSaveToJournal: (
    title: string,
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    items: MealItem[],
    imageUrl?: string
  ) => void;
}

export const QuickMealBuilderModal: React.FC<QuickMealBuilderModalProps> = ({
  initialProduct,
  allProducts,
  userPrefs,
  onClose,
  onSaveToJournal,
}) => {
  // Start with initial product or first available product
  const defaultProduct = initialProduct || allProducts[0];
  const [mealItems, setMealItems] = useState<MealItem[]>([
    calculateItemMacros(defaultProduct, 150),
  ]);
  const [mealTitle, setMealTitle] = useState(
    initialProduct ? `${initialProduct.product_name} Meal` : 'My Quick Balanced Meal'
  );
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');

  const summary = calculateMealTotal(mealItems);

  const handleUpdatePortion = (index: number, newGrams: number) => {
    const updated = [...mealItems];
    const target = updated[index];
    if (target) {
      updated[index] = calculateItemMacros(target.product, Math.max(10, newGrams));
      setMealItems(updated);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (mealItems.length > 1) {
      setMealItems(mealItems.filter((_, i) => i !== index));
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const prod = allProducts.find((p) => p.code === selectedProductToAdd);
    if (prod) {
      setMealItems([...mealItems, calculateItemMacros(prod, 100)]);
      setSelectedProductToAdd('');
    }
  };

  const handleSave = () => {
    if (mealItems.length === 0) return;
    onSaveToJournal(
      mealTitle,
      mealType,
      mealItems,
      mealItems[0]?.product?.image_front_small_url
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Quick Meal Builder
              </h3>
              <p className="text-[11px] text-slate-500">
                Hitung estimasi nutrisi realtime berdasarkan gramatur porsi
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup meal builder"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meal Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nama Menu
              </label>
              <input
                type="text"
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Waktu Santap
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          {/* Realtime Calculated Total Banner */}
          <div className="bg-[#B9B8F4] text-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span className="text-sm font-bold">Estimasi Total Nutrisi:</span>
              </div>
              <span className="text-xl font-black bg-white/20 px-3 py-0.5 rounded-full">
                {summary.totalCalories} kcal
              </span>
            </div>

            {/* 3 Macro Rings side by side */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-white/15 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] text-white/80 block font-medium">Protein ({summary.proteinPct}%)</span>
                <span className="text-base font-bold text-white">{summary.totalProteins}g</span>
              </div>
              <div className="bg-white/15 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] text-white/80 block font-medium">Karbo ({summary.carbsPct}%)</span>
                <span className="text-base font-bold text-white">{summary.totalCarbs}g</span>
              </div>
              <div className="bg-white/15 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] text-white/80 block font-medium">Lemak ({summary.fatPct}%)</span>
                <span className="text-base font-bold text-white">{summary.totalFat}g</span>
              </div>
            </div>
          </div>

          {/* Selected Food Items & Portion Sliders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Produk dalam Racikan ({mealItems.length})
              </h4>
            </div>

            {mealItems.map((item, idx) => {
              const prod = item.product;
              return (
                <div
                  key={`${prod.code}-${idx}`}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image_front_small_url}
                        alt={prod.product_name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {prod.product_name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {prod.brands} • {prod.nutriments['energy-kcal_100g']} kcal/100g
                        </p>
                      </div>
                    </div>

                    {mealItems.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Hapus ${prod.product_name}`}
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Portion Slider Control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        Porsi Makanan:
                      </span>
                      <span className="font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                        {item.portionGrams} gram
                      </span>
                    </div>

                    <input
                      type="range"
                      min={20}
                      max={400}
                      step={10}
                      value={item.portionGrams}
                      onChange={(e) => handleUpdatePortion(idx, Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex gap-1.5 pt-1">
                      {[50, 100, 150, 200, 250].map((grams) => (
                        <button
                          key={grams}
                          type="button"
                          onClick={() => handleUpdatePortion(idx, grams)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                            item.portionGrams === grams
                              ? 'bg-pink-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {grams}g
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Macros for this Item */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Kalori</span>
                      <span className="font-bold text-slate-900">{item.calculatedCalories} kcal</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Protein</span>
                      <span className="font-bold text-slate-900">{item.calculatedProteins}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Karbo</span>
                      <span className="font-bold text-slate-900">{item.calculatedCarbs}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Lemak</span>
                      <span className="font-bold text-slate-900">{item.calculatedFat}g</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another Product dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="">+ Tambah Produk Lain ke Racikan</option>
                {allProducts
                  .filter((p) => !mealItems.some((m) => m.product.code === p.code))
                  .map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.product_name} ({p.brands})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductToAdd}
                className="px-4 py-2 bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-pink-200 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Simpan ke My Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
