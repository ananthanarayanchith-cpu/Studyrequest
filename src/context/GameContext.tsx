import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  Subject,
  SubjectId,
  Quest,
  Boss,
  Achievement,
  ShopItem,
  DailyActivityDay,
  AppNotification,
  StudySessionLog,
} from '../types/game';
import {
  INITIAL_PROFILE,
  INITIAL_SUBJECTS,
  INITIAL_QUESTS,
  INITIAL_BOSSES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SHOP_ITEMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DAYS_ACTIVITY,
} from '../data/initialData';
import { sounds } from '../utils/audio';

interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  rank: string;
  bonusCoins: number;
  unlocks: string[];
}

interface XpToastItem {
  id: string;
  xp: number;
  coins: number;
  message: string;
}

interface GameContextType {
  profile: StudentProfile;
  subjects: Subject[];
  quests: Quest[];
  bosses: Boss[];
  achievements: Achievement[];
  shopItems: ShopItem[];
  dailyActivities: DailyActivityDay[];
  notifications: AppNotification[];
  studyLogs: StudySessionLog[];
  activeView: 'home' | 'world' | 'quests' | 'subjects' | 'arena' | 'profile';
  selectedSubjectId: SubjectId | null;
  selectedChapterId: string | null;
  isStudyTimerOpen: boolean;
  studyTimerSubjectId: SubjectId;
  studyTimerChapterId: string;
  isQuestMasterOpen: boolean;
  isLevelUpModalOpen: boolean;
  levelUpData: LevelUpInfo | null;
  xpGainToasts: XpToastItem[];
  isOnboardingOpen: boolean;

  // Actions
  setActiveView: (view: 'home' | 'world' | 'quests' | 'subjects' | 'arena' | 'profile') => void;
  setSelectedSubjectId: (id: SubjectId | null) => void;
  setSelectedChapterId: (id: string | null) => void;
  openStudyTimer: (subjectId?: SubjectId, chapterId?: string) => void;
  closeStudyTimer: () => void;
  openQuestMaster: () => void;
  closeQuestMaster: () => void;
  closeLevelUpModal: () => void;
  setIsOnboardingOpen: (open: boolean) => void;

  addXpAndCoins: (xp: number, coins: number, message?: string) => void;
  completeStudySession: (subjectId: SubjectId, chapterId: string, minutes: number) => { xp: number; coins: number };
  claimQuestReward: (questId: string) => void;
  completeQuiz: (subjectId: SubjectId, chapterId: string | undefined, scorePercent: number, totalQuestions: number, weakTopicsFound: string[]) => { xp: number; coins: number };
  defeatBoss: (bossId: string, scorePercent: number) => void;
  surviveBoss: (bossId: string, scorePercent: number) => void;
  buyShopItem: (itemId: string) => boolean;
  equipShopItem: (itemId: string) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  markNotificationRead: (id: string) => void;
  clearNotification: (id: string) => void;
  resetAllProgress: () => void;
  triggerConfettiEffect: () => void;
}

const STORAGE_KEY = 'studyquest_rpg_state_v1';

export const GameContext = createContext<GameContextType | undefined>(undefined);

function getRankForLevel(level: number): string {
  if (level <= 2) return 'Novice Scribe';
  if (level <= 4) return 'Apprentice Scholar';
  if (level <= 6) return 'Rune Adept';
  if (level <= 9) return 'Sage in Training';
  if (level <= 12) return 'Grand Chronicler';
  if (level <= 16) return 'Archmage of Academia';
  return 'Legendary Luminary';
}

