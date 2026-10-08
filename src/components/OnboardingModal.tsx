import React, { useState } from 'react';
import { Shield, Sparkles, BookOpen, Clock, User, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SubjectId } from '../types/game';
import { sounds } from '../utils/audio';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, updateProfile, profile } = useGame();
  const [step, setStep] = useState<number>(1);

  // Temporary selections
  const [name, setName] = useState<string>(profile.name || 'Alex');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(['math', 'physics', 'chemistry']);
  const [dailyGoal, setDailyGoal] = useState<number>(45);
  const [avatar, setAvatar] = useState<string>('mage');

  if (!isOnboardingOpen) return null;

  const handleFinish = () => {
    sounds.playLevelUp();
    updateProfile({
      name,
      avatar,
      dailyGoalMinutes: dailyGoal,
    });
    setIsOnboardingOpen(false);
  };

  const handleSkip = () => {
    sounds.playClick();
    setIsOnboardingOpen(false);
  };

  const toggleSubject = (id: SubjectId) => {
    sounds.playClick();
    if (selectedSubjects.includes(id)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-6 bg-amber-400' : step > s ? 'w-4 bg-emerald-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button onClick={handleSkip} className="text-slate-400 hover:text-slate-200 font-medium">
            Skip Intro
          </button>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Shield className="w-8 h-8 text-slate-950 fill-amber-300" />
            </div>
            <div>
              <h2 className="font-rpg text-2xl sm:text-3xl font-black text-amber-400">
                Welcome to StudyQuest
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-sm mx-auto">
                Turn studying into your next adventure. Earn XP, level up your character, and conquer school exams like RPG bosses!
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-400 mb-1 text-left">Your Scholar Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SUBJECTS */}
        {step === 2 && (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <h3 className="font-rpg text-xl font-bold text-amber-400">Choose Your Subject Realms</h3>
              <p className="text-xs text-slate-400 mt-1">Select the realms you wish to master this term</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { id: 'math' as SubjectId, name: 'Mathematics', realm: 'Citadel of Equations', icon: '🧮' },
                { id: 'physics' as SubjectId, name: 'Physics', realm: 'Aether Observatory', icon: '⚛️' },
                { id: 'chemistry' as SubjectId, name: 'Chemistry', realm: 'Alchemy Spire', icon: '🧪' },
                { id: 'english' as SubjectId, name: 'English', realm: 'Grand Archives', icon: '📖' },
                { id: 'cs' as SubjectId, name: 'Computer Science', realm: 'Cyber Bastion', icon: '💻' },
              ].map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sub.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{sub.name}</div>
                        <div className="text-[10px] text-slate-400">{sub.realm}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DAILY STUDY GOAL */}
        {step === 3 && (
          <div className="py-6 space-y-5 text-center">
            <div>
              <h3 className="font-rpg text-xl font-bold text-amber-400">Set Your Daily Study Goal</h3>
              <p className="text-xs text-slate-400 mt-1">How much focused study mana will you channel each day?</p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { mins: 25, label: 'Apprentice', desc: '25 min / day' },
                { mins: 45, label: 'Scholar', desc: '45 min / day' },
                { mins: 60, label: 'Archmage', desc: '60 min / day' },
              ].map((goal) => {
                const isSelected = dailyGoal === goal.mins;
                return (
                  <button
                    key={goal.mins}
                    onClick={() => {
                      sounds.playClick();
                      setDailyGoal(goal.mins);
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                    <div className="text-xs font-bold text-slate-100">{goal.label}</div>
                    <div className="text-[11px] font-mono text-amber-400 mt-1">{goal.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE AVATAR */}
        {step === 4 && (
          <div className="py-6 space-y-4 text-center">
            <div>
              <h3 className="font-rpg text-xl font-bold text-amber-400">Choose Your Hero Class</h3>
              <p className="text-xs text-slate-400 mt-1">Select your starting persona</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { id: 'mage', name: 'Arcane Mage', icon: '🧙‍♂️', desc: 'Equation Caster' },
                { id: 'paladin', name: 'Paladin', icon: '🛡️', desc: 'Kinetic Defender' },
                { id: 'alchemist', name: 'Alchemist', icon: '🧪', desc: 'Formula Brewer' },
                { id: 'rogue', name: 'Scribe', icon: '📜', desc: 'Syntax Master' },
              ].map((av) => {
                const isSelected = avatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => {
                      sounds.playClick();
                      setAvatar(av.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-3xl mb-1">{av.icon}</div>
                    <div className="text-xs font-bold text-slate-100">{av.name}</div>
                    <div className="text-[10px] text-slate-400">{av.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: READY */}
        {step === 5 && (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 border-2 border-amber-300">
              {avatar === 'mage' && '🧙‍♂️'}
              {avatar === 'paladin' && '🛡️'}
              {avatar === 'alchemist' && '🧪'}
              {avatar === 'rogue' && '📜'}
            </div>
            <div>
              <h2 className="font-rpg text-2xl font-black text-amber-400">
                Your Adventure Begins!
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Hail, <span className="font-bold text-white">{name}</span>! Your starting quest: 30 minutes of deep study to claim your first bounty.
              </p>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => {
                sounds.playClick();
                setStep(step - 1);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => {
                sounds.playClick();
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              Enter The Kingdom <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
