import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserBadges, useUserLevel, useGamificationNotifications } from '@/hooks/useGamification';
import { AchievementPopup } from './AchievementPopup';
import { LevelUpModal } from './LevelUpModal';
import type { Badge } from '@/types/gamification';

interface GamificationContextType {
  badges: Badge[];
  unlockedBadgeIds: string[];
  level: number | null;
  levelName: string | null;
  currentXP: number;
  nextLevelXP: number;
  xpProgress: number;
  isLoading: boolean;
}

const GamificationContext = createContext<GamificationContextType>({
  badges: [],
  unlockedBadgeIds: [],
  level: null,
  levelName: null,
  currentXP: 0,
  nextLevelXP: 0,
  xpProgress: 0,
  isLoading: true,
});

export const useGamification = () => useContext(GamificationContext);

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { data: badges, isLoading: isLoadingBadges } = useUserBadges(user?.id || '');
  const levelInfo = useUserLevel(user?.id || '');
  const { notifications, clearNotifications } = useGamificationNotifications(user?.id || '');
  
  const [currentBadgePopup, setCurrentBadgePopup] = useState<Badge | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  
  // Process notifications
  useEffect(() => {
    if (notifications.badges.length > 0) {
      // Show the first badge notification
      setCurrentBadgePopup(notifications.badges[0]);
      
      // Remove the shown notification
      const updatedBadges = [...notifications.badges];
      updatedBadges.shift();
      clearNotifications();
    }
    
    if (notifications.levelUps.length > 0) {
      // Show the level up modal
      setLevelUpInfo(notifications.levelUps[0]);
      setShowLevelUpModal(true);
      
      // Remove the shown notification
      clearNotifications();
    }
  }, [notifications]);
  
  const handleBadgePopupClose = () => {
    setCurrentBadgePopup(null);
  };
  
  const handleLevelUpModalClose = () => {
    setShowLevelUpModal(false);
    setLevelUpInfo(null);
  };
  
  const contextValue: GamificationContextType = {
    badges: badges || [],
    unlockedBadgeIds: (badges || []).map(badge => badge.id),
    level: levelInfo?.level || null,
    levelName: levelInfo?.name || null,
    currentXP: levelInfo?.currentXP || 0,
    nextLevelXP: levelInfo?.nextLevelXP || 0,
    xpProgress: levelInfo?.progress || 0,
    isLoading: isLoadingBadges || !isAuthenticated,
  };
  
  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
      
      {/* Badge popup */}
      {currentBadgePopup && (
        <AchievementPopup
          badge={currentBadgePopup}
          onClose={handleBadgePopupClose}
        />
      )}
      
      {/* Level up modal */}
      {showLevelUpModal && levelUpInfo && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          onClose={handleLevelUpModalClose}
          oldLevel={levelUpInfo.oldLevel}
          newLevel={levelUpInfo.newLevel}
          userName={user?.display_name}
        />
      )}
    </GamificationContext.Provider>
  );
}