/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navigation } from './components/Navigation';
import { LevelUpModal } from './components/LevelUpModal';
import { XpGainToast } from './components/XpGainToast';
import { StudyTimerModal } from './components/StudyTimerModal';
import { QuestMasterDrawer } from './components/QuestMasterDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationCenter } from './components/NotificationCenter';

import { HomeDashboard } from './views/HomeDashboard';
import { StudyWorldView } from './views/StudyWorldView';
import { QuestsView } from './views/QuestsView';
import { SubjectsView } from './views/SubjectsView';
import { QuizArenaView } from './views/QuizArenaView';
import { ProfileView } from './views/ProfileView';

const MainLayout: React.FC = () => {
  const { activeView, notifications } = useGame();
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navigation
        onOpenNotifications={() => setIsNotifsOpen(true)}
        unreadCount={unreadNotifsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 pb-20 md:pb-10 pt-4 md:pt-8 px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto overflow-y-auto">
        {activeView === 'home' && <HomeDashboard />}
        {activeView === 'world' && <StudyWorldView />}
        {activeView === 'quests' && <QuestsView />}
        {activeView === 'subjects' && <SubjectsView />}
        {activeView === 'arena' && <QuizArenaView />}
        {activeView === 'profile' && <ProfileView />}
      </main>

      {/* Overlays and Modals */}
      <LevelUpModal />
      <XpGainToast />
      <StudyTimerModal />
      <QuestMasterDrawer />
      <OnboardingModal />
      <NotificationCenter isOpen={isNotifsOpen} onClose={() => setIsNotifsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}
