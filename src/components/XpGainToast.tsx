import React from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const XpGainToast: React.FC = () => {
  const { xpGainToasts } = useGame();

  if (xpGainToasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2 pointer-events-none">
      {xpGainToasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-xl shadow-amber-500/10 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {toast.xp > 0 && (
                <span className="font-mono font-black text-amber-400 text-sm">
                  +{toast.xp} XP
                </span>
              )}
              {toast.coins > 0 && (
                <span className="font-mono font-bold text-yellow-300 text-xs flex items-center gap-0.5">
                  <Coins className="w-3 h-3 fill-yellow-400" />
                  +{toast.coins}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-medium">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
