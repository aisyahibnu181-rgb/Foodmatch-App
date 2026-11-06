import React from 'react';
import { X, Check, SlidersHorizontal, Leaf, Sparkles, HeartPulse } from 'lucide-react';
import { UserPreferences } from '../types/food';

interface PreferencesModalProps {
  preferences: UserPreferences;
  onSave: (updated: UserPreferences) => void;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  preferences,
  onSave,
  onClose,
}) => {
  const [form, setForm] = React.useState<UserPreferences>({ ...preferences });

  const toggle = (key: keyof UserPreferences) => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Preferensi Makanan & Target Gizi
              </h3>
              <p className="text-[11px] text-slate-500">
                Food Compatibility Engine menyesuaikan rekomendasi produk
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup preferensi"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          {/* Dietary Rules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter Kompatibilitas Diet
            </h4>

            {[
              {
                id: 'vegetarian',
                title: 'Vegetarian',
                desc: 'Hindari daging hewani, gelatin, dan kaldu daging',
              },
              {
                id: 'vegan',
                title: 'Vegan 100%',
                desc: 'Bebas susu, telur, madu, dan semua turunan hewani',
              },
              {
                id: 'lowSugar',
                title: 'Rendah Gula (Low Sugar)',
                desc: 'Kandungan gula maksimal 5g / 100g (standar WHO)',
              },
              {
                id: 'unprocessedOnly',
                title: 'Alami / Minim Proses (NOVA 1 & 2)',
                desc: 'Hindari produk industri ultra-proses dengan zat aditif',
              },
              {
                id: 'palmOilFree',
                title: 'Bebas Minyak Sawit (Palm Oil Free)',
                desc: 'Mendukung kelestarian alam dan kesehatan jantung',
              },
              {
                id: 'glutenFree',
                title: 'Bebas Gluten (Gluten Free)',
                desc: 'Cocok untuk penderita celiac atau sensitivitas gandum',
              },
            ].map((rule) => {
              const isChecked = form[rule.id as keyof UserPreferences] as boolean;
              return (
                <div
                  key={rule.id}
                  onClick={() => toggle(rule.id as keyof UserPreferences)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="pr-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      {rule.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {rule.desc}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Goals */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-pink-500" />
              Target Harian (My Journal)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Target Kalori (kcal)
                </label>
                <input
                  type="number"
                  value={form.dailyCalorieTarget}
                  onChange={(e) =>
                    setForm({ ...form, dailyCalorieTarget: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Target Protein (gram)
                </label>
                <input
                  type="number"
                  value={form.dailyProteinTarget}
                  onChange={(e) =>
                    setForm({ ...form, dailyProteinTarget: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Target Karbohidrat (gram)
                </label>
                <input
                  type="number"
                  value={form.dailyCarbsTarget}
                  onChange={(e) =>
                    setForm({ ...form, dailyCarbsTarget: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Target Lemak (gram)
                </label>
                <input
                  type="number"
                  value={form.dailyFatTarget}
                  onChange={(e) =>
                    setForm({ ...form, dailyFatTarget: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
