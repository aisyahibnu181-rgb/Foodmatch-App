export interface FlutterCodeSnippet {
  id: string;
  layer: 'Domain' | 'Data' | 'Riverpod State' | 'Presentation UI';
  filename: string;
  description: string;
  code: string;
}

export const FLUTTER_CODE_SNIPPETS: FlutterCodeSnippet[] = [
  {
    id: 'product-entity',
    layer: 'Domain',
    filename: 'lib/features/food/domain/entities/product.dart',
    description: 'Entitas murni produk makanan & informasi nutrisi tanpa ketergantungan library luar.',
    code: `import 'package:equatable/equatable.dart';

class Nutriments extends Equatable {
  final double energyKcal100g;
  final double proteins100g;
  final double carbohydrates100g;
  final double fat100g;
  final double sugars100g;
  final double fiber100g;

  const Nutriments({
    this.energyKcal100g = 0.0,
    this.proteins100g = 0.0,
    this.carbohydrates100g = 0.0,
    this.fat100g = 0.0,
    this.sugars100g = 0.0,
    this.fiber100g = 0.0,
  });

  @override
  List<Object?> get props => [
        energyKcal100g,
        proteins100g,
        carbohydrates100g,
        fat100g,
        sugars100g,
        fiber100g,
      ];
}

class Product extends Equatable {
  final String code;
  final String productName;
  final String brands;
  final String imageFrontSmallUrl;
  final String? nutriscoreGrade; // 'a', 'b', 'c', 'd', 'e'
  final int? novaGroup; // 1 to 4
  final String ingredientsText;
  final List<String> ingredientsAnalysisTags;
  final Nutriments nutriments;

  const Product({
    required this.code,
    required this.productName,
    required this.brands,
    required this.imageFrontSmallUrl,
    this.nutriscoreGrade,
    this.novaGroup,
    required this.ingredientsText,
    required this.ingredientsAnalysisTags,
    required this.nutriments,
  });

  @override
  List<Object?> get props => [
        code,
        productName,
        brands,
        imageFrontSmallUrl,
        nutriscoreGrade,
        novaGroup,
        ingredientsText,
        ingredientsAnalysisTags,
        nutriments,
      ];
}`,
  },
  {
    id: 'compatibility-usecase',
    layer: 'Domain',
    filename: 'lib/features/food/domain/usecases/check_food_compatibility_usecase.dart',
    description: 'Business logic penentu kecocokan produk makanan dengan preferensi diet (Vegetarian, Gula, NOVA).',
    code: `import '../entities/product.dart';
import '../entities/user_preference.dart';

class CompatibilityResult {
  final bool isCompatible;
  final int matchScore; // 0 to 100%
  final List<String> matchingBadges;
  final List<String> unmetCriteria;

  const CompatibilityResult({
    required this.isCompatible,
    required this.matchScore,
    required this.matchingBadges,
    required this.unmetCriteria,
  });
}

class CheckFoodCompatibilityUseCase {
  CompatibilityResult call(Product product, UserPreference pref) {
    final matchingBadges = <String>[];
    final unmetCriteria = <String>[];
    int activeRules = 0;
    int passedRules = 0;

    final tags = product.ingredientsAnalysisTags.map((t) => t.toLowerCase()).toList();
    final ingredients = product.ingredientsText.toLowerCase();

    // 1. Cek Vegetarian
    if (pref.isVegetarian) {
      activeRules++;
      final isVegTag = tags.contains('en:vegetarian');
      final isNonVegTag = tags.contains('en:non-vegetarian');
      final hasMeat = ['chicken', 'beef', 'pork', 'fish', 'gelatin', 'daging', 'ayam']
          .any((k) => ingredients.contains(k));

      if ((isVegTag || !hasMeat) && !isNonVegTag && !hasMeat) {
        passedRules++;
        matchingBadges.add('Cocok Vegetarian');
      } else {
        unmetCriteria.add('Bukan Vegetarian');
      }
    }

    // 2. Cek Rendah Gula (<= 5g / 100g standar WHO)
    if (pref.isLowSugar) {
      activeRules++;
      if (product.nutriments.sugars100g <= 5.0) {
        passedRules++;
        matchingBadges.add('Rendah Gula (\${product.nutriments.sugars100g}g)');
      } else {
        unmetCriteria.add('Gula Tinggi (\${product.nutriments.sugars100g}g/100g)');
      }
    }

    // 3. Cek Tingkat Pemrosesan NOVA (NOVA 1: Belum diproses / Alami)
    if (pref.isOnlyUnprocessedNova) {
      activeRules++;
      if (product.novaGroup != null && product.novaGroup! <= 2) {
        passedRules++;
        matchingBadges.add('NOVA \${product.novaGroup}: Alami/Minim Proses');
      } else {
        unmetCriteria.add('NOVA \${product.novaGroup ?? 'N/A'}: Olahan/Ultra-Proses');
      }
    }

    final matchScore = activeRules == 0
        ? 100
        : ((passedRules / activeRules) * 100).round();

    return CompatibilityResult(
      isCompatible: activeRules == 0 || matchScore >= 75,
      matchScore: matchScore,
      matchingBadges: matchingBadges,
      unmetCriteria: unmetCriteria,
    );
  }
}`,
  },
  {
    id: 'meal-calculator-usecase',
    layer: 'Domain',
    filename: 'lib/features/food/domain/usecases/calculate_meal_nutrition_usecase.dart',
    description: 'Use Case untuk menghitung kalori & makronutrisi proporsional sesuai gramatur porsi.',
    code: `import '../entities/product.dart';

class CalculatedPortionNutrition {
  final double calories;
  final double proteins;
  final double carbohydrates;
  final double fat;
  final double sugars;

  const CalculatedPortionNutrition({
    required this.calories,
    required this.proteins,
    required this.carbohydrates,
    required this.fat,
    required this.sugars,
  });
}

class CalculateMealNutritionUseCase {
  CalculatedPortionNutrition call({
    required Product product,
    required double portionInGrams,
  }) {
    final scale = portionInGrams / 100.0;
    final n = product.nutriments;

    return CalculatedPortionNutrition(
      calories: double.parse((n.energyKcal100g * scale).toStringAsFixed(1)),
      proteins: double.parse((n.proteins100g * scale).toStringAsFixed(1)),
      carbohydrates: double.parse((n.carbohydrates100g * scale).toStringAsFixed(1)),
      fat: double.parse((n.fat100g * scale).toStringAsFixed(1)),
      sugars: double.parse((n.sugars100g * scale).toStringAsFixed(1)),
    );
  }
}`,
  },
  {
    id: 'product-model',
    layer: 'Data',
    filename: 'lib/features/food/data/models/product_model.dart',
    description: 'Data model serializer JSON respons Open Food Facts API.',
    code: `import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
    required super.code,
    required super.productName,
    required super.brands,
    required super.imageFrontSmallUrl,
    super.nutriscoreGrade,
    super.novaGroup,
    required super.ingredientsText,
    required super.ingredientsAnalysisTags,
    required super.nutriments,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final nutrimentsJson = json['nutriments'] as Map<String, dynamic>? ?? {};

    return ProductModel(
      code: json['code']?.toString() ?? '',
      productName: json['product_name'] ?? 'Unknown Product',
      brands: json['brands'] ?? 'Generic',
      imageFrontSmallUrl: json['image_front_small_url'] ?? '',
      nutriscoreGrade: json['nutriscore_grade']?.toString().toLowerCase(),
      novaGroup: json['nova_group'] != null ? int.tryParse(json['nova_group'].toString()) : null,
      ingredientsText: json['ingredients_text'] ?? '',
      ingredientsAnalysisTags: (json['ingredients_analysis_tags'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      nutriments: Nutriments(
        energyKcal100g: (nutrimentsJson['energy-kcal_100g'] as num?)?.toDouble() ?? 0.0,
        proteins100g: (nutrimentsJson['proteins_100g'] as num?)?.toDouble() ?? 0.0,
        carbohydrates100g: (nutrimentsJson['carbohydrates_100g'] as num?)?.toDouble() ?? 0.0,
        fat100g: (nutrimentsJson['fat_100g'] as num?)?.toDouble() ?? 0.0,
        sugars100g: (nutrimentsJson['sugars_100g'] as num?)?.toDouble() ?? 0.0,
        fiber100g: (nutrimentsJson['fiber_100g'] as num?)?.toDouble() ?? 0.0,
      ),
    );
  }
}`,
  },
  {
    id: 'food-api-service',
    layer: 'Data',
    filename: 'lib/data/services/food_api_service.dart',
    description: 'Service HTTP resmi Open Food Facts v2 API dengan User-Agent wajib & error handling.',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product_model.dart';

/// Service untuk berinteraksi langsung dengan Open Food Facts API v2.
/// Dokumentasi resmi: https://world.openfoodfacts.org/data
class FoodApiService {
  static const String _baseUrl = 'https://world.openfoodfacts.org/api/v2/search';

  /// Kebijakan resmi Open Food Facts: User-Agent adalah pengganti API Key.
  /// User-Agent harus menyertakan nama aplikasi, versi, dan kontak/URL.
  static const Map<String, String> _headers = {
    'User-Agent': 'FoodMatch - Flutter Student Challenge - Version 1.0 - https://world.openfoodfacts.org/data',
    'Accept': 'application/json',
  };

  final http.Client client;

  FoodApiService({http.Client? client}) : client = client ?? http.Client();

  /// Mencari produk makanan berdasarkan query dengan parameter terstandarisasi.
  /// Mengambil data Nutri-Score, NOVA group, komposisi, tags analisis, dan nutriments 100g.
  Future<List<ProductModel>> searchFoods(String query, {int pageSize = 10}) async {
    final cleanQuery = query.trim();
    if (cleanQuery.isEmpty) {
      return [];
    }

    final uri = Uri.parse(
      '$_baseUrl?search_terms=\${Uri.encodeComponent(cleanQuery)}&page_size=$pageSize&fields=code,product_name,brands,image_front_small_url,nutriscore_grade,nova_group,ingredients_text,ingredients_analysis_tags,nutriments',
    );

    try {
      final response = await client.get(uri, headers: _headers);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);

        if (data.containsKey('products') && data['products'] is List) {
          final List<dynamic> productsJson = data['products'];
          return productsJson
              .where((item) => item != null && item is Map<String, dynamic>)
              .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
        return [];
      } else {
        throw Exception(
          'Gagal mengambil data dari Open Food Facts (Status: \${response.statusCode})',
        );
      }
    } catch (e) {
      throw Exception('Kesalahan koneksi ke Open Food Facts API: $e');
    }
  }

  void dispose() {
    client.close();
  }
}`,
  },
  {
    id: 'riverpod-providers',
    layer: 'Riverpod State',
    filename: 'lib/features/food/presentation/providers/food_providers.dart',
    description: 'Riverpod 2.x StateNotifier & AsyncNotifier untuk Search, Compatibility, dan Quick Meal Builder.',
    code: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../data/services/food_api_service.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/user_preference.dart';
import '../../domain/usecases/search_food_usecase.dart';
import '../../domain/usecases/check_food_compatibility_usecase.dart';
import '../../domain/usecases/calculate_meal_nutrition_usecase.dart';

// 1. Dependency Injection Providers
final httpClientProvider = Provider<http.Client>((ref) {
  final client = http.Client();
  ref.onDispose(() => client.close());
  return client;
});

final foodApiServiceProvider = Provider<FoodApiService>((ref) {
  return FoodApiService(client: ref.watch(httpClientProvider));
});

final searchFoodUseCaseProvider = Provider((ref) {
  final apiService = ref.watch(foodApiServiceProvider);
  return (String query) => apiService.searchFoods(query, pageSize: 10);
});

final checkCompatibilityUseCaseProvider = Provider((ref) {
  return CheckFoodCompatibilityUseCase();
});

final calculateMealNutritionUseCaseProvider = Provider((ref) {
  return CalculateMealNutritionUseCase();
});

// 2. User Preferences Provider
final userPreferencesProvider = StateNotifierProvider<UserPreferencesNotifier, UserPreference>((ref) {
  return UserPreferencesNotifier();
});

class UserPreferencesNotifier extends StateNotifier<UserPreference> {
  UserPreferencesNotifier()
      : super(const UserPreference(
          isVegetarian: true,
          isLowSugar: true,
          isOnlyUnprocessedNova: false,
        ));

  void toggleVegetarian() => state = state.copyWith(isVegetarian: !state.isVegetarian);
  void toggleLowSugar() => state = state.copyWith(isLowSugar: !state.isLowSugar);
  void toggleNovaGroup() => state = state.copyWith(isOnlyUnprocessedNova: !state.isOnlyUnprocessedNova);
}

// 3. Food Search AsyncNotifier
final foodSearchQueryProvider = StateProvider<String>((ref) => 'oat');

final foodSearchResultsProvider = FutureProvider<List<Product>>((ref) async {
  final query = ref.watch(foodSearchQueryProvider);
  final searchUseCase = ref.watch(searchFoodUseCaseProvider);
  return searchUseCase(query);
});

// 4. Quick Meal Builder State
class MealBuilderItem {
  final Product product;
  final double portionGrams;
  final CalculatedPortionNutrition nutrition;

  MealBuilderItem({required this.product, required this.portionGrams, required this.nutrition});
}

class MealBuilderNotifier extends StateNotifier<List<MealBuilderItem>> {
  final CalculateMealNutritionUseCase calculator;

  MealBuilderNotifier({required this.calculator}) : super([]);

  void addOrUpdateProduct(Product product, double grams) {
    final nutrition = calculator(product: product, portionInGrams: grams);
    state = [
      ...state.where((item) => item.product.code != product.code),
      MealBuilderItem(product: product, portionGrams: grams, nutrition: nutrition),
    ];
  }

  void removeItem(String productCode) {
    state = state.where((item) => item.product.code != productCode).toList();
  }

  void clear() => state = [];
}

final mealBuilderProvider = StateNotifierProvider<MealBuilderNotifier, List<MealBuilderItem>>((ref) {
  return MealBuilderNotifier(calculator: ref.watch(calculateMealNutritionUseCaseProvider));
});`,
  },
  {
    id: 'macro-ring-widget',
    layer: 'Presentation UI',
    filename: 'lib/features/food/presentation/widgets/macro_ring_card.dart',
    description: 'Widget Circular Ring Macroutrition sesuai referensi screen (Protein %, Carbs %, Fat %).',
    code: `import 'package:flutter/material.dart';

class MacroRingCard extends StatelessWidget {
  final String label;
  final double percentage;
  final String weightText;
  final Color ringColor;

  const MacroRingCard({
    super.key,
    required this.label,
    required this.percentage,
    required this.weightText,
    required this.ringColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 105,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
      decoration: BoxDecoration(
        color: ringColor.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          SizedBox(
            width: 58,
            height: 58,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: (percentage / 100).clamp(0.0, 1.0),
                  strokeWidth: 5.5,
                  strokeCap: StrokeCap.round,
                  backgroundColor: ringColor.withOpacity(0.2),
                  valueColor: AlwaysStoppedAnimation<Color>(ringColor),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '\${percentage.toInt()}%',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    Text(
                      weightText,
                      style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ],
      ),
    );
  }
}`,
  },
];