function getNextLevelXpRequirement(level: number): number {
  // Scaling curve: Level 1 requires 500, Level 7 requires 1000, Level 10 requires ~1450
  return Math.round(350 * Math.pow(level, 1.25) + 200);
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROFILE;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUBJECTS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_QUESTS;
  });

  const [bosses, setBosses] = useState<Boss[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bosses`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BOSSES;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_achievements`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shop`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SHOP_ITEMS;
  });

  const [dailyActivities, setDailyActivities] = useState<DailyActivityDay[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DAYS_ACTIVITY;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_studylogs`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Navigation and UI state
  const [activeView, setActiveView] = useState<'home' | 'world' | 'quests' | 'subjects' | 'arena' | 'profile'>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Modals & Panels
  const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);
  const [studyTimerSubjectId, setStudyTimerSubjectId] = useState<SubjectId>('physics');
  const [studyTimerChapterId, setStudyTimerChapterId] = useState<string>('phys-2');
  const [isQuestMasterOpen, setIsQuestMasterOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpInfo | null>(null);
  const [xpGainToasts, setXpGainToasts] = useState<XpToastItem[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
      localStorage.setItem(`${STORAGE_KEY}_bosses`, JSON.stringify(bosses));
      localStorage.setItem(`${STORAGE_KEY}_achievements`, JSON.stringify(achievements));
      localStorage.setItem(`${STORAGE_KEY}_shop`, JSON.stringify(shopItems));
      localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(dailyActivities));
      localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_studylogs`, JSON.stringify(studyLogs));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [profile, subjects, quests, bosses, achievements, shopItems, dailyActivities, notifications, studyLogs]);

  // Check if first-time user visited
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`${STORAGE_KEY}_has_onboarded`);
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
      localStorage.setItem(`${STORAGE_KEY}_has_onboarded`, 'true');
    }
  }, []);

  const triggerConfettiEffect = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899'],
      });
    } catch {}
  };

  const showXpToast = (xp: number, coins: number, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setXpGainToasts((prev) => [...prev, { id, xp, coins, message }]);
    setTimeout(() => {
      setXpGainToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  };

  const unlockAchievement = (achId: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === achId && !a.isUnlocked) {
          showXpToast(100, 20, `Achievement Unlocked: ${a.title}!`);
          sounds.playQuestComplete();
          return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return a;
      })
    );
  };

  // Central XP and Coins addition logic
  const addXpAndCoins = (xp: number, coins: number, message: string = 'Progress Earned') => {
    if (xp > 0 && profile.soundEffectsEnabled) {
      sounds.playCoin();
    }
    showXpToast(xp, coins, message);

    setProfile((prev) => {
      let currentXp = prev.currentXp + xp;
      let level = prev.level;
      let nextLevelXp = prev.nextLevelXp;
      let newCoins = prev.coins + coins;
      let leveledUp = false;
      let oldLevel = prev.level;

      while (currentXp >= nextLevelXp) {
        currentXp -= nextLevelXp;
        level += 1;
        nextLevelXp = getNextLevelXpRequirement(level);
        leveledUp = true;
      }

      if (leveledUp) {
        const bonusCoins = 50 * (level - oldLevel);
        newCoins += bonusCoins;
        const newRank = getRankForLevel(level);

        setTimeout(() => {
          if (prev.soundEffectsEnabled) sounds.playLevelUp();
          triggerConfettiEffect();
          setLevelUpData({
            oldLevel,
            newLevel: level,
            rank: newRank,
            bonusCoins,
            unlocks: [`New Academic Title: ${newRank}`, `+${bonusCoins} Gold Coins`, 'New shop cosmetics in the Armory'],
          });
          setIsLevelUpModalOpen(true);
        }, 400);

        // Check level achievements
        if (level >= 10) {
          unlockAchievement('ach-5');
        }
      }

      return {
        ...prev,
        level,
        currentXp,
        nextLevelXp,
        coins: newCoins,
        title: getRankForLevel(level),
      };
    });

    // Check coin achievement
    if (profile.coins + coins >= 500) {
      unlockAchievement('ach-8');
    }
  };

  const openStudyTimer = (subjectId?: SubjectId, chapterId?: string) => {
    if (subjectId) setStudyTimerSubjectId(subjectId);
    if (chapterId) {
      setStudyTimerChapterId(chapterId);
    } else if (subjectId) {
      const sub = subjects.find((s) => s.id === subjectId);
      const ch = sub?.chapters.find((c) => c.status === 'available') || sub?.chapters[0];
      if (ch) setStudyTimerChapterId(ch.id);
    }
    setIsStudyTimerOpen(true);
  };

  const closeStudyTimer = () => {
    setIsStudyTimerOpen(false);
  };

  const openQuestMaster = () => {
    setIsQuestMasterOpen(true);
  };

  const closeQuestMaster = () => {
    setIsQuestMasterOpen(false);
  };

  const closeLevelUpModal = () => {
    setIsLevelUpModalOpen(false);
    setLevelUpData(null);
  };

  // Complete study session with anti-cheat scaled reward
  const completeStudySession = (subjectId: SubjectId, chapterId: string, minutes: number) => {
    // Prevent zero/instant farming: must study at least 1 minute
    const validMinutes = Math.max(1, minutes);

    // XP calculation:
    // ~1 min = 10 XP
    // 25 min = 100 XP
    // 45 min = 180 XP
    // 60 min = 250 XP
    let xpAward = Math.round(validMinutes * 4);
    if (validMinutes >= 25 && validMinutes < 45) xpAward = 100;
    else if (validMinutes >= 45 && validMinutes < 60) xpAward = 180;
    else if (validMinutes >= 60) xpAward = 250;

    const coinAward = Math.round(xpAward * 0.2);

    // Log study session
    const targetSubject = subjects.find((s) => s.id === subjectId);
    const targetChapter = targetSubject?.chapters.find((c) => c.id === chapterId);

    const log: StudySessionLog = {
      id: Date.now().toString(),
      subjectId,
      chapterId,
      chapterTitle: targetChapter?.title || 'Chapter Study',
      minutes: validMinutes,
      xpEarned: xpAward,
      coinsEarned: coinAward,
      timestamp: new Date().toISOString(),
    };
    setStudyLogs((prev) => [log, ...prev]);

    // Update profile total study minutes
    setProfile((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + validMinutes,
    }));

    // Unlock First Step achievement
    unlockAchievement('ach-1');
    if (profile.totalStudyMinutes + validMinutes >= 600) {
      unlockAchievement('ach-4'); // Bookworm 10 hours
    }
    if (validMinutes >= 60) {
      unlockAchievement('ach-10'); // Iron Will
    }

    // Update chapter progress
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          chapters: sub.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch;
            const newProgress = Math.min(100, ch.progressPercent + (validMinutes >= 25 ? 20 : 10));
            const newStatus = newProgress >= 100 ? (ch.masteryStars >= 5 ? 'mastered' : 'completed') : ch.status;
            return {
              ...ch,
              progressPercent: newProgress,
              status: newStatus,
              lastStudiedDate: 'Just now',
            };
          }),
        };
      })
    );

    // Update daily activity and streak
    setDailyActivities((prev) => {
      const todayIndex = 6; // Sunday/Current day in demo
      return prev.map((day, idx) => {
        if (idx === todayIndex) {
          return {
            ...day,
            studiedMinutes: day.studiedMinutes + validMinutes,
            hasStreakPoint: true,
          };
        }
        return day;
      });
    });

    // Update relevant quests
    setQuests((prev) =>
      prev.map((q) => {
        if (q.isCompleted) return q;

        // Daily physics or math study quests
        if (q.type === 'daily' && q.subjectId === subjectId && q.unit === 'min') {
          const nextVal = Math.min(q.targetProgress, q.currentProgress + validMinutes);
          return {
            ...q,
            currentProgress: nextVal,
            isCompleted: nextVal >= q.targetProgress,
          };
        }
        return q;
      })
    );

    // Give rewards
    addXpAndCoins(xpAward, coinAward, `Completed ${validMinutes}m Focus Session on ${targetChapter?.title || 'Study'}`);

    return { xp: xpAward, coins: coinAward };
  };

  const claimQuestReward = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || !q.isCompleted || q.isClaimed) return;

    if (profile.soundEffectsEnabled) {
      sounds.playQuestComplete();
    }
    triggerConfettiEffect();

    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, isClaimed: true } : item))
    );

    setProfile((prev) => ({
      ...prev,
      questsCompletedCount: prev.questsCompletedCount + 1,
    }));

    addXpAndCoins(q.xpReward, q.coinReward, `Quest Claimed: ${q.title}!`);

    // Check No Excuses achievement
    const dailyQuests = quests.filter((item) => item.type === 'daily');
    const allDailyClaimed = dailyQuests.every((item) => item.id === questId || item.isClaimed);
    if (allDailyClaimed) {
      unlockAchievement('ach-7');
    }
  };

  const completeQuiz = (
    subjectId: SubjectId,
    chapterId: string | undefined,
    scorePercent: number,
    totalQuestions: number,
    weakTopicsFound: string[]
  ) => {
    // XP reward scales with performance
    const baseQuizXp = 150;
    const performanceBonus = Math.round((scorePercent / 100) * 100);
    const xp = baseQuizXp + performanceBonus;
    const coins = Math.round(xp * 0.2);

    setProfile((prev) => {
      const newCount = prev.quizzesTakenCount + 1;
      const newAvg = Math.round((prev.averageQuizScore * prev.quizzesTakenCount + scorePercent) / newCount);
      const updatedWeak = Array.from(new Set([...weakTopicsFound, ...prev.weakTopics])).slice(0, 4);

      return {
        ...prev,
        quizzesTakenCount: newCount,
        averageQuizScore: newAvg,
        weakTopics: updatedWeak,
      };
    });

    // Update chapter quiz score if applicable
    if (chapterId) {
      setSubjects((prev) =>
        prev.map((sub) => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            chapters: sub.chapters.map((ch) => {
              if (ch.id !== chapterId) return ch;
              const bestScore = Math.max(ch.bestQuizScore || 0, scorePercent);
              const stars = scorePercent >= 95 ? 5 : scorePercent >= 80 ? 4 : scorePercent >= 60 ? 3 : 2;
              return {
                ...ch,
                bestQuizScore: bestScore,
                masteryStars: Math.max(ch.masteryStars, stars),
                status: stars >= 5 ? 'mastered' : ch.status === 'locked' ? 'available' : ch.status,
              };
            }),
          };
        })
      );
    }

    // Update quest progress for questions answered
    setQuests((prev) =>
      prev.map((q) => {
        if (q.isCompleted) return q;
        if (q.type === 'daily' && q.subjectId === subjectId && q.unit === 'questions') {
          const nextVal = Math.min(q.targetProgress, q.currentProgress + totalQuestions);
          return { ...q, currentProgress: nextVal, isCompleted: nextVal >= q.targetProgress };
        }
        if (q.type === 'weekly' && q.unit === 'quizzes' && scorePercent >= 70) {
          const nextVal = Math.min(q.targetProgress, q.currentProgress + 1);
          return { ...q, currentProgress: nextVal, isCompleted: nextVal >= q.targetProgress };
        }
        return q;
      })
    );

    // Achievements check
    if (scorePercent >= 90) {
      unlockAchievement('ach-5'); // Brain Power
    }

    addXpAndCoins(xp, coins, `Quiz Complete: ${scorePercent}% Accuracy!`);
    return { xp, coins };
  };

  const defeatBoss = (bossId: string, scorePercent: number) => {
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) return;

    if (profile.soundEffectsEnabled) {
      sounds.playBossDefeat();
    }
    triggerConfettiEffect();

    // Mark chapter as Mastered
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== boss.subjectId) return sub;
        return {
          ...sub,
          chapters: sub.chapters.map((ch) => {
            if (ch.id !== boss.chapterId) return ch;
            return {
              ...ch,
              status: 'mastered',
              masteryStars: 5,
              progressPercent: 100,
              bestQuizScore: Math.max(ch.bestQuizScore || 0, scorePercent),
            };
          }),
        };
      })
    );

    setProfile((prev) => ({
      ...prev,
      bossesDefeatedCount: prev.bossesDefeatedCount + 1,
      chaptersMasteredCount: prev.chaptersMasteredCount + 1,
    }));

    // Unlock achievements
    unlockAchievement('ach-3'); // First Victory
    unlockAchievement('ach-6'); // Realm Master

    // Update special quest
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'special-1') {
          return { ...q, currentProgress: 1, isCompleted: true };
        }
        return q;
      })
    );

    addXpAndCoins(boss.xpReward, boss.coinReward, `⚔️ BOSS DEFEATED! ${boss.name}`);
  };

  const surviveBoss = (_bossId: string, _scorePercent: number) => {
    // Positive framing per UX principle: Partial XP granted!
    const partialXp = 120;
    const partialCoins = 25;
    addXpAndCoins(partialXp, partialCoins, 'Boss survived! Partial wisdom gained for your valiant effort.');
  };

  const buyShopItem = (itemId: string): boolean => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item || item.isUnlocked || profile.coins < item.price) return false;

    if (profile.soundEffectsEnabled) {
      sounds.playCoin();
    }

    setProfile((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
    }));

    setShopItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isUnlocked: true, isEquipped: true } : i))
    );

    // Equip the item
    equipShopItem(itemId);
    return true;
  };

  const equipShopItem = (itemId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    setShopItems((prev) =>
      prev.map((i) => {
        if (i.type === item.type) {
          return { ...i, isEquipped: i.id === itemId };
        }
        return i;
      })
    );

    setProfile((prev) => {
      const updates: Partial<StudentProfile> = {};
      if (item.type === 'frame') updates.frame = item.id;
      if (item.type === 'avatar') updates.avatar = item.id.replace('avatar-', '');
      if (item.type === 'title') updates.title = item.name;
      if (item.type === 'theme') updates.theme = item.id;
      return { ...prev, ...updates };
    });
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetAllProgress = () => {
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    localStorage.removeItem(`${STORAGE_KEY}_subjects`);
    localStorage.removeItem(`${STORAGE_KEY}_quests`);
    localStorage.removeItem(`${STORAGE_KEY}_bosses`);
    localStorage.removeItem(`${STORAGE_KEY}_achievements`);
    localStorage.removeItem(`${STORAGE_KEY}_shop`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);
    localStorage.removeItem(`${STORAGE_KEY}_notifs`);
    localStorage.removeItem(`${STORAGE_KEY}_studylogs`);

    setProfile(INITIAL_PROFILE);
    setSubjects(INITIAL_SUBJECTS);
    setQuests(INITIAL_QUESTS);
    setBosses(INITIAL_BOSSES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setShopItems(INITIAL_SHOP_ITEMS);
    setDailyActivities(INITIAL_DAYS_ACTIVITY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setStudyLogs([]);
    setActiveView('home');
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        subjects,
        quests,
        bosses,
        achievements,
        shopItems,
        dailyActivities,
        notifications,
        studyLogs,
        activeView,
        selectedSubjectId,
        selectedChapterId,
        isStudyTimerOpen,
        studyTimerSubjectId,
        studyTimerChapterId,
        isQuestMasterOpen,
        isLevelUpModalOpen,
        levelUpData,
        xpGainToasts,
        isOnboardingOpen,

        setActiveView,
        setSelectedSubjectId,
        setSelectedChapterId,
        openStudyTimer,
        closeStudyTimer,
        openQuestMaster,
        closeQuestMaster,
        closeLevelUpModal,
        setIsOnboardingOpen,

        addXpAndCoins,
        completeStudySession,
        claimQuestReward,
        completeQuiz,
        defeatBoss,
        surviveBoss,
        buyShopItem,
        equipShopItem,
        updateProfile,
        markNotificationRead,
        clearNotification,
        resetAllProgress,
        triggerConfettiEffect,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
