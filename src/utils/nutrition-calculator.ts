import { Product, MealItem, MealSummary, UserPreferences, CompatibilityResult } from '../types/food';

/**
 * Calculates scaled nutrients for a single product given the portion in grams.
 * Standard Open Food Facts nutrients are based on 100g.
 */
export function calculateItemMacros(product: Product, portionGrams: number): MealItem {
  const factor = Math.max(0, portionGrams) / 100;
  const n = product.nutriments || {};

  const cal100 = n['energy-kcal_100g'] ?? 0;
  const pro100 = n.proteins_100g ?? 0;
  const carb100 = n.carbohydrates_100g ?? 0;
  const fat100 = n.fat_100g ?? 0;
  const sugar100 = n.sugars_100g ?? 0;

  return {
    product,
    portionGrams,
    calculatedCalories: Math.round(cal100 * factor * 10) / 10,
    calculatedProteins: Math.round(pro100 * factor * 10) / 10,
    calculatedCarbs: Math.round(carb100 * factor * 10) / 10,
    calculatedFat: Math.round(fat100 * factor * 10) / 10,
    calculatedSugars: Math.round(sugar100 * factor * 10) / 10,
  };
}

/**
 * Aggregates all items in a meal and computes macro calories & percentages.
 * 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
 */
export function calculateMealTotal(items: MealItem[]): MealSummary {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalSugars = 0;

  for (const item of items) {
    totalCalories += item.calculatedCalories;
    totalProteins += item.calculatedProteins;
    totalCarbs += item.calculatedCarbs;
    totalFat += item.calculatedFat;
    totalSugars += item.calculatedSugars;
  }

  // Calculate percentage of macro energy
  const proKcal = totalProteins * 4;
  const carbKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const totalMacroKcal = proKcal + carbKcal + fatKcal;

  let proteinPct = 0;
  let carbsPct = 0;
  let fatPct = 0;

  if (totalMacroKcal > 0) {
    proteinPct = Math.round((proKcal / totalMacroKcal) * 100);
    carbsPct = Math.round((carbKcal / totalMacroKcal) * 100);
    fatPct = Math.max(0, 100 - proteinPct - carbsPct); // Ensure sum to 100
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProteins: Math.round(totalProteins * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalSugars: Math.round(totalSugars * 10) / 10,
    proteinPct,
    carbsPct,
    fatPct,
  };
}

/**
 * Checks compatibility of a food product against user preferences:
 * - vegetarian: checks analysis tags for 'en:vegetarian' and avoids 'en:non-vegetarian'
 * - vegan: checks tags for 'en:vegan'
 * - lowSugar: sugar <= 5g per 100g
 * - lowCalorie: energy <= 150 kcal per 100g
 * - unprocessedOnly: NOVA group 1 or 2
 * - palmOilFree: checks tags for 'en:palm-oil-free' or no palm oil mentions
 * - glutenFree: checks ingredients for absence of wheat, gluten, barley, rye
 */
export function checkCompatibility(product: Product, prefs: UserPreferences): CompatibilityResult {
  const matchingBadges: string[] = [];
  const unmetCriteria: string[] = [];
  const warnings: string[] = [];

  const tags = (product.ingredients_analysis_tags || []).map((t) => t.toLowerCase());
  const ingredients = (product.ingredients_text || '').toLowerCase();
  const n = product.nutriments || {};
  const sugar = n.sugars_100g ?? 0;
  const kcal = n['energy-kcal_100g'] ?? 0;
  const nova = product.nova_group;

  let activeCriteriaCount = 0;
  let matchedCriteriaCount = 0;

  // 1. Vegetarian
  if (prefs.vegetarian) {
    activeCriteriaCount++;
    const isExplicitVeg = tags.includes('en:vegetarian');
    const isExplicitNonVeg = tags.includes('en:non-vegetarian');
    const meatKeywords = ['chicken', 'beef', 'pork', 'meat', 'gelatin', 'fish', 'bacon', 'salmon', 'ham', 'ayam', 'daging'];
    const hasMeat = meatKeywords.some((k) => ingredients.includes(k));

    if ((isExplicitVeg || (!hasMeat && !isExplicitNonVeg)) && !isExplicitNonVeg && !hasMeat) {
      matchedCriteriaCount++;
      matchingBadges.push('Cocok Vegetarian');
    } else {
      unmetCriteria.push('Bukan produk Vegetarian');
    }
  }

  // 2. Vegan
  if (prefs.vegan) {
    activeCriteriaCount++;
    const isExplicitVegan = tags.includes('en:vegan');
    const isNonVegan = tags.includes('en:non-vegan');
    const nonVeganKeywords = ['milk', 'egg', 'cheese', 'butter', 'honey', 'susu', 'telur', 'keju'];
    const hasAnimalProducts = nonVeganKeywords.some((k) => ingredients.includes(k));

    if (isExplicitVegan && !isNonVegan && !hasAnimalProducts) {
      matchedCriteriaCount++;
      matchingBadges.push('Vegan 100%');
    } else {
      unmetCriteria.push('Mengandung bahan turunan hewani (Non-Vegan)');
    }
  }

  // 3. Low Sugar (<= 5g / 100g)
  if (prefs.lowSugar) {
    activeCriteriaCount++;
    if (sugar <= 5) {
      matchedCriteriaCount++;
      matchingBadges.push(`Rendah Gula (${sugar}g/100g)`);
    } else {
      unmetCriteria.push(`Tinggi Gula (${sugar}g/100g > batas 5g)`);
      if (sugar > 15) {
        warnings.push('Kadar gula sangat tinggi');
      }
    }
  }

  // 4. Low Calorie (<= 150 kcal / 100g)
  if (prefs.lowCalorie) {
    activeCriteriaCount++;
    if (kcal <= 150) {
      matchedCriteriaCount++;
      matchingBadges.push(`Rendah Kalori (${kcal} kcal)`);
    } else {
      unmetCriteria.push(`Kalori ${kcal} kcal > batas 150 kcal`);
    }
  }

  // 5. Unprocessed / Minimally processed (NOVA 1 or 2)
  if (prefs.unprocessedOnly) {
    activeCriteriaCount++;
    if (nova && nova <= 2) {
      matchedCriteriaCount++;
      matchingBadges.push(nova === 1 ? 'NOVA 1: Alami / Belum Diproses' : 'NOVA 2: Bahan Kuliner Dasar');
    } else if (nova === 3) {
      unmetCriteria.push('NOVA 3: Makanan Olahan (Processed Food)');
    } else if (nova === 4) {
      unmetCriteria.push('NOVA 4: Makanan Ultra-Proses (Ultra-Processed Food)');
      warnings.push('Perhatian: Produk tergolong ultra-olahan dengan zat aditif');
    } else {
      // unknown nova, give partial credit or caution
      warnings.push('Data pemrosesan NOVA tidak tersedia');
    }
  }

  // 6. Palm Oil Free
  if (prefs.palmOilFree) {
    activeCriteriaCount++;
    const isPalmFree = tags.includes('en:palm-oil-free');
    const hasPalm = tags.includes('en:palm-oil') || ingredients.includes('palm');
    if (isPalmFree && !hasPalm) {
      matchedCriteriaCount++;
      matchingBadges.push('Bebas Minyak Sawit');
    } else if (hasPalm) {
      unmetCriteria.push('Mengandung Minyak Sawit (Palm Oil)');
    } else {
      unmetCriteria.push('Kemungkinan mengandung Minyak Sawit');
    }
  }

  // 7. Gluten Free
  if (prefs.glutenFree) {
    activeCriteriaCount++;
    const glutenKeywords = ['wheat', 'barley', 'rye', 'gluten', 'gandum', 'terigu'];
    const hasGluten = glutenKeywords.some((k) => ingredients.includes(k));
    if (!hasGluten) {
      matchedCriteriaCount++;
      matchingBadges.push('Bebas Gluten');
    } else {
      unmetCriteria.push('Mengandung Gluten / Gandum');
    }
  }

  const matchScore = activeCriteriaCount === 0
    ? 100
    : Math.round((matchedCriteriaCount / activeCriteriaCount) * 100);

  const isCompatible = activeCriteriaCount === 0 || matchScore >= 75;

  return {
    isCompatible,
    matchScore,
    matchingBadges,
    unmetCriteria,
    warnings,
  };
}

/**
 * Nutri-Score metadata (A=Green healthiest down to E=Red least healthy)
 */
export function getNutriscoreDetails(grade?: string): {
  grade: string;
  label: string;
  colorBg: string;
  colorText: string;
  badgeHex: string;
  desc: string;
} {
  const g = (grade || '').toLowerCase();
  switch (g) {
    case 'a':
      return { grade: 'A', label: 'Nutri-Score A', colorBg: 'bg-emerald-500', colorText: 'text-white', badgeHex: '#038141', desc: 'Kualitas nutrisi sangat baik' };
    case 'b':
      return { grade: 'B', label: 'Nutri-Score B', colorBg: 'bg-lime-500', colorText: 'text-white', badgeHex: '#85BB2F', desc: 'Kualitas nutrisi baik' };
    case 'c':
      return { grade: 'C', label: 'Nutri-Score C', colorBg: 'bg-amber-400', colorText: 'text-slate-900', badgeHex: '#FECB02', desc: 'Kualitas nutrisi standar' };
    case 'd':
      return { grade: 'D', label: 'Nutri-Score D', colorBg: 'bg-orange-500', colorText: 'text-white', badgeHex: '#EE8100', desc: 'Perhatikan porsi konsumsi' };
    case 'e':
      return { grade: 'E', label: 'Nutri-Score E', colorBg: 'bg-rose-500', colorText: 'text-white', badgeHex: '#E63E11', desc: 'Konsumsi terbatas (tinggi kalori/gula/garam)' };
    default:
      return { grade: '?', label: 'Nutri-Score N/A', colorBg: 'bg-gray-400', colorText: 'text-white', badgeHex: '#9ca3af', desc: 'Skor nutrisi tidak tercantum' };
  }
}

/**
 * NOVA Group metadata (1: Unprocessed, 2: Culinary ingredients, 3: Processed, 4: Ultra-processed)
 */
export function getNovaDetails(group?: number): {
  group: number;
  title: string;
  badgeBg: string;
  badgeText: string;
  desc: string;
} {
  switch (group) {
    case 1:
      return { group: 1, title: 'NOVA 1: Alami', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300', badgeText: 'NOVA 1', desc: 'Makanan segar atau diproses secara minimal tanpa bahan tambahan.' };
    case 2:
      return { group: 2, title: 'NOVA 2: Kuliner Dasar', badgeBg: 'bg-blue-100 text-blue-800 border-blue-300', badgeText: 'NOVA 2', desc: 'Bahan masakan yang diperoleh langsung dari alam (minyak, garam, gula).' };
    case 3:
      return { group: 3, title: 'NOVA 3: Olahan', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', badgeText: 'NOVA 3', desc: 'Makanan yang diawetkan atau diolah dengan garam, gula, atau minyak.' };
    case 4:
      return { group: 4, title: 'NOVA 4: Ultra-Proses', badgeBg: 'bg-rose-100 text-rose-800 border-rose-300', badgeText: 'NOVA 4', desc: 'Produk industri dengan banyak bahan tambahan, pewarna, pengawet, dan perisa buatan.' };
    default:
      return { group: 0, title: 'NOVA N/A', badgeBg: 'bg-gray-100 text-gray-700 border-gray-300', badgeText: 'NOVA -', desc: 'Tingkat pemrosesan tidak tercatat.' };
  }
}
