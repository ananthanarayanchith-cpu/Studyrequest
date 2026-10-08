import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SubjectId } from '../types/game';
import { sounds } from '../utils/audio';

export const StudyTimerModal: React.FC = () => {
  const {
    isStudyTimerOpen,
    closeStudyTimer,
    subjects,
    studyTimerSubjectId,
    studyTimerChapterId,
    completeStudySession,
  } = useGame();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(studyTimerSubjectId);
  const [selectedChapter, setSelectedChapter] = useState<string>(studyTimerChapterId);
  const [presetDuration, setPresetDuration] = useState<number>(25); // minutes
  const [customMinutes, setCustomMinutes] = useState<string>('30');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Timer running state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [totalSecondsSet, setTotalSecondsSet] = useState<number>(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isAmbientOn, setIsAmbientOn] = useState<boolean>(false);

  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [completionReward, setCompletionReward] = useState<{ xp: number; coins: number } | null>(null);
  const [timeWarning, setTimeWarning] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with initial props
  useEffect(() => {
    if (studyTimerSubjectId) setSelectedSubject(studyTimerSubjectId);
    if (studyTimerChapterId) setSelectedChapter(studyTimerChapterId);
  }, [studyTimerSubjectId, studyTimerChapterId]);

  // Handle countdown interval
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  // Clean up ambient audio on modal close
  useEffect(() => {
    if (!isStudyTimerOpen && isAmbientOn) {
      sounds.toggleAmbientSound(false);
      setIsAmbientOn(false);
    }
  }, [isStudyTimerOpen, isAmbientOn]);

  if (!isStudyTimerOpen) return null;

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
  const currentChapterObj =
    currentSubjectObj.chapters.find((c) => c.id === selectedChapter) || currentSubjectObj.chapters[0];

  const handleStartTimer = (mins: number) => {
    sounds.playClick();
    const secs = mins * 60;
    setTotalSecondsSet(secs);
    setSecondsRemaining(secs);
    setElapsedSeconds(0);
    setIsActive(true);
    setIsPaused(false);
    setSessionCompleted(false);
  };

  const handlePauseResume = () => {
    sounds.playClick();
    setIsPaused(!isPaused);
  };

  const toggleAmbient = () => {
    const nextState = !isAmbientOn;
    setIsAmbientOn(nextState);
    sounds.toggleAmbientSound(nextState, 'rain');
  };

  const handleTimerComplete = () => {
    sounds.playTimerBell();
    if (isAmbientOn) {
      sounds.toggleAmbientSound(false);
      setIsAmbientOn(false);
    }
    const minsStudied = Math.round(totalSecondsSet / 60);
    const rewards = completeStudySession(selectedSubject, selectedChapter, minsStudied);
    setCompletionReward(rewards);
    setSessionCompleted(true);
    setIsActive(false);
  };

  const handleEarlyFinish = () => {
    sounds.playClick();
    const minutesStudied = Math.floor(elapsedSeconds / 60);

    if (elapsedSeconds < 60) {
      // Prevent farming: user studied less than 1 minute
      setTimeWarning('A true scholar needs at least 1 minute of focused meditation to forge XP!');
      setTimeout(() => setTimeWarning(null), 3500);
      return;
    }

    if (isAmbientOn) {
      sounds.toggleAmbientSound(false);
      setIsAmbientOn(false);
    }

    sounds.playTimerBell();
    const rewards = completeStudySession(selectedSubject, selectedChapter, minutesStudied);
    setCompletionReward(rewards);
    setSessionCompleted(true);
    setIsActive(false);
  };

  const handleClose = () => {
    if (isAmbientOn) {
      sounds.toggleAmbientSound(false);
      setIsAmbientOn(false);
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSessionCompleted(false);
    closeStudyTimer();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    totalSecondsSet > 0 ? Math.min(100, Math.round(((totalSecondsSet - secondsRemaining) / totalSecondsSet) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-indigo-950/50 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-rpg text-base sm:text-lg font-bold text-slate-100">Focus Sanctum</h2>
              <p className="text-[11px] text-slate-400">Deep study channeling realm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAmbient}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                isAmbientOn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle Ambient Rain Hum"
            >
              {isAmbientOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] hidden sm:inline">{isAmbientOn ? 'Ambient On' : 'Ambient Off'}</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COMPLETED STATE */}
        {sessionCompleted && completionReward ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-rpg text-2xl font-black text-emerald-400">SESSION TRIUMPH!</h3>
              <p className="text-slate-300 text-sm mt-1">
                Your focused concentration on <span className="font-semibold text-white">{currentChapterObj?.title}</span>{' '}
                has borne fruit!
              </p>
            </div>

            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-mono">XP Earned</span>
                <span className="text-xl font-bold font-mono text-amber-400">+{completionReward.xp} XP</span>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-mono">Coins Bountied</span>
                <span className="text-xl font-bold font-mono text-yellow-300">+{completionReward.coins}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/30"
              >
                Return to Kingdom
              </button>
            </div>
          </div>
        ) : !isActive ? (
          /* SETUP STATE */
          <div className="py-5 space-y-5">
            {/* Subject and Chapter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Target Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const nextSub = e.target.value as SubjectId;
                    setSelectedSubject(nextSub);
                    const subObj = subjects.find((s) => s.id === nextSub);
                    if (subObj?.chapters[0]) setSelectedChapter(subObj.chapters[0].id);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon} {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Chapter Node</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {currentSubjectObj.chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} ({ch.progressPercent}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Duration Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 25, label: '25 min', xp: '+100 XP' },
                  { mins: 45, label: '45 min', xp: '+180 XP' },
                  { mins: 60, label: '60 min', xp: '+250 XP' },
                  { mins: -1, label: 'Custom', xp: 'Scaled' },
                ].map((preset) => {
                  const isSelected = !isCustomMode && presetDuration === preset.mins;
                  const isCustomSelected = isCustomMode && preset.mins === -1;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        sounds.playClick();
                        if (preset.mins === -1) {
                          setIsCustomMode(true);
                        } else {
                          setIsCustomMode(false);
                          setPresetDuration(preset.mins);
                        }
                      }}
                      className={`p-3 rounded-2xl text-center border transition-all ${
                        isSelected || isCustomSelected
                          ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-bold font-mono">{preset.label}</div>
                      <div className="text-[10px] text-amber-400/90 font-medium mt-0.5">{preset.xp}</div>
                    </button>
                  );
                })}
              </div>

              {isCustomMode && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Enter minutes (1-180)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  <span className="text-xs text-slate-400">minutes</span>
                </div>
              )}
            </div>

            {/* Launch Button */}
            <button
              onClick={() => {
                const targetMins = isCustomMode ? Math.max(1, parseInt(customMinutes, 10) || 25) : presetDuration;
                handleStartTimer(targetMins);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter Focus State</span>
            </button>
          </div>
        ) : (
          /* ACTIVE FOCUS STATE */
          <div className="py-6 text-center space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
                {currentSubjectObj.icon} {currentSubjectObj.name} • {currentChapterObj.title}
              </span>
            </div>

            {/* Circular Timer Ring */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" />
                {/* Progress Bar */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="6"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                  {isPaused ? 'Paused' : 'Channeling Focus'}
                </span>
              </div>
            </div>

            {/* Motivational RPG Lore Snippet */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {isPaused
                  ? 'Mana flow paused. Catch your breath and return when ready.'
                  : 'Distractions are illusions. Every minute spent here sharpens your intellectual sword.'}
              </span>
            </div>

            {timeWarning && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{timeWarning}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handlePauseResume}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
              >
                {isPaused ? <Play className="w-4 h-4 fill-slate-200" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleEarlyFinish}
                className="px-6 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finish Early</span>
              </button>
            </div>

            {/* Anti-cheat disclaimer */}
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>XP is calibrated to authentic elapsed study time (min 1m required).</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
