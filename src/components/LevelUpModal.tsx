import React from 'react';
import { Crown, Sparkles, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

export const LevelUpModal: React.FC = () => {
  const { isLevelUpModalOpen, levelUpData, closeLevelUpModal, triggerConfettiEffect } = useGame();

  if (!isLevelUpModalOpen || !levelUpData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background decorative radiant glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Level Icon */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping opacity-50" />
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-500/40 border-2 border-amber-300 rotate-3 transform hover:rotate-0 transition-transform">
            <Crown className="w-12 h-12 text-slate-950 fill-amber-200" />
          </div>
          <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-amber-300 font-mono text-xs font-black shadow-md">
            LEVEL {levelUpData.newLevel}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-rpg text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 tracking-wider mb-2">
          LEVEL UP!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Your scholarly dedication has expanded your mana and elevated your standing across the realms.
        </p>

        {/* Stat Upgrades Card */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Academic Rank
            </span>
            <span className="text-sm font-bold text-amber-300 font-rpg">
              {levelUpData.rank}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-amber-400" /> Bounty Reward
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1">
              +{levelUpData.bonusCoins} Coins
            </span>
          </div>

          <div className="pt-1">
            <span className="text-xs text-slate-400 block mb-1.5 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Realm Unlocks:
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              {levelUpData.unlocks.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerConfettiEffect();
            closeLevelUpModal();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
        >
          <span>Claim Glory & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
