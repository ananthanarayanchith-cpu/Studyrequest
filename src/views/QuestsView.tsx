import React, { useState } from 'react';
import {
  Swords,
  Flame,
  Zap,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Coins,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Quest, QuestType } from '../types/game';
import { sounds } from '../utils/audio';

export const QuestsView: React.FC = () => {
  const { quests, claimQuestReward, openStudyTimer, setActiveView } = useGame();
  const [activeTab, setActiveTab] = useState<'all' | QuestType>('all');

  const filteredQuests = quests.filter((q) => {
    if (activeTab === 'all') return true;
    return q.type === activeTab;
  });

  const dailyCount = quests.filter((q) => q.type === 'daily').length;
  const weeklyCount = quests.filter((q) => q.type === 'weekly').length;
  const specialCount = quests.filter((q) => q.type === 'special').length;
  const claimableCount = quests.filter((q) => q.isCompleted && !q.isClaimed).length;

  const handleClaim = (questId: string) => {
    claimQuestReward(questId);
  };

  const handleAction = (quest: Quest) => {
    sounds.playClick();
    if (quest.unit === 'min' || quest.unit === 'formulas') {
      openStudyTimer(quest.subjectId || 'physics');
    } else if (quest.unit === 'questions' || quest.unit === 'quizzes' || quest.unit === 'boss') {
      setActiveView('arena');
    } else {
      openStudyTimer();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
              Quest Board
            </h2>
            {claimableCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-xs font-black animate-pulse">
                {claimableCount} CLAIMABLE!
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Fulfill daily study trials, weekly campaigns, and epic milestones to reap massive XP and gold.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Quests', count: quests.length },
            { id: 'daily', label: 'Daily', count: dailyCount },
            { id: 'weekly', label: 'Weekly', count: weeklyCount },
            { id: 'special', label: 'Special', count: specialCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredQuests.map((quest) => {
          const isCompleted = quest.isCompleted;
          const isClaimed = quest.isClaimed;
          const progressPercent = Math.min(
            100,
            Math.round((quest.currentProgress / quest.targetProgress) * 100)
          );

          return (
            <div
              key={quest.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isClaimed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : isCompleted
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div>
                {/* Header Tag & Deadline */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      quest.type === 'daily'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : quest.type === 'weekly'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {quest.type} Quest
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {quest.deadlineText}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-rpg text-base sm:text-lg font-bold text-slate-100">
                  {quest.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {quest.description}
                </p>

                {/* Progress Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Progress</span>
                    <span className={isCompleted ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {quest.currentProgress} / {quest.targetProgress} {quest.unit}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-750">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-r from-indigo-500 to-blue-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bounty Rewards & Action CTA */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="text-amber-400">+{quest.xpReward} XP</span>
                  <span className="text-yellow-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 fill-yellow-400" /> +{quest.coinReward}
                  </span>
                </div>

                {isClaimed ? (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Claimed
                  </span>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Claim Reward</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(quest)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
