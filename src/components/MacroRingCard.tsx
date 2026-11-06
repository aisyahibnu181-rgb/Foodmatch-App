import React from 'react';

interface MacroRingCardProps {
  label: string;
  percentage: number;
  weightGrams: number;
  colorTheme: 'pink' | 'green' | 'orange';
}

export const MacroRingCard: React.FC<MacroRingCardProps> = ({
  label,
  percentage,
  weightGrams,
  colorTheme,
}) => {
  const themeConfig = {
    pink: {
      bg: 'bg-[#FDECEF]',
      stroke: '#F472B6',
      track: '#FBCFE8',
      textColor: 'text-rose-900',
    },
    green: {
      bg: 'bg-[#EBF9ED]',
      stroke: '#4ADE80',
      track: '#BBF7D0',
      textColor: 'text-emerald-900',
    },
    orange: {
      bg: 'bg-[#FFF3E8]',
      stroke: '#FB923C',
      track: '#FED7AA',
      textColor: 'text-orange-900',
    },
  }[colorTheme];

  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className={`flex-1 ${themeConfig.bg} rounded-2xl p-3 flex flex-col items-center justify-center min-w-[84px] shadow-xs`}>
      <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
        <svg className="w-16 h-16 -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={themeConfig.track}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={themeConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[12px] font-bold leading-none text-slate-800">
            {Math.round(percentage)}%
          </span>
          <span className="text-[9px] text-slate-500 font-medium mt-0.5 leading-none">
            {weightGrams}g
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-slate-700">
        {label}
      </span>
    </div>
  );
};
