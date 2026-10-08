import React, { useState } from 'react';
import {
  User,
  Shield,
  Coins,
  Flame,
  Clock,
  Swords,
  Award,
  Crown,
  Sparkles,
  ShoppingBag,
  BarChart2,
  Settings,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Check,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

type ProfileTab = 'character' | 'shop' | 'analytics' | 'achievements' | 'settings';

export const ProfileView: React.FC = () => {
  const {
    profile,
    subjects,
    achievements,
    shopItems,
    dailyActivities,
    buyShopItem,
    equipShopItem,
    updateProfile,
    resetAllProgress,
  } = useGame();

  const [activeTab, setActiveTab] = useState<ProfileTab>('character');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [shopCategory, setShopCategory] = useState<'all' | 'frame' | 'avatar' | 'title' | 'theme'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [shopNotice, setShopNotice] = useState<string | null>(null);

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.nextLevelXp) * 100));

  const handleSaveName = () => {
    sounds.playClick();
    if (editedName.trim()) {
      updateProfile({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleBuy = (itemId: string) => {
    const success = buyShopItem(itemId);
    if (!success) {
      setShopNotice('Insufficient gold coins! Channel more focus study time to earn coins.');
      setTimeout(() => setShopNotice(null), 3500);
    } else {
      setShopNotice('Item acquired and equipped to your scholar!');
      setTimeout(() => setShopNotice(null), 3500);
    }
  };

  const handleEquip = (itemId: string) => {
    sounds.playClick();
    equipShopItem(itemId);
  };

  const filteredShopItems = shopItems.filter((i) => {
    if (shopCategory === 'all') return true;
    return i.type === shopCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header and Profile Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
            Character Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            View academic stats, equip cosmetic armory, inspect achievements, and configure settings.
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'character', label: 'Character Sheet', icon: Shield },
            { id: 'shop', label: 'Armory Shop', icon: ShoppingBag },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. CHARACTER SHEET TAB */}
      {activeTab === 'character' && (
        <div className="space-y-6">
          {/* Main Character Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
              {/* Big Avatar */}
              <div
                className={`w-28 h-28 rounded-3xl bg-slate-850 flex items-center justify-center text-5xl shadow-2xl border ${
                  profile.frame === 'frame-gold'
                    ? 'border-amber-400 ring-4 ring-amber-400/30'
                    : profile.frame === 'frame-neon'
                    ? 'border-cyan-400 ring-4 ring-cyan-400/30'
                    : profile.frame === 'frame-emerald'
                    ? 'border-emerald-400 ring-4 ring-emerald-400/30'
                    : 'border-purple-400 ring-4 ring-purple-400/30'
                }`}
              >
                {profile.avatar === 'mage' && '🧙‍♂️'}
                {profile.avatar === 'paladin' && '🛡️'}
                {profile.avatar === 'alchemist' && '🧪'}
                {profile.avatar === 'rogue' && '📜'}
                {profile.avatar !== 'mage' && profile.avatar !== 'paladin' && profile.avatar !== 'alchemist' && profile.avatar !== 'rogue' && '🎓'}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {!isEditingName ? (
                    <div className="flex items-center gap-2">
                      <h3 className="font-rpg text-2xl sm:text-3xl font-black text-white">
                        {profile.name}
                      </h3>
                      <button
                        onClick={() => {
                          setEditedName(profile.name);
                          setIsEditingName(true);
                        }}
                        className="text-xs text-slate-500 hover:text-amber-400 underline font-sans"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-base font-bold"
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                    LEVEL {profile.level}
                  </span>
                </div>

                <p className="text-sm font-semibold text-amber-400 font-rpg">{profile.title}</p>

                {/* Currency & Streak */}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-amber-300">
                    <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{profile.coins} Gold</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-rose-400">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{profile.streak} Days (Best: {profile.bestStreak}d)</span>
                  </div>
                </div>

                {/* Level XP Bar */}
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Level Progress</span>
                    <span className="text-amber-300">
                      {profile.currentXp} / {profile.nextLevelXp} XP
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 p-0.5 ring-1 ring-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 15. STREAK PROGRESS CARD */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h4 className="font-rpg text-base font-bold text-slate-100">
                  {profile.streak} Days Study Streak
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Meaningful study (≥10 min) fuels your flame
              </span>
            </div>

            {/* 7-Day interactive circles */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {dailyActivities.map((day, idx) => {
                const isToday = idx === 6;
                return (
                  <div
                    key={day.dayName}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      day.hasStreakPoint
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        : isToday
                        ? 'bg-slate-800 border-amber-400/50 text-amber-300 animate-pulse'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block mb-1">
                      {day.dayName}
                    </span>
                    <div className="text-lg">
                      {day.hasStreakPoint ? (
                        '🔥'
                      ) : isToday ? (
                        '⚡'
                      ) : (
                        '○'
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1">
                      {day.studiedMinutes}m
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-400 pt-1">
              "Every day of dedicated focus compounds like interest in the academic vault."
            </p>
          </div>

          {/* Career Milestones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Total Study Time</span>
              <span className="text-xl font-bold font-mono text-white">
                {Math.floor(profile.totalStudyMinutes / 60)}h {profile.totalStudyMinutes % 60}m
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Quizzes Finished</span>
              <span className="text-xl font-bold font-mono text-purple-300">
                {profile.quizzesTakenCount} Trials
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Bosses Defeated</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {profile.bossesDefeatedCount} Bosses
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Chapters Mastered</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {profile.chaptersMasteredCount} Chapters
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ARMORY SHOP (COSMETIC SHOP) */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="font-rpg text-lg font-bold text-amber-400">Academic Armory</h3>
              <p className="text-xs text-slate-400">
                Spend gold earned from studying on prestige frames, titles, and avatar styles. 100% cosmetic!
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono font-bold text-amber-300 self-start sm:self-auto">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{profile.coins} Gold Available</span>
            </div>
          </div>

          {shopNotice && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs text-center font-medium animate-in fade-in">
              {shopNotice}
            </div>
          )}

          {/* Shop categories */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'frame', label: 'Frames' },
              { id: 'avatar', label: 'Avatars' },
              { id: 'title', label: 'Titles' },
              { id: 'theme', label: 'Themes' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setShopCategory(cat.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  shopCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Shop Item Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredShopItems.map((item) => {
              const isUnlocked = item.isUnlocked;
              const isEquipped = item.isEquipped;
              const canAfford = profile.coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/10'
                      : isUnlocked
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                      {item.type === 'avatar' ? (
                        item.preview
                      ) : item.type === 'frame' ? (
                        <div className={`w-10 h-10 rounded-xl ${item.preview} flex items-center justify-center`}>
                          ✨
                        </div>
                      ) : (
                        <Crown className="w-7 h-7 text-amber-400" />
                      )}
                    </div>

                    <div className="text-center">
                      <h4 className="font-rpg text-sm font-bold text-slate-100">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      {isUnlocked ? (
                        <span className="text-emerald-400">Unlocked</span>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5 fill-amber-400" /> {item.price}
                        </>
                      )}
                    </div>

                    {isEquipped ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                        Equipped
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item.id)}
                        className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => handleBuy(item.id)}
                        className="px-3.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-[11px] uppercase tracking-wider"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PROGRESS ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-rpg text-lg font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" /> Study Time This Week
            </h3>

            {/* Simple Bar Chart */}
            <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 pb-2 px-2 border-b border-slate-800">
              {dailyActivities.map((day) => {
                const maxMins = 80;
                const barHeight = Math.min(100, Math.round((day.studiedMinutes / maxMins) * 100));
                return (
                  <div key={day.dayName} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400">{day.studiedMinutes}m</span>
                    <div className="w-full max-w-[32px] bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-amber-400 rounded-t-lg transition-all duration-700"
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 font-bold">{day.dayName}</span>
                  </div>
                );
              })}
            </div>

            {/* Subject Mastery Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="font-rpg text-sm font-bold text-slate-200">Subject Mastery Distribution</h4>
              <div className="space-y-2.5">
                {subjects.map((sub) => {
                  const completed = sub.chapters.filter((c) => c.status === 'completed' || c.status === 'mastered').length;
                  const pct = Math.round((completed / sub.chapters.length) * 100);
                  return (
                    <div key={sub.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <span>{sub.icon}</span> {sub.name}
                        </span>
                        <span className="font-mono text-amber-400">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-rpg text-lg font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Scholarly Achievements
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 sm:p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                  ach.isUnlocked
                    ? 'bg-slate-900 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    ach.isUnlocked
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  {ach.isUnlocked ? ach.icon : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-rpg text-sm font-bold text-slate-100 truncate">
                      {ach.title}
                    </h4>
                    {ach.isUnlocked && (
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ach.unlockedAt || 'Unlocked'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-rpg text-lg font-bold text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Platform Settings
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-200 block">Procedural Audio Effects</span>
                <span className="text-xs text-slate-400">Level up fanfares, coin chimes, and combat hits</span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  updateProfile({ soundEffectsEnabled: !profile.soundEffectsEnabled });
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  profile.soundEffectsEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {profile.soundEffectsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Reminders Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-200 block">Smart Study Reminders</span>
                <span className="text-xs text-slate-400">Notifications about expiring quests and boss deadlines</span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  updateProfile({ remindersEnabled: !profile.remindersEnabled });
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  profile.remindersEnabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>

            {/* Daily Study Goal */}
            <div className="py-3 border-b border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-200">Daily Study Target</span>
                <span className="text-xs font-mono text-amber-400 font-bold">{profile.dailyGoalMinutes} min / day</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={profile.dailyGoalMinutes}
                onChange={(e) => updateProfile({ dailyGoalMinutes: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Reset Progress Section */}
            <div className="pt-4 space-y-3">
              <span className="text-sm font-bold text-rose-400 block">Reset Progress</span>
              <p className="text-xs text-slate-400">
                Restore character level, chapters, and quests to initial demo baseline.
              </p>

              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-slate-700 text-xs font-bold transition-colors"
                >
                  Reset Progress to Baseline
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-3">
                  <p className="text-xs text-rose-200 font-semibold">
                    Are you sure? This will reset all current session data to initial demo state.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        resetAllProgress();
                        setShowResetConfirm(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
