import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Sparkles,
  Brain,
  Star,
  Play,
  CheckCircle,
  Lock,
  ChevronRight,
  Flame,
  Award,
  Layers,
  X,
  RotateCw,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SubjectId, Chapter, Subject } from '../types/game';
import { sounds } from '../utils/audio';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    setSelectedChapterId,
    openStudyTimer,
    setActiveView,
  } = useGame();

  const [currentSubjectId, setCurrentSubjectId] = useState<SubjectId>(selectedSubjectId || 'math');
  const [practiceChapter, setPracticeChapter] = useState<Chapter | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentSubject = subjects.find((s) => s.id === currentSubjectId) || subjects[0];

  // Calculate subject aggregate stats
  const totalChapters = currentSubject.chapters.length;
  const completedChapters = currentSubject.chapters.filter(
    (c) => c.status === 'completed' || c.status === 'mastered'
  ).length;
  const overallCompletion = Math.round((completedChapters / totalChapters) * 100);

  // Subject XP earned approx
  const xpEarnedInSubject = currentSubject.chapters.reduce(
    (acc, c) => acc + (c.status === 'mastered' ? c.xpReward * 1.5 : c.status === 'completed' ? c.xpReward : Math.round(c.xpReward * (c.progressPercent / 100))),
    0
  );

  // Average quiz score
  const chaptersWithScore = currentSubject.chapters.filter((c) => c.bestQuizScore !== undefined);
  const avgQuizScore = chaptersWithScore.length > 0
    ? Math.round(chaptersWithScore.reduce((acc, c) => acc + (c.bestQuizScore || 0), 0) / chaptersWithScore.length)
    : 75;

  const handleStudy = (ch: Chapter) => {
    sounds.playClick();
    openStudyTimer(currentSubject.id, ch.id);
  };

  const handlePractice = (ch: Chapter) => {
    sounds.playClick();
    setPracticeChapter(ch);
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const handleTakeQuiz = (ch: Chapter) => {
    sounds.playClick();
    setSelectedSubjectId(currentSubject.id);
    setSelectedChapterId(ch.id);
    setActiveView('arena');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
            Subject Guilds
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Examine academic disciplines, track chapter mastery, and launch practice drills.
          </p>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map((sub) => {
          const isSelected = currentSubject.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                sounds.playClick();
                setCurrentSubjectId(sub.id);
                setSelectedSubjectId(sub.id);
              }}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subject Dashboard Stats Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
              {currentSubject.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-rpg text-xl sm:text-2xl font-bold text-slate-100">
                  {currentSubject.name}
                </h3>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {currentSubject.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentSubject.realmName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Exam Target:</span>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              {currentSubject.examName || 'Term Final'} • {currentSubject.examDate || 'Soon'}
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-mono uppercase">Overall Mastery</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{overallCompletion}%</span>
            <div className="w-full h-1.5 rounded-full bg-slate-900 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-mono uppercase">XP Channelled</span>
            <span className="text-xl font-bold font-mono text-amber-400">~{xpEarnedInSubject} XP</span>
            <p className="text-[10px] text-slate-400 mt-2">Earned across chapters</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-mono uppercase">Avg Quiz Accuracy</span>
            <span className="text-xl font-bold font-mono text-purple-300">{avgQuizScore}%</span>
            <p className="text-[10px] text-slate-400 mt-2">{chaptersWithScore.length} chapters tested</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-mono uppercase">Mastered Chapters</span>
            <span className="text-xl font-bold font-mono text-blue-400">
              {completedChapters} / {totalChapters}
            </span>
            <p className="text-[10px] text-slate-400 mt-2">Crown milestones</p>
          </div>
        </div>
      </div>

      {/* Chapters Breakdown */}
      <div className="space-y-4">
        <h4 className="font-rpg text-base sm:text-lg font-bold text-slate-200">
          Chapters & Curricula
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSubject.chapters.map((chapter) => {
            const isLocked = chapter.status === 'locked';
            return (
              <div
                key={chapter.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isLocked
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                      Node {chapter.order} • {chapter.difficulty}
                    </span>
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                        chapter.status === 'mastered'
                          ? 'bg-amber-400/20 text-amber-300'
                          : chapter.status === 'completed'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : chapter.status === 'available'
                          ? 'bg-blue-400/20 text-blue-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {chapter.status}
                    </span>
                  </div>

                  <h5 className="font-rpg text-base font-bold text-slate-100">{chapter.title}</h5>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{chapter.description}</p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Completion</span>
                      <span className="text-amber-400 font-bold">{chapter.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        style={{ width: `${chapter.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Mastery Stars */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 font-medium">Mastery:</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < chapter.masteryStars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buttons: Study, Practice, Take Quiz */}
                <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    disabled={isLocked}
                    onClick={() => handleStudy(chapter)}
                    className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm shadow-indigo-600/20"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Study</span>
                  </button>

                  <button
                    disabled={isLocked}
                    onClick={() => handlePractice(chapter)}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Layers className="w-3 h-3 text-blue-400" />
                    <span>Practice</span>
                  </button>

                  <button
                    disabled={isLocked}
                    onClick={() => handleTakeQuiz(chapter)}
                    className="py-2 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 disabled:opacity-50 text-amber-300 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Brain className="w-3 h-3 text-amber-400" />
                    <span>Take Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRACTICE FLASHCARDS / CONCEPTS MODAL */}
      {practiceChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="font-rpg text-base font-bold text-slate-100">
                  Concept Practice: {practiceChapter.title}
                </h3>
              </div>
              <button
                onClick={() => setPracticeChapter(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Flashcard */}
            <div className="py-6">
              <div
                onClick={() => {
                  sounds.playClick();
                  setIsFlipped(!isFlipped);
                }}
                className="h-56 rounded-2xl p-6 bg-gradient-to-b from-slate-800 to-slate-850 border-2 border-indigo-500/40 hover:border-amber-400/60 shadow-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all active:scale-98 select-none"
              >
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest">
                  {isFlipped ? 'Answer & Intuition' : 'Concept Question (Tap to flip)'}
                </span>

                <div className="my-auto">
                  {!isFlipped ? (
                    <div>
                      <h4 className="font-rpg text-lg font-bold text-amber-300">
                        {practiceChapter.concepts[activeCardIndex] || 'Fundamental Concept'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2">
                        How is this principle defined, applied, and remembered in exam trials?
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-base font-semibold text-emerald-300">Mastery Intel:</h4>
                      <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                        Part of {practiceChapter.title}. Test your understanding with quick practice questions or launch a quiz session.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <RotateCw className="w-3 h-3" />
                  <span>Tap card to reveal explanation</span>
                </div>
              </div>

              {/* Card Carousel Navigation */}
              <div className="flex items-center justify-between mt-4 text-xs">
                <button
                  disabled={activeCardIndex === 0}
                  onClick={() => {
                    sounds.playClick();
                    setIsFlipped(false);
                    setActiveCardIndex(activeCardIndex - 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="font-mono text-slate-400">
                  {activeCardIndex + 1} of {practiceChapter.concepts.length} Concepts
                </span>

                <button
                  disabled={activeCardIndex >= practiceChapter.concepts.length - 1}
                  onClick={() => {
                    sounds.playClick();
                    setIsFlipped(false);
                    setActiveCardIndex(activeCardIndex + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Launch Take Quiz CTA */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  const ch = practiceChapter;
                  setPracticeChapter(null);
                  handleTakeQuiz(ch);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Brain className="w-4 h-4" />
                <span>Ready for the Quiz Arena</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
