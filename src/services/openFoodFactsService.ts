import { Product } from '../types/food';
import { PRESET_FOODS } from '../data/presetFoods';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/search';

export async function searchOpenFoodFacts(
  query: string,
  pageSize = 10
): Promise<{ products: Product[]; isLive: boolean; error?: string }> {
  const trimmed = query.trim().toLowerCase();

  // If query is empty or "all", return preset foods
  if (!trimmed) {
    return { products: PRESET_FOODS, isLive: false };
  }

  try {
    const url = `${BASE_URL}?search_terms=${encodeURIComponent(
      trimmed
    )}&page_size=${pageSize}&fields=code,product_name,brands,image_front_small_url,nutriscore_grade,nova_group,ingredients_text,ingredients_analysis_tags,nutriments`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FoodMatch - Flutter Student Challenge - Version 1.0 - https://world.openfoodfacts.org/data',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    const rawProducts = Array.isArray(data.products) ? data.products : [];

    const mappedProducts: Product[] = rawProducts
      .filter((p: any) => p && (p.product_name || p.brands))
      .map((p: any) => ({
        code: p.code || String(Math.random()),
        product_name: p.product_name || 'Makanan Tanpa Nama',
        brands: p.brands || 'Brand Lokal / Impor',
        image_front_small_url:
          p.image_front_small_url ||
          p.image_url ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        image_url: p.image_url || p.image_front_small_url,
        nutriscore_grade: p.nutriscore_grade || undefined,
        nova_group: typeof p.nova_group === 'number' ? p.nova_group : undefined,
        ingredients_text: p.ingredients_text || 'Komposisi tidak tercatat di database kemasan.',
        ingredients_analysis_tags: Array.isArray(p.ingredients_analysis_tags)
          ? p.ingredients_analysis_tags
          : [],
        nutriments: {
          'energy-kcal_100g': Number(p.nutriments?.['energy-kcal_100g']) || 0,
          proteins_100g: Number(p.nutriments?.proteins_100g) || 0,
          carbohydrates_100g: Number(p.nutriments?.carbohydrates_100g) || 0,
          fat_100g: Number(p.nutriments?.fat_100g) || 0,
          sugars_100g: Number(p.nutriments?.sugars_100g) || 0,
          fiber_100g: Number(p.nutriments?.fiber_100g) || 0,
        },
        category: 'Lunch',
        prep_time_minutes: 10,
        servings: 1,
        description: p.generic_name || p.ingredients_text?.slice(0, 120) || 'Produk terdaftar di Open Food Facts.',
      }));

    if (mappedProducts.length > 0) {
      return { products: mappedProducts, isLive: true };
    }

    // Fallback if live returned 0 results
    const filteredPresets = PRESET_FOODS.filter(
      (f) =>
        f.product_name.toLowerCase().includes(trimmed) ||
        f.brands.toLowerCase().includes(trimmed) ||
        (f.ingredients_text || '').toLowerCase().includes(trimmed)
    );

    return {
      products: filteredPresets.length > 0 ? filteredPresets : PRESET_FOODS,
      isLive: false,
    };
  } catch (err: any) {
    // Graceful offline / fallback to curated preset foods
    const filteredPresets = PRESET_FOODS.filter(
      (f) =>
        f.product_name.toLowerCase().includes(trimmed) ||
        f.brands.toLowerCase().includes(trimmed) ||
        (f.ingredients_text || '').toLowerCase().includes(trimmed)
    );

    return {
      products: filteredPresets.length > 0 ? filteredPresets : PRESET_FOODS,
      isLive: false,
      error: 'Mode Offline / Menggunakan cache lokal Open Food Facts',
    };
  }
}
