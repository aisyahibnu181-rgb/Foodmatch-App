import React from 'react';
import { Flame, Bookmark, Plus, Clock, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product, UserPreferences } from '../types/food';
import { checkCompatibility, getNutriscoreDetails, getNovaDetails } from '../utils/nutrition-calculator';

interface FoodCardProps {
  product: Product;
  userPrefs: UserPreferences;
  onSelect: (product: Product) => void;
  onAddToMeal?: (product: Product) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (code: string) => void;
  variant?: 'grid' | 'horizontal';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  product,
  userPrefs,
  onSelect,
  onAddToMeal,
  isBookmarked = false,
  onToggleBookmark,
  variant = 'grid',
}) => {
  const compatibility = checkCompatibility(product, userPrefs);
  const nutriscore = getNutriscoreDetails(product.nutriscore_grade);
  const nova = getNovaDetails(product.nova_group);
  const kcal = product.nutriments['energy-kcal_100g'] ?? 0;

  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => onSelect(product)}
        className="group relative bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 items-center"
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <img
            src={product.image_front_small_url}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
            }}
          />
          {product.nutriscore_grade && (
            <span
              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white ${nutriscore.colorBg}`}
            >
              {product.nutriscore_grade}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {compatibility.matchingBadges[0] && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {compatibility.matchingBadges[0]}
              </span>
            )}
            {product.nova_group && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                NOVA {product.nova_group}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-900 truncate">
            {product.product_name}
          </h4>
          <p className="text-[11px] text-slate-500 truncate mb-1">
            {product.brands}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-0.5 font-semibold text-amber-600">
              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
              {Math.round(kcal)} kcal
            </span>
            <span className="text-slate-400">•</span>
            <span>100g</span>
          </div>
        </div>

        {onAddToMeal && (
          <button
            type="button"
            aria-label={`Add ${product.product_name} to meal`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToMeal(product);
            }}
            className="p-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Grid Card (like in Screenshot 1 & Screenshot 3)
  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_front_small_url}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Top left tags: Nutri-Score & NOVA */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {product.nutriscore_grade && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-white shadow-xs ${nutriscore.colorBg}`}
              title={nutriscore.desc}
            >
              Nutri {product.nutriscore_grade}
            </span>
          )}
          {product.nova_group && (
            <span
              className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs"
              title={nova.title}
            >
              N{product.nova_group}
            </span>
          )}
        </div>

        {/* Top right: Bookmark */}
        {onToggleBookmark && (
          <button
            type="button"
            aria-label={isBookmarked ? `Unbookmark ${product.product_name}` : `Bookmark ${product.product_name}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(product.code);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-slate-700 flex items-center justify-center backdrop-blur-xs shadow-xs transition-colors"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-pink-500 text-pink-500' : 'text-slate-600'
              }`}
            />
          </button>
        )}

        {/* Bottom Floating Pill: Calories */}
        <div className="absolute bottom-2.5 left-2.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs shadow-xs text-[11px] font-bold text-slate-800">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{Math.round(kcal)} kcal</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Compatibility Pill */}
          <div className="mb-1.5 flex items-center gap-1 flex-wrap">
            {compatibility.isCompatible ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <ShieldCheck className="w-2.5 h-2.5" />
                {compatibility.matchingBadges[0] || 'Cocok Preferensi'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                <AlertCircle className="w-2.5 h-2.5" />
                {compatibility.unmetCriteria[0] || 'Cek Bahan'}
              </span>
            )}
          </div>

          <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
            {product.product_name}
          </h3>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {product.brands}
          </p>
        </div>

        {/* Footer info: Servings / Add button */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{product.servings || 1} serv</span>
          </span>

          {onAddToMeal && (
            <button
              type="button"
              aria-label={`Add ${product.product_name} to meal`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToMeal(product);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Porsi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
