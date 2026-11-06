import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateItemMacros,
  calculateMealTotal,
  checkCompatibility,
  getNutriscoreDetails,
  getNovaDetails,
} from './nutrition-calculator';
import { Product, UserPreferences } from '../types/food';

const mockOats: Product = {
  code: '3229820129488',
  product_name: 'Rolled Oats',
  brands: 'Quaker',
  image_front_small_url: 'https://images.openfoodfacts.org/images/products/322/982/012/9488/front_en.jpg',
  nutriscore_grade: 'a',
  nova_group: 1,
  ingredients_text: '100% whole grain rolled oats',
  ingredients_analysis_tags: [
    'en:palm-oil-free',
    'en:vegan',
    'en:vegetarian',
  ],
  nutriments: {
    'energy-kcal_100g': 375.0,
    proteins_100g: 13.5,
    carbohydrates_100g: 60.0,
    fat_100g: 6.5,
    sugars_100g: 1.2,
  },
};

const mockCandy: Product = {
  code: '8801043000000',
  product_name: 'Choco Sugar Bar',
  brands: 'SweetCo',
  image_front_small_url: 'https://images.openfoodfacts.org/choco.jpg',
  nutriscore_grade: 'e',
  nova_group: 4,
  ingredients_text: 'Sugar, palm oil, cocoa, milk powder, artificial flavors',
  ingredients_analysis_tags: [
    'en:palm-oil',
    'en:vegetarian',
    'en:non-vegan',
  ],
  nutriments: {
    'energy-kcal_100g': 540.0,
    proteins_100g: 5.0,
    carbohydrates_100g: 65.0,
    fat_100g: 30.0,
    sugars_100g: 52.0,
  },
};

test('calculateItemMacros correctly scales nutrients for 50g portion', () => {
  const item = calculateItemMacros(mockOats, 50);
  assert.equal(item.portionGrams, 50);
  assert.equal(item.calculatedCalories, 187.5);
  assert.equal(item.calculatedProteins, 6.8); // 13.5 * 0.5 = 6.75 -> 6.8
  assert.equal(item.calculatedCarbs, 30.0);
  assert.equal(item.calculatedFat, 3.3); // 6.5 * 0.5 = 3.25 -> 3.3
  assert.equal(item.calculatedSugars, 0.6);
});

test('calculateMealTotal sums macros and calculates macro calories percentage', () => {
  const item1 = calculateItemMacros(mockOats, 100); // 375 kcal, 13.5g P, 60g C, 6.5g F
  const summary = calculateMealTotal([item1]);

  assert.equal(summary.totalCalories, 375);
  assert.equal(summary.totalProteins, 13.5);
  assert.equal(summary.totalCarbs, 60.0);
  assert.equal(summary.totalFat, 6.5);
  // Total macro kcal: (13.5 * 4) + (60 * 4) + (6.5 * 9) = 54 + 240 + 58.5 = 352.5
  // Pct: 54 / 352.5 = 15%, Carbs: 240 / 352.5 = 68%, Fat = 17%
  assert.ok(summary.proteinPct > 0);
  assert.ok(summary.carbsPct > 0);
  assert.equal(summary.proteinPct + summary.carbsPct + summary.fatPct, 100);
});

test('checkCompatibility validates vegetarian, vegan, and low sugar criteria', () => {
  const prefs: UserPreferences = {
    vegetarian: true,
    vegan: true,
    lowSugar: true,
    lowCalorie: false,
    unprocessedOnly: true,
    palmOilFree: true,
    glutenFree: false,
    dailyCalorieTarget: 2000,
    dailyProteinTarget: 80,
    dailyCarbsTarget: 200,
    dailyFatTarget: 50,
  };

  const oatsResult = checkCompatibility(mockOats, prefs);
  assert.equal(oatsResult.isCompatible, true);
  assert.equal(oatsResult.matchScore, 100);
  assert.ok(oatsResult.matchingBadges.some((b) => b.includes('Vegetarian')));
  assert.ok(oatsResult.matchingBadges.some((b) => b.includes('Vegan')));
  assert.ok(oatsResult.matchingBadges.some((b) => b.includes('Rendah Gula')));
  assert.ok(oatsResult.matchingBadges.some((b) => b.includes('NOVA 1')));

  const candyResult = checkCompatibility(mockCandy, prefs);
  assert.equal(candyResult.isCompatible, false);
  assert.ok(candyResult.matchScore < 50);
  assert.ok(candyResult.unmetCriteria.some((u) => u.includes('Non-Vegan')));
  assert.ok(candyResult.unmetCriteria.some((u) => u.includes('Tinggi Gula')));
  assert.ok(candyResult.unmetCriteria.some((u) => u.includes('NOVA 4')));
});

test('getNutriscoreDetails and getNovaDetails return accurate metadata', () => {
  const nutriA = getNutriscoreDetails('a');
  assert.equal(nutriA.grade, 'A');
  assert.equal(nutriA.colorBg, 'bg-emerald-500');

  const nutriE = getNutriscoreDetails('e');
  assert.equal(nutriE.grade, 'E');

  const nova1 = getNovaDetails(1);
  assert.equal(nova1.group, 1);
  assert.ok(nova1.title.includes('Alami'));

  const nova4 = getNovaDetails(4);
  assert.equal(nova4.group, 4);
  assert.ok(nova4.title.includes('Ultra-Proses'));
});
