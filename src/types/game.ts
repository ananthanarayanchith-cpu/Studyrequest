export type SubjectId = 'math' | 'physics' | 'chemistry' | 'english' | 'cs';

export type ChapterStatus = 'locked' | 'available' | 'completed' | 'mastered';

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  order: number;
  status: ChapterStatus;
  progressPercent: number; // 0 - 100
  masteryStars: number; // 0 - 5
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  xpReward: number;
  coinReward: number;
  concepts: string[];
  lastStudiedDate?: string;
  bestQuizScore?: number;
}

export interface Subject {
  id: SubjectId;
  name: string;
  realmName: string;
  icon: string;
  color: string;
  accentColor: string;
  badge: string;
  description: string;
  chapters: Chapter[];
  examDate?: string;
  examName?: string;
}

export type QuestType = 'daily' | 'weekly' | 'special';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  deadlineText: string;
  subjectId?: SubjectId;
  iconName: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-3
  explanation: string;
  topic: string;
  subjectId: SubjectId;
  chapterId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterName: string;
  maxHp: number;
  avatarIcon: string;
  bgGradient: string;
  requiredScorePercent: number;
  xpReward: number;
  coinReward: number;
  description: string;
  questions: QuizQuestion[];
  timeLimitSeconds: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'study' | 'combat' | 'streak' | 'mastery';
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'frame' | 'avatar' | 'title' | 'theme';
  price: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  preview: string; // CSS class, icon or image preview representation
  description: string;
}

export interface DailyActivityDay {
  dayName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dateString: string;
  studiedMinutes: number;
  completedQuests: number;
  hasStreakPoint: boolean;
}

export interface StudentProfile {
  name: string;
  avatar: string;
  frame: string;
  title: string;
  theme: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  coins: number;
  streak: number;
  bestStreak: number;
  totalStudyMinutes: number;
  questsCompletedCount: number;
  bossesDefeatedCount: number;
  chaptersMasteredCount: number;
  quizzesTakenCount: number;
  averageQuizScore: number;
  weakTopics: string[];
  strongSubjects: string[];
  remindersEnabled: boolean;
  soundEffectsEnabled: boolean;
  dailyGoalMinutes: number;
}

export interface StudySessionLog {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  chapterTitle: string;
  minutes: number;
  xpEarned: number;
  coinsEarned: number;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'quest' | 'streak' | 'boss' | 'level';
  actionView?: string;
}
