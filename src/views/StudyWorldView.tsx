import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  Star,
  Sparkles,
  BookOpen,
  ArrowRight,
  Play,
  Brain,
  Swords,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SubjectId, Chapter, Subject } from '../types/game';
import { sounds } from '../utils/audio';

export const StudyWorldView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    openStudyTimer,
    setActiveView,
    setSelectedChapterId,
  } = useGame();

  const [activeRealmId, setActiveRealmId] = useState<SubjectId>(selectedSubjectId || 'math');
  const [inspectedChapter, setInspectedChapter] = useState<Chapter | null>(null);

  const activeSubject = subjects.find((s) => s.id === activeRealmId) || subjects[0];

  const handleSelectRealm = (id: SubjectId) => {
    sounds.playClick();
    setActiveRealmId(id);
    setSelectedSubjectId(id);
    setInspectedChapter(null);
  };

  const handleInspectChapter = (chapter: Chapter) => {
    sounds.playClick();
    setInspectedChapter(chapter);
  };

  const handleLaunchStudy = (ch: Chapter) => {
    sounds.playClick();
    setInspectedChapter(null);
    openStudyTimer(activeSubject.id, ch.id);
  };

  const handleLaunchQuiz = (ch: Chapter) => {
    sounds.playClick();
    setInspectedChapter(null);
    setSelectedSubjectId(activeSubject.id);
    setSelectedChapterId(ch.id);
    setActiveView('arena');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Realm Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
            Study World Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Navigate the five great academic kingdoms and traverse the chapter progression paths.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Locked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Mastered
          </span>
        </div>
      </div>

      {/* REALM SELECTOR TABS (The 5 Realms) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {subjects.map((sub) => {
          const isSelected = activeSubject.id === sub.id;
          const completedCount = sub.chapters.filter((c) => c.status === 'completed' || c.status === 'mastered').length;
          const totalCount = sub.chapters.length;
          const realmProgress = Math.round((completedCount / totalCount) * 100);

          return (
            <button
              key={sub.id}
              onClick={() => handleSelectRealm(sub.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{sub.icon}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {realmProgress}%
                </span>
              </div>
              <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                {sub.name}
              </h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub.realmName}</p>
            </button>
          );
        })}
      </div>

      {/* REALM OVERVIEW BANNER */}
      <div
        className={`p-6 rounded-3xl bg-gradient-to-r ${activeSubject.color} border border-slate-700/80 shadow-xl relative overflow-hidden text-slate-100`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeSubject.icon}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                {activeSubject.badge}
              </span>
            </div>
            <h3 className="font-rpg text-2xl font-black text-white">{activeSubject.realmName}</h3>
            <p className="text-xs sm:text-sm text-slate-200/90 mt-1 max-w-xl">{activeSubject.description}</p>
          </div>

          <div className="bg-slate-950/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs font-mono space-y-1">
            <div className="text-slate-300">Upcoming Trial:</div>
            <div className="text-amber-300 font-bold">{activeSubject.examName || 'Assessment Approaching'}</div>
            <div className="text-slate-400 text-[11px]">{activeSubject.examDate || 'Next Week'}</div>
          </div>
        </div>
      </div>

      {/* VISUAL CHAPTER PROGRESSION PATH (RPG NODES) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 relative shadow-xl overflow-hidden">
        {/* Subtle coordinate grid styling */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h4 className="font-rpg text-lg font-bold text-slate-200">
              Path of the {activeSubject.name} Runes
            </h4>
            <p className="text-xs text-slate-400">
              Select any unlocked node to view study concepts, practice flashcards, or take quizzes.
            </p>
          </div>

          {/* Node progression trail */}
          <div className="max-w-xl mx-auto space-y-8 relative">
            {/* Connecting Vertical Line */}
            <div className="absolute left-6 sm:left-1/2 top-8 bottom-8 w-1 bg-slate-800 -translate-x-1/2 z-0" />

            {activeSubject.chapters.map((chapter, index) => {
              const isLocked = chapter.status === 'locked';
              const isAvailable = chapter.status === 'available';
              const isCompleted = chapter.status === 'completed';
              const isMastered = chapter.status === 'mastered';

              // Alternate left/right on desktop
              const isEven = index % 2 === 0;

              return (
                <div
                  key={chapter.id}
                  className={`relative flex items-center gap-4 sm:gap-8 z-10 ${
                    isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* The Interactive Node Orb */}
                  <div className="shrink-0 flex items-center justify-center">
                    <button
                      onClick={() => handleInspectChapter(chapter)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all transform active:scale-90 border-2 ${
                        isMastered
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/20 hover:scale-105'
                          : isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 hover:scale-105'
                          : isAvailable
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 animate-pulse hover:scale-105'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-75'
                      }`}
                    >
                      {isMastered && <Star className="w-6 h-6 fill-slate-950" />}
                      {isCompleted && <CheckCircle className="w-6 h-6" />}
                      {isAvailable && <Unlock className="w-5 h-5" />}
                      {isLocked && <Lock className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Chapter Card Content */}
                  <div
                    onClick={() => handleInspectChapter(chapter)}
                    className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-slate-850/40 border-slate-800/80 text-slate-500'
                        : 'bg-slate-800/80 border-slate-700/80 hover:border-amber-400/50 hover:bg-slate-800 text-slate-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 font-bold uppercase tracking-wider text-slate-400">
                          Node {chapter.order}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-400">
                          {chapter.difficulty}
                        </span>
                      </div>

                      {/* Status indicator badge */}
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                          isMastered
                            ? 'bg-amber-400/20 text-amber-300'
                            : isCompleted
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : isAvailable
                            ? 'bg-blue-400/20 text-blue-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {chapter.status}
                      </span>
                    </div>

                    <h5 className="font-rpg text-sm sm:text-base font-bold text-slate-100 mt-1.5">
                      {chapter.title}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{chapter.description}</p>

                    {/* Progress & Stars */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-750 text-xs">
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

                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span>{chapter.progressPercent}%</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHAPTER INSPECTOR MODAL */}
      {inspectedChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSubject.icon}</span>
                <div>
                  <h3 className="font-rpg text-base sm:text-lg font-bold text-slate-100">
                    {inspectedChapter.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeSubject.name} • Node {inspectedChapter.order}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedChapter(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {inspectedChapter.description}
              </p>

              {/* Progress & Mastery */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">Completion</span>
                  <span className="text-base font-bold font-mono text-blue-400">
                    {inspectedChapter.progressPercent}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">Mastery Stars</span>
                  <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < inspectedChapter.masteryStars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Concepts Included */}
              <div>
                <span className="block text-xs font-semibold text-slate-300 mb-2">Core Concepts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedChapter.concepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bounties */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span>XP Reward: +{inspectedChapter.xpReward} XP</span>
                <span className="text-amber-400">+{inspectedChapter.coinReward} Coins</span>
              </div>
            </div>

            {/* Actions: Study, Take Quiz */}
            {inspectedChapter.status === 'locked' ? (
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-450 space-y-1">
                <span className="font-bold text-amber-300 block flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Sealed Chapter
                </span>
                <p className="text-slate-400">Complete prior nodes in the {activeSubject.name} path to break the magical seal on this node.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleLaunchStudy(inspectedChapter)}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Study Timer</span>
                </button>

                <button
                  onClick={() => handleLaunchQuiz(inspectedChapter)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
