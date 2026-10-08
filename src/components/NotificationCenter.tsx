import React from 'react';
import { X, Bell, Trash2, ArrowRight, ShieldAlert, Zap, Flame, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotification, setActiveView } = useGame();

  if (!isOpen) return null;

  const handleAction = (notifId: string, view?: string) => {
    sounds.playClick();
    markNotificationRead(notifId);
    if (view) {
      setActiveView(view as any);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-rpg text-base font-bold text-slate-100">Study Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              All quiet across the realms. No pending alerts.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                    : 'bg-slate-800/90 border-slate-700/80 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notif.type === 'boss' && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
                    {notif.type === 'quest' && <Zap className="w-4 h-4 text-amber-400 shrink-0" />}
                    {notif.type === 'streak' && <Flame className="w-4 h-4 text-orange-400 shrink-0" />}
                    {notif.type === 'level' && <Award className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-snug">{notif.message}</p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/50 text-[10px]">
                  <span className="text-slate-500">{notif.timestamp}</span>
                  {notif.actionView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(notif.id, notif.actionView);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Take Action <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
