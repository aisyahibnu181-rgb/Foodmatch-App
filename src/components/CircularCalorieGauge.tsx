import React from 'react';
import { Flame } from 'lucide-react';

interface CircularCalorieGaugeProps {
  consumedCalories: number;
  targetCalories: number;
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
}

export const CircularCalorieGauge: React.FC<CircularCalorieGaugeProps> = ({
  consumedCalories,
  targetCalories,
  consumedProtein,
  targetProtein,
  consumedCarbs,
  targetCarbs,
  consumedFat,
  targetFat,
}) => {
  const caloriesLeft = Math.max(0, targetCalories - consumedCalories);
  const caloriePct = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  // Circular gauge SVG parameters (240 degree arc)
  const size = 118;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle of 240 degrees (2/3 of circle)
  const arcFraction = 0.72;
  const strokeDasharray = `${circumference * arcFraction} ${circumference}`;
  const strokeDashoffset = circumference * arcFraction * (1 - Math.min(1, consumedCalories / targetCalories));

  return (
    <div className="bg-[#B9B8F4] text-slate-900 rounded-3xl p-5 shadow-sm text-white">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Circular Arc Calorie Gauge */}
        <div className="relative flex flex-col items-center justify-center w-[120px] h-[120px] shrink-0">
          <svg
            className="w-[120px] h-[120px] -rotate-130 transform"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            {/* Active Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text inside Arc */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-1">
            <span className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm">
              {consumedCalories}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium mt-1">
              <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
              <span>{caloriesLeft} kcal left</span>
            </div>
          </div>
        </div>

        {/* Right: Macro Progress Bars */}
        <div className="flex-1 space-y-3 pl-2">
          {/* Proteins */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-semibold text-white/95 mb-1">
              <span>Proteins</span>
              <span className="text-white font-bold">{consumedProtein}/{targetProtein}g</span>
            </div>
            <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumedProtein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-semibold text-white/95 mb-1">
              <span>Carbs</span>
              <span className="text-white font-bold">{consumedCarbs}/{targetCarbs}g</span>
            </div>
            <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-200 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumedCarbs / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-semibold text-white/95 mb-1">
              <span>Fat</span>
              <span className="text-white font-bold">{consumedFat}/{targetFat}g</span>
            </div>
            <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-200 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumedFat / targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
