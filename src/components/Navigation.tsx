import React from 'react';
import {
  Home,
  Compass,
  Swords,
  BookOpen,
  Brain,
  User,
  Clock,
  Sparkles,
  Flame,
  Coins,
  Shield,
  Bell,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

interface NavigationProps {
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenNotifications, unreadCount }) => {
  const {
    activeView,
    setActiveView,
    profile,
    openStudyTimer,
    openQuestMaster,
    quests,
  } = useGame();

  const claimableQuestsCount = quests.filter((q) => q.isCompleted && !q.isClaimed).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: 0 },
    { id: 'world', label: 'Study World', icon: Compass, badge: 0 },
    { id: 'quests', label: 'Quests', icon: Swords, badge: claimableQuestsCount },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: 0 },
    { id: 'arena', label: 'Quiz Arena', icon: Brain, badge: 1 }, // 1 indicates Boss ready
    { id: 'profile', label: 'Profile', icon: User, badge: 0 },
  ] as const;

  const handleNavClick = (viewId: typeof activeView) => {
    sounds.playClick();
    setActiveView(viewId);
  };

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.nextLevelXp) * 100));

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900/90 border-r border-slate-800 backdrop-blur-md h-screen sticky top-0 z-30 select-none">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50">
              <Shield className="w-6 h-6 text-slate-950 fill-amber-300" />
            </div>
            <div>
              <h1 className="font-rpg text-lg font-black tracking-wider text-amber-400 leading-tight">
                STUDY<span className="text-slate-100">QUEST</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Academic RPG
              </p>
            </div>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Character Mini HUD in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border ${
                profile.frame === 'frame-gold'
                  ? 'border-amber-400 ring-2 ring-amber-400/30'
                  : profile.frame === 'frame-neon'
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                  : 'border-slate-600'
              }`}
            >
              {profile.avatar === 'mage' && '🧙‍♂️'}
              {profile.avatar === 'paladin' && '🛡️'}
              {profile.avatar === 'alchemist' && '🧪'}
              {profile.avatar === 'rogue' && '📜'}
              {profile.avatar !== 'mage' && profile.avatar !== 'paladin' && profile.avatar !== 'alchemist' && profile.avatar !== 'rogue' && '🎓'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm truncate">{profile.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  LVL {profile.level}
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 truncate font-medium">{profile.title}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-amber-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {profile.coins}
                </span>
                <span className="flex items-center gap-1 font-mono text-rose-400">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  {profile.streak}d
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>XP Progress</span>
              <span className="text-amber-400">
                {profile.currentXp} / {profile.nextLevelXp}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden ring-1 ring-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.id === 'quests'
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-rose-500/80 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons: Study Timer & Quest Master */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              sounds.playClick();
              openStudyTimer();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Launch Study Timer</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              openQuestMaster();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-slate-300 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Consult Quest Master</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5" onClick={() => handleNavClick('home')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-slate-950 fill-amber-300" />
          </div>
          <span className="font-rpg text-base font-black text-amber-400">STUDYQUEST</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Badge */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
            LVL {profile.level}
          </span>

          {/* Quick Study Timer button */}
          <button
            onClick={() => {
              sounds.playClick();
              openStudyTimer();
            }}
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            title="Focus Timer"
            aria-label="Focus Timer"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Quest Master AI button */}
          <button
            onClick={() => {
              sounds.playClick();
              openQuestMaster();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Quest Master"
            aria-label="Quest Master"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-slate-800 text-slate-300 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg z-30 px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-115 text-amber-400' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 bg-amber-400 rounded-full mt-0.5 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
