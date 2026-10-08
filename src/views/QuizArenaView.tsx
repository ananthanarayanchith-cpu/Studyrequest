import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Swords,
  Shield,
  Zap,
  Flame,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { QuizQuestion, Boss, SubjectId } from '../types/game';
import { LOCAL_QUESTION_BANK } from '../data/initialData';
import { sounds } from '../utils/audio';

type ArenaMode = 'select' | 'battle' | 'results';
type QuizCategory = 'quick' | 'chapter' | 'mixed' | 'boss';

export const QuizArenaView: React.FC = () => {
  const {
    subjects,
    bosses,
    selectedSubjectId,
    selectedChapterId,
    completeQuiz,
    defeatBoss,
    surviveBoss,
    openStudyTimer,
  } = useGame();

  // Mode state
  const [arenaMode, setArenaMode] = useState<ArenaMode>('select');
  const [quizCategory, setQuizCategory] = useState<QuizCategory>('boss');
  const [chosenSubject, setChosenSubject] = useState<SubjectId>(selectedSubjectId || 'chemistry');
  const [chosenChapterId, setChosenChapterId] = useState<string>(selectedChapterId || 'chem-2');
  const [chosenBoss, setChosenBoss] = useState<Boss>(bosses[0]);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Array<{ questionIndex: number; selectedOption: number; isCorrect: boolean }>>([]);

  // Boss Battle Stats
  const [bossHp, setBossHp] = useState<number>(1000);
  const [maxBossHp, setMaxBossHp] = useState<number>(1000);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [isBossDamaged, setIsBossDamaged] = useState<boolean>(false);
  const [isPlayerDamaged, setIsPlayerDamaged] = useState<boolean>(false);

  // Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Loading state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  // Result stats
  const [finalScorePercent, setFinalScorePercent] = useState<number>(0);
  const [earnedRewards, setEarnedRewards] = useState<{ xp: number; coins: number }>({ xp: 0, coins: 0 });
  const [weakTopicsFound, setWeakTopicsFound] = useState<string[]>([]);

  // Sync props if passed
  useEffect(() => {
    if (selectedSubjectId) setChosenSubject(selectedSubjectId);
    if (selectedChapterId) setChosenChapterId(selectedChapterId);
  }, [selectedSubjectId, selectedChapterId]);

  // Battle countdown timer
  useEffect(() => {
    if (arenaMode === 'battle') {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleFinishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [arenaMode]);

  // Start Quiz or Boss Battle
  const handleStartArena = async (category: QuizCategory, targetBoss?: Boss) => {
    sounds.playClick();
    setQuizCategory(category);
    setIsGeneratingQuestions(true);

    let questionsToUse: QuizQuestion[] = [];

    if (category === 'boss') {
      const boss = targetBoss || bosses.find((b) => b.subjectId === chosenSubject) || bosses[0];
      setChosenBoss(boss);
      questionsToUse = boss.questions;
      setMaxBossHp(boss.maxHp);
      setBossHp(boss.maxHp);
      setPlayerHp(100);
      setTimeRemainingSeconds(boss.timeLimitSeconds);
    } else {
      // Check if we can fetch questions from /api/generate-quiz or fallback to question bank
      try {
        const targetSub = subjects.find((s) => s.id === chosenSubject);
        const targetCh = targetSub?.chapters.find((c) => c.id === chosenChapterId);

        const res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: targetSub?.name || 'Science',
            chapter: targetCh?.title || 'General',
            count: category === 'quick' ? 5 : 10,
          }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          questionsToUse = data.questions.map((q: any, idx: number) => ({
            ...q,
            id: `gen-${idx}`,
            subjectId: chosenSubject,
          }));
        }
      } catch (err) {
        console.warn('Using local fallback pool:', err);
      }

      // If no AI questions returned, use local pool
      if (questionsToUse.length === 0) {
        const pool = LOCAL_QUESTION_BANK[chosenSubject] || LOCAL_QUESTION_BANK.math;
        const count = category === 'quick' ? 5 : Math.min(10, pool.length);
        questionsToUse = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
      }

      setTimeRemainingSeconds(category === 'quick' ? 300 : 600);
    }

    setQuestions(questionsToUse);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setTimeSpentSeconds(0);
    setIsGeneratingQuestions(false);
    setArenaMode('battle');
  };

  // Submit answer for current question
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    sounds.playClick();
    setIsAnswerSubmitted(true);

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    setUserAnswers((prev) => [
      ...prev,
      { questionIndex: currentIndex, selectedOption, isCorrect },
    ]);

    if (quizCategory === 'boss') {
      if (isCorrect) {
        sounds.playHit();
        setIsBossDamaged(true);
        setTimeout(() => setIsBossDamaged(false), 500);
        // Damage boss proportional to question count
        const damage = Math.round(maxBossHp / questions.length);
        setBossHp((prev) => Math.max(0, prev - damage));
      } else {
        sounds.playHit();
        setIsPlayerDamaged(true);
        setTimeout(() => setIsPlayerDamaged(false), 500);
        // Player loses HP on incorrect answer
        setPlayerHp((prev) => Math.max(10, prev - 20));
      }
    } else {
      if (isCorrect) {
        sounds.playCoin();
      } else {
        sounds.playHit();
      }
    }
  };

  // Next question or finish
  const handleNextQuestion = () => {
    sounds.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      handleFinishQuiz(false);
    }
  };

  // Conclude battle & calculate scores
  const handleFinishQuiz = (timedOut: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalQuestions = questions.length;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length + (isAnswerSubmitted && selectedOption === questions[currentIndex]?.correctAnswer && !userAnswers.some(u => u.questionIndex === currentIndex) ? 1 : 0);
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    setFinalScorePercent(scorePercent);

    // Identify weak topics
    const weakList: string[] = [];
    userAnswers.forEach((ans) => {
      if (!ans.isCorrect && questions[ans.questionIndex]) {
        weakList.push(questions[ans.questionIndex].topic);
      }
    });
    setWeakTopicsFound(Array.from(new Set(weakList)));

    if (quizCategory === 'boss') {
      const passed = scorePercent >= chosenBoss.requiredScorePercent;
      if (passed) {
        defeatBoss(chosenBoss.id, scorePercent);
        setEarnedRewards({ xp: chosenBoss.xpReward, coins: chosenBoss.coinReward });
      } else {
        surviveBoss(chosenBoss.id, scorePercent);
        setEarnedRewards({ xp: 120, coins: 25 });
      }
    } else {
      const rewards = completeQuiz(
        chosenSubject,
        chosenChapterId,
        scorePercent,
        totalQuestions,
        weakList
      );
      setEarnedRewards(rewards);
    }

    setArenaMode('results');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ================= RENDER =================

  // 1. SELECT MODE
  if (arenaMode === 'select') {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
        <div>
          <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
            Quiz & Boss Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Test your intellect under time pressure, challenge legendary Bosses, and diagnose weak concepts.
          </p>
        </div>

        {/* FEATURED: BOSS BATTLE SECTION */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-400" />
            <h3 className="font-rpg text-lg font-bold text-slate-100">Realm Boss Battles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bosses.map((boss) => {
              const isChemistry = boss.subjectId === 'chemistry';
              return (
                <div
                  key={boss.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-br ${boss.bgGradient} ${
                    isChemistry
                      ? 'border-emerald-500/70 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl sm:text-4xl">{boss.avatarIcon}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                        REQ {boss.requiredScorePercent}%
                      </span>
                    </div>

                    <h4 className="font-rpg text-lg font-bold text-white">{boss.name}</h4>
                    <p className="text-xs text-amber-300/90 font-mono mt-0.5">{boss.chapterName}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {boss.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
                      <span>{boss.questions.length} Questions</span>
                      <span>{Math.round(boss.timeLimitSeconds / 60)} Mins</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      +{boss.xpReward} XP
                    </span>

                    <button
                      onClick={() => handleStartArena('boss', boss)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Engage Boss</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PRACTICE QUIZ DRILLS */}
        <section className="space-y-4">
          <h3 className="font-rpg text-lg font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" /> Academic Practice Drills
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Quiz (5 Qs) */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-rpg text-base font-bold text-slate-100">Quick Speed Quiz</h4>
                <p className="text-xs text-slate-400 mt-1">
                  5 rapid-fire questions to warm up your intellect. Takes ~5 minutes.
                </p>
                <div className="text-xs font-mono text-amber-400 mt-3 font-semibold">+150 XP • +30 Coins</div>
              </div>

              <button
                onClick={() => handleStartArena('quick')}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Launch Speed Drill
              </button>
            </div>

            {/* Chapter Mastery Quiz (10 Qs) */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-rpg text-base font-bold text-slate-100">Chapter Assessment</h4>
                <p className="text-xs text-slate-400 mt-1">
                  10 comprehensive questions covering your active chapter curriculum.
                </p>
                <div className="text-xs font-mono text-amber-400 mt-3 font-semibold">+220 XP • +45 Coins</div>
              </div>

              <button
                onClick={() => handleStartArena('chapter')}
                className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all"
              >
                Start Chapter Quiz
              </button>
            </div>

            {/* Mixed Realm Arena */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-rpg text-base font-bold text-slate-100">Mixed Realm Arena</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Randomized cross-disciplinary questions from Math, Physics, and Chemistry.
                </p>
                <div className="text-xs font-mono text-amber-400 mt-3 font-semibold">+250 XP • +50 Coins</div>
              </div>

              <button
                onClick={() => handleStartArena('mixed')}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Enter Mixed Trial
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 2. ACTIVE BATTLE / QUIZ INTERFACE
  if (arenaMode === 'battle') {
    const currentQ = questions[currentIndex];
    const isBoss = quizCategory === 'boss';
    const bossHpPercent = Math.max(0, Math.round((bossHp / maxBossHp) * 100));

    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
        {/* Top Battle HUD */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              {isBoss ? '⚔️ Boss Trial' : 'Academic Quiz'} • Question {currentIndex + 1} of {questions.length}
            </span>

            <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-slate-800 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatSeconds(timeRemainingSeconds)}</span>
            </div>
          </div>

          {/* BOSS COMBAT HUD (if Boss mode) */}
          {isBoss && (
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              {/* Boss Entity Status */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-rpg font-bold text-rose-300 flex items-center gap-2">
                    <span className="text-xl">{chosenBoss.avatarIcon}</span>
                    <span>{chosenBoss.name}</span>
                  </span>
                  <span className="font-mono text-rose-400 font-bold">{bossHpPercent}% HP</span>
                </div>

                {/* Boss Health Bar */}
                <div className={`w-full h-3 rounded-full bg-slate-950 p-0.5 overflow-hidden ring-1 ring-rose-900 ${isBossDamaged ? 'animate-boss-hit' : ''}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                    style={{ width: `${bossHpPercent}%` }}
                  />
                </div>
              </div>

              {/* Player Health Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" /> Student Resolve / HP
                  </span>
                  <span className="text-blue-400 font-bold">{playerHp}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full bg-slate-950 overflow-hidden ${isPlayerDamaged ? 'animate-player-hit' : ''}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${playerHp}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Question Card */}
        {currentQ ? (
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-indigo-400 font-mono font-bold">
                {currentQ.topic}
              </span>
            </div>

            <h3 className="font-rpg text-base sm:text-xl font-bold text-slate-100 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswer;

                let optionStyles = 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-600 hover:bg-slate-800';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  } else {
                    optionStyles = 'bg-slate-900/60 border-slate-800 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyles = 'bg-indigo-600/20 border-indigo-400 text-white ring-1 ring-indigo-400';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedOption(idx);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyles}`}
                  >
                    <span className="font-medium leading-relaxed">{option}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed animate-in fade-in">
                <span className="block font-bold text-amber-300 mb-1">Pedagogical Insight:</span>
                {currentQ.explanation}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              {!isAnswerSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all"
                >
                  Confirm Strike
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Arena'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">Loading trial challenges...</div>
        )}
      </div>
    );
  }

  // 3. RESULTS & DIAGNOSTICS SCREEN
  const isBoss = quizCategory === 'boss';
  const bossPassed = isBoss && finalScorePercent >= chosenBoss.requiredScorePercent;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
        {/* Victory or Positive Encouragement Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl border">
          {isBoss && bossPassed ? (
            <div className="w-full h-full rounded-3xl bg-amber-500/20 border-amber-400/80 flex items-center justify-center text-amber-400">
              <Award className="w-10 h-10" />
            </div>
          ) : isBoss && !bossPassed ? (
            <div className="w-full h-full rounded-3xl bg-rose-500/20 border-rose-400/80 flex items-center justify-center text-rose-400">
              <Shield className="w-10 h-10" />
            </div>
          ) : finalScorePercent >= 70 ? (
            <div className="w-full h-full rounded-3xl bg-emerald-500/20 border-emerald-400/80 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-full h-full rounded-3xl bg-indigo-500/20 border-indigo-400/80 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Headline */}
        <div>
          <h3 className="font-rpg text-2xl sm:text-3xl font-black tracking-wide text-white">
            {isBoss && bossPassed
              ? '⚔️ BOSS DEFEATED!'
              : isBoss && !bossPassed
              ? 'Boss Survived!'
              : finalScorePercent >= 80
              ? 'GLORIOUS MASTERY!'
              : 'TRIAL CONCLUDED'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
            {isBoss && bossPassed
              ? `You have shattered ${chosenBoss.name}'s shielding with your mastery of ${chosenBoss.chapterName}! Chapter elevated to Mastered.`
              : isBoss && !bossPassed
              ? `The boss withstood this round. Review your weak areas below and try again when you feel ready!`
              : `Your answers have been registered into the academic chronicler.`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Accuracy</span>
            <span className={`text-xl font-bold font-mono ${finalScorePercent >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {finalScorePercent}%
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Time Taken</span>
            <span className="text-xl font-bold font-mono text-slate-200">
              {formatSeconds(timeSpentSeconds)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Bounty Won</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              +{earnedRewards.xp} XP
            </span>
          </div>
        </div>

        {/* 10. WEAK CONCEPTS DIAGNOSIS */}
        {weakTopicsFound.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Diagnosed Weak Concepts:</span>
            </div>
            <p className="text-xs text-slate-300">
              Your lowest accuracy was in:{' '}
              <strong className="text-white">{weakTopicsFound.join(', ')}</strong>.
            </p>
            <p className="text-xs text-amber-400 font-medium">
              Recommendation: Practice {weakTopicsFound[0]} before your next major exam trial.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            onClick={() => {
              sounds.playClick();
              if (weakTopicsFound.length > 0) {
                openStudyTimer(chosenSubject);
              } else {
                setArenaMode('select');
              }
            }}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practice Weak Area Now</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setArenaMode('select');
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Return to Arena Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
