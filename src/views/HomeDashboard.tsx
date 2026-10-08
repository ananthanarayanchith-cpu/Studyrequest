import React from 'react';
import {
  Flame,
  Coins,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Swords,
  CheckCircle2,
  Brain,
  Compass,
  AlertCircle,
  Play,
  Award,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

export const HomeDashboard: React.FC = () => {
  const {
    profile,
    subjects,
    quests,
    bosses,
    dailyActivities,
    openStudyTimer,
    openQuestMaster,
    setActiveView,
    setSelectedSubjectId,
    setSelectedChapterId,
    claimQuestReward,
  } = useGame();

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.nextLevelXp) * 100));

  // Today's Quest
  const todaysQuest = quests.find((q) => q.type === 'daily' && !q.isClaimed) || quests[0];

  // Continue Journey Chapter
  // Find physics chapter 2 (Laws of motion) or latest available chapter
  const physicsSubject = subjects.find((s) => s.id === 'physics') || subjects[0];
  const continueChapter = physicsSubject.chapters.find((c) => c.status === 'available') || physicsSubject.chapters[0];

  // Upcoming Boss Battle (Chemistry Boss)
  const chemistryBoss = bosses.find((b) => b.subjectId === 'chemistry') || bosses[0];

  // Daily statistics for Sunday / today
  const todayActivity = dailyActivities[6] || { studiedMinutes: 25, completedQuests: 1 };

  // Smart Study Recommendation computation
  const nextBestMove = {
    title: 'Review Newton’s Laws of Motion',
    subject: 'Physics',
    subjectId: 'physics' as const,
    chapterId: 'phys-2',
    duration: '25 min focus',
    reason: `Your quiz accuracy on Laws of Motion was 54% and your Kinematics exam is in 3 days.`,
    reward: '+100 XP & +20 Coins',
  };

  const handleStartTodaysQuest = () => {
    sounds.playClick();
    if (todaysQuest.isCompleted && !todaysQuest.isClaimed) {
      claimQuestReward(todaysQuest.id);
    } else {
      openStudyTimer(todaysQuest.subjectId || 'physics');
    }
  };

  const handleContinueJourney = () => {
    sounds.playClick();
    openStudyTimer(physicsSubject.id, continueChapter.id);
  };

  const handlePrepareBoss = () => {
    sounds.playClick();
    setSelectedSubjectId('chemistry');
    setSelectedChapterId('chem-2');
    setActiveView('arena');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP RPG STATUS HUD */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl p-5 sm:p-7">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Character Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 flex items-center justify-center text-3xl sm:text-4xl shadow-xl border ${
                profile.frame === 'frame-gold'
                  ? 'border-amber-400 ring-4 ring-amber-400/20'
                  : profile.frame === 'frame-neon'
                  ? 'border-cyan-400 ring-4 ring-cyan-400/20'
                  : 'border-slate-700'
              }`}
            >
              {profile.avatar === 'mage' && '🧙‍♂️'}
              {profile.avatar === 'paladin' && '🛡️'}
              {profile.avatar === 'alchemist' && '🧪'}
              {profile.avatar === 'rogue' && '📜'}
              {profile.avatar !== 'mage' && profile.avatar !== 'paladin' && profile.avatar !== 'alchemist' && profile.avatar !== 'rogue' && '🎓'}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                  LVL {profile.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-400/90 font-medium">{profile.title}</p>

              {/* Badges bar */}
              <div className="flex items-center gap-3 sm:gap-4 mt-2">
                {/* Coins */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-mono font-bold text-amber-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{profile.coins}</span>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-mono font-bold text-rose-400">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{profile.streak} Day Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full md:w-72 lg:w-80 bg-slate-800/70 rounded-2xl p-4 border border-slate-700/70">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mana & XP
              </span>
              <span className="font-bold text-amber-300">
                {profile.currentXp} / {profile.nextLevelXp} XP
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 ring-1 ring-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
              <span>Level {profile.level}</span>
              <span>{profile.nextLevelXp - profile.currentXp} XP to Level {profile.level + 1}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TODAY'S QUEST & SMART RECOMMENDATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Today's Active Quest */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
                  Today's Quest
                </span>
                <span className="text-xs text-slate-400">{todaysQuest.deadlineText}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                <Coins className="w-3.5 h-3.5 fill-amber-400" />
                +{todaysQuest.coinReward}
              </div>
            </div>

            <h3 className="font-rpg text-lg sm:text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              {todaysQuest.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {todaysQuest.description}
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Progress</span>
                <span className="text-amber-400 font-bold">
                  {todaysQuest.currentProgress} / {todaysQuest.targetProgress} {todaysQuest.unit}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((todaysQuest.currentProgress / todaysQuest.targetProgress) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">
              Reward:{' '}
              <span className="text-amber-400 font-bold">+{todaysQuest.xpReward} XP</span>
            </div>

            <button
              onClick={handleStartTodaysQuest}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                todaysQuest.isCompleted && !todaysQuest.isClaimed
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              {todaysQuest.isCompleted && !todaysQuest.isClaimed ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Claim Bounty</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Quest</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 12. Smart Study Recommendations: "Your Next Best Move" */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 p-5 sm:p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Your Next Best Move
              </span>
              <span className="text-xs text-slate-400 font-mono">{nextBestMove.duration}</span>
            </div>

            <h3 className="font-rpg text-lg sm:text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {nextBestMove.title}
            </h3>

            <div className="mt-2.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300">Strategic Reason:</strong> {nextBestMove.reason}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800/80">
            <span className="text-xs font-mono text-amber-400 font-bold">{nextBestMove.reward}</span>

            <button
              onClick={() => {
                sounds.playClick();
                openStudyTimer(nextBestMove.subjectId, nextBestMove.chapterId);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <span>Launch Focus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DAILY PROGRESS STATS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-rpg text-base sm:text-lg font-bold text-slate-200">
            Today's Academic Progress
          </h3>
          <span className="text-xs text-slate-400 font-mono">Target: {profile.dailyGoalMinutes}m / day</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Study Time Today */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase font-mono">Study Time Today</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white">
                {todayActivity.studiedMinutes} min
              </span>
            </div>
          </div>

          {/* Card 2: Quests Completed */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase font-mono">Quests Claimed</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white">
                {profile.questsCompletedCount} Total
              </span>
            </div>
          </div>

          {/* Card 3: XP Earned */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase font-mono">Current Level</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                Level {profile.level}
              </span>
            </div>
          </div>

          {/* Card 4: Avg Quiz Score */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase font-mono">Quiz Mastery</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-purple-300">
                {profile.averageQuizScore}% Avg
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTINUE YOUR JOURNEY & UPCOMING BOSS BATTLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Continue Your Journey */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" /> Continue Your Journey
              </span>
              <span className="text-xs text-blue-400 font-mono">{physicsSubject.name} Realm</span>
            </div>

            <h3 className="font-rpg text-lg sm:text-xl font-bold text-slate-100">
              {continueChapter.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
              {continueChapter.description}
            </p>

            {/* Chapter Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Chapter Completion</span>
                <span className="text-blue-400 font-bold">{continueChapter.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full"
                  style={{ width: `${continueChapter.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">
              Reward: +{continueChapter.xpReward} XP
            </span>

            <button
              onClick={handleContinueJourney}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Boss Battle */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 hover:border-rose-500/40 p-5 sm:p-6 shadow-lg flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-rose-400" /> Upcoming Boss Battle
              </span>
              <span className="text-xs text-rose-400 font-mono font-bold">Tomorrow</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl">{chemistryBoss.avatarIcon}</span>
              <div>
                <h3 className="font-rpg text-lg sm:text-xl font-bold text-slate-100">
                  {chemistryBoss.name}
                </h3>
                <p className="text-xs text-slate-400">{chemistryBoss.chapterName} • 12 Questions Trial</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Required passing score: <strong className="text-amber-400 font-mono">{chemistryBoss.requiredScorePercent}%</strong> to defeat the golem, unlock the Mastered crown, and claim +{chemistryBoss.xpReward} XP!
            </p>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800/80">
            <span className="text-xs font-mono text-amber-400 font-bold">
              +{chemistryBoss.xpReward} XP • +{chemistryBoss.coinReward} Coins
            </span>

            <button
              onClick={handlePrepareBoss}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Prepare & Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
