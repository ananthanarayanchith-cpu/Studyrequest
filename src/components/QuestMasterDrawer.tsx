import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Compass,
  Calendar,
  HelpCircle,
  Flame,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const QuestMasterDrawer: React.FC = () => {
  const { isQuestMasterOpen, closeQuestMaster, profile, subjects, openStudyTimer, setActiveView } = useGame();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Greetings, ${profile.name}! I am your Quest Master. Whether you face an upcoming exam trial, need complex formulas simplified, or seek guidance on your next best move, I am at your service. What realm shall we conquer today?`,
      timestamp: 'Now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isQuestMasterOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isQuestMasterOpen]);

  if (!isQuestMasterOpen) return null;

  const quickPrompts = [
    { label: '📅 3-Day Exam Campaign', prompt: 'I have an upcoming exam in 3 days. Please build a strategic 3-day study campaign.' },
    { label: '🎯 What should I study today?', prompt: 'Based on my current level and weak topics, what should I study today?' },
    { label: '🔬 Explain Newton’s Laws', prompt: 'I am struggling with Newton’s Laws of Motion and friction. Can you break them down intuitively?' },
    { label: '⚡ Fast Formula Review', prompt: 'Give me a fast formula cheat sheet for my upcoming physics and math trials.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    sounds.playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const studentState = {
        name: profile.name,
        level: profile.level,
        rank: profile.title,
        coins: profile.coins,
        streak: profile.streak,
        weakTopics: profile.weakTopics,
        strongSubjects: profile.strongSubjects,
      };

      const res = await fetch('/api/quest-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, studentState }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.response || 'May the knowledge of the ancients guide you!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Knowledge is your greatest shield, ${profile.name}. Focus on your current weak area: "${profile.weakTopics[0] || 'Core concepts'}" with a 25-minute Pomodoro session today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-rpg text-base sm:text-lg font-bold text-amber-400">Quest Master</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  AI Mentor
                </span>
              </div>
              <p className="text-xs text-slate-400">Academic strategist & exam tactician</p>
            </div>
          </div>

          <button
            onClick={closeQuestMaster}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Character Context Bar */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {profile.name} (LVL {profile.level})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-rose-400 flex items-center gap-1 font-mono">
              <Flame className="w-3 h-3 fill-rose-500" /> {profile.streak}d streak
            </span>
            <span className="text-amber-400 font-mono">{profile.coins} Gold</span>
          </div>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/40 text-xs font-medium transition-all shrink-0 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="animate-pulse">Consulting the ancient archives...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for exam tactics, concept breakdowns, advice..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Study Launcher */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Ready to act on the master's advice?</span>
            <button
              onClick={() => {
                closeQuestMaster();
                openStudyTimer();
              }}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Launch Focus Timer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
