import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  titleBarBg?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, titleBarBg = 'bg-transparent' }) => {
  return (
    <div className="relative w-full max-w-[390px] h-[780px] bg-white rounded-[46px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/10 border-[9px] border-slate-900 overflow-hidden flex flex-col mx-auto select-none">
      {/* Top Status Bar & Dynamic Island */}
      <div className={`relative px-7 pt-3 pb-1 z-30 flex items-center justify-between text-slate-900 ${titleBarBg}`}>
        <span className="text-[12px] font-bold tracking-tight">9:41</span>

        {/* Dynamic Island Pill */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-5 bg-black rounded-full flex items-center justify-end pr-2 gap-1.5 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
        </div>

        <div className="flex items-center gap-1.5 text-slate-800">
          <span className="text-[10px] font-bold">5G</span>
          <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
          <Battery className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Screen Viewport */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </div>

      {/* Bottom iOS Home Indicator Pill */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full pointer-events-none z-50" />
    </div>
  );
};
