export interface Nutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  sodium_100g?: number;
}

export interface Product {
  code: string;
  product_name: string;
  brands: string;
  image_front_small_url: string;
  image_url?: string;
  nutriscore_grade?: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  nova_group?: number; // 1 to 4
  ingredients_text?: string;
  ingredients_analysis_tags?: string[];
  nutriments: Nutriments;
  category?: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  prep_time_minutes?: number;
  servings?: number;
  description?: string;
}

export interface MealItem {
  product: Product;
  portionGrams: number;
  calculatedCalories: number;
  calculatedProteins: number;
  calculatedCarbs: number;
  calculatedFat: number;
  calculatedSugars: number;
}

export interface MealSummary {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFat: number;
  totalSugars: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface UserPreferences {
  vegetarian: boolean;
  vegan: boolean;
  lowSugar: boolean; // sugars <= 5g / 100g
  lowCalorie: boolean; // energy <= 150 kcal / 100g
  unprocessedOnly: boolean; // nova_group <= 2
  palmOilFree: boolean;
  glutenFree: boolean;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  matchScore: number; // percentage 0 - 100
  matchingBadges: string[];
  unmetCriteria: string[];
  warnings: string[];
}

export interface JournalEntry {
  id: string;
  title: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  time: string;
  items: MealItem[];
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
  servings: number;
}
