import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Badge, 
  UserAchievement, 
  EXPERIMENT_BADGES, 
  PERFORMANCE_BADGES, 
  SPECIAL_BADGES,
  XP_REWARDS,
  LEVEL_PROGRESSION,
  DigitalCertificate,
  LeaderboardEntry
} from '@/types/gamification';

// Get user badges
export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Transform database records to Badge objects
      const badges: Badge[] = data.map(achievement => {
        // Find the badge definition
        let badgeDefinition;
        if (achievement.achievement_type.startsWith('experiment_')) {
          const experimentSlug = achievement.achievement_type.replace('experiment_', '');
          badgeDefinition = EXPERIMENT_BADGES[experimentSlug];
        } else if (achievement.achievement_type.startsWith('performance_')) {
          const performanceType = achievement.achievement_type.replace('performance_', '');
          badgeDefinition = PERFORMANCE_BADGES[performanceType];
        } else if (achievement.achievement_type.startsWith('special_')) {
          const specialType = achievement.achievement_type.replace('special_', '');
          badgeDefinition = SPECIAL_BADGES[specialType];
        }
        
        if (!badgeDefinition) {
          // Fallback for unknown badges
          return {
            id: achievement.id,
            name: achievement.achievement_name,
            description: achievement.description || 'Achievement unlocked',
            requirements: [],
            xpReward: achievement.xp_awarded,
            rarity: 'common',
            unlockedAt: new Date(achievement.earned_at)
          };
        }
        
        return {
          id: achievement.id,
          name: badgeDefinition.name,
          description: badgeDefinition.description,
          iconUrl: badgeDefinition.iconUrl,
          requirements: badgeDefinition.requirements,
          xpReward: badgeDefinition.xpReward,
          rarity: badgeDefinition.rarity,
          unlockedAt: new Date(achievement.earned_at)
        };
      });
      
      return badges;
    },
    enabled: !!userId,
  });
}

// Award a badge to a user
export function useAwardBadge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      badgeId: string;
      experimentId?: string;
    }) => {
      const { userId, badgeId, experimentId } = params;
      
      // Determine badge type and details
      let badgeDetails;
      let achievementType;
      
      if (badgeId in EXPERIMENT_BADGES) {
        badgeDetails = EXPERIMENT_BADGES[badgeId];
        achievementType = `experiment_${badgeId}`;
      } else if (badgeId in PERFORMANCE_BADGES) {
        badgeDetails = PERFORMANCE_BADGES[badgeId];
        achievementType = `performance_${badgeId}`;
      } else if (badgeId in SPECIAL_BADGES) {
        badgeDetails = SPECIAL_BADGES[badgeId];
        achievementType = `special_${badgeId}`;
      } else {
        throw new Error(`Unknown badge ID: ${badgeId}`);
      }
      
      // Create achievement record
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: achievementType,
          achievement_name: badgeDetails.name,
          description: badgeDetails.description,
          xp_awarded: badgeDetails.xpReward,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update user XP
      await supabase
        .from('profiles')
        .update({
          xp: supabase.rpc('increment_xp', { amount: badgeDetails.xpReward })
        })
        .eq('id', userId);
      
      return {
        ...badgeDetails,
        id: data.id,
        unlockedAt: new Date(data.earned_at)
      } as Badge;
    },
    onSuccess: (badge, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] });
      
      // Show toast notification
      toast.success(`Achievement Unlocked: ${badge.name}!`, {
        description: badge.description,
      });
    },
  });
}

// Award XP to a user
export function useAwardXP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      amount: number;
      category: string;
      description?: string;
    }) => {
      const { userId, amount, category, description } = params;
      
      // Update user XP
      const { data, error } = await supabase
        .from('profiles')
        .update({
          xp: supabase.rpc('increment_xp', { amount })
        })
        .eq('id', userId)
        .select('xp')
        .single();
        
      if (error) throw error;
      
      return {
        newXP: data.xp,
        amount,
        category,
        description
      };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] });
      
      // Show toast notification
      toast.success(`+${result.amount} XP`, {
        description: result.description || `Earned from ${result.category}`,
      });
    },
  });
}

// Get user level and progress
export function useUserLevel(userId: string) {
  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
  
  const calculateLevel = (xp: number) => {
    const levels = Object.values(LEVEL_PROGRESSION);
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const [min, max] = level.xpRange;
      
      if (xp >= min && xp <= max) {
        return {
          level: i + 1,
          name: level.name,
          currentXP: xp,
          minXP: min,
          maxXP: max,
          nextLevelXP: max + 1,
          xpToNextLevel: max - xp + 1,
          progress: ((xp - min) / (max - min)) * 100
        };
      }
    }
    
    // If XP exceeds all defined levels, use the highest level
    const highestLevel = levels[levels.length - 1];
    return {
      level: levels.length,
      name: highestLevel.name,
      currentXP: xp,
      minXP: highestLevel.xpRange[0],
      maxXP: Infinity,
      nextLevelXP: Infinity,
      xpToNextLevel: Infinity,
      progress: 100
    };
  };
  
  return profile ? calculateLevel(profile.xp) : null;
}

// Get leaderboard data
export function useLeaderboard(category: string, timeframe: string) {
  return useQuery({
    queryKey: ['leaderboard', category, timeframe],
    queryFn: async () => {
      // In a real implementation, this would fetch from a leaderboard table
      // For now, we'll return mock data
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `entry-${i}`,
        userId: `user-${i}`,
        displayName: `User ${i + 1}`,
        avatarUrl: i % 3 === 0 ? `https://i.pravatar.cc/150?u=${i}` : undefined,
        score: Math.floor(Math.random() * 5000) + 1000,
        rank: i + 1,
        category,
        timeframe,
        subject: category.includes('chemistry') ? 'chemistry' : 
                 category.includes('physics') ? 'physics' : 
                 category.includes('biology') ? 'biology' : undefined
      }));
      
      return mockLeaderboard.sort((a, b) => b.score - a.score);
    },
  });
}

// Generate a certificate
export function useGenerateCertificate() {
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      experimentId: string;
      certificateType: 'completion' | 'mastery' | 'excellence';
      performanceData: {
        score: number;
        timeCompleted: number;
        safetyCompliance: boolean;
        collaborationRating?: number;
      };
    }) => {
      const { userId, experimentId, certificateType, performanceData } = params;
      
      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // In a real implementation, this would save to the certificates table
      // For now, we'll just return the certificate object
      const certificate: DigitalCertificate = {
        id: crypto.randomUUID(),
        userId,
        experimentId,
        certificateType,
        issueDate: new Date(),
        performanceData,
        metadata: {
          verificationCode,
        }
      };
      
      return certificate;
    },
  });
}

// Check for achievements based on user actions
export function useCheckAchievements() {
  const awardBadge = useAwardBadge();
  const awardXP = useAwardXP();
  
  const checkExperimentCompletion = async (
    userId: string, 
    experimentId: string, 
    experimentData: any
  ) => {
    // Check for experiment-specific badges
    const experimentSlug = experimentData.slug;
    if (experimentSlug && EXPERIMENT_BADGES[experimentSlug]) {
      const badgeId = experimentSlug;
      const badge = EXPERIMENT_BADGES[experimentSlug];
      
      // Check if requirements are met
      const requirementsMet = badge.requirements.every(req => {
        if (req.type === 'complete_experiment') {
          return req.value === experimentSlug;
        }
        if (req.type === 'safety_compliance') {
          return experimentData.safetyCompliance === req.value;
        }
        if (req.type === 'accuracy') {
          return (experimentData.accuracy || 0) >= req.value;
        }
        // Add more requirement checks as needed
        return false;
      });
      
      if (requirementsMet) {
        // Award the badge
        await awardBadge.mutateAsync({
          userId,
          badgeId,
          experimentId
        });
      }
    }
    
    // Check for first experiment completion
    if (experimentData.isFirstExperiment) {
      await awardBadge.mutateAsync({
        userId,
        badgeId: 'first-steps'
      });
    }
    
    // Award XP based on experiment difficulty
    const difficultyKey = `difficulty${experimentData.difficulty}` as keyof typeof XP_REWARDS.EXPERIMENT_COMPLETE;
    const xpAmount = XP_REWARDS.EXPERIMENT_COMPLETE[difficultyKey] || 50;
    
    await awardXP.mutateAsync({
      userId,
      amount: xpAmount,
      category: 'Experiment Completion',
      description: `Completed ${experimentData.title}`
    });
  };
  
  const checkAssessmentCompletion = async (
    userId: string,
    assessmentData: any
  ) => {
    // Check for perfect score
    if (assessmentData.percentage === 100) {
      await awardBadge.mutateAsync({
        userId,
        badgeId: 'perfect-score'
      });
    }
    
    // Award XP based on assessment type and score
    const assessmentType = assessmentData.assessmentType as keyof typeof XP_REWARDS.PERFECT_QUIZ;
    const baseXP = XP_REWARDS.PERFECT_QUIZ[assessmentType] || 25;
    const scoreMultiplier = assessmentData.percentage / 100;
    const xpAmount = Math.round(baseXP * scoreMultiplier);
    
    await awardXP.mutateAsync({
      userId,
      amount: xpAmount,
      category: 'Assessment Completion',
      description: `Scored ${assessmentData.percentage}% on ${assessmentData.title}`
    });
  };
  
  const checkGameCompletion = async (
    userId: string,
    gameData: any
  ) => {
    // Determine performance tier
    let tier: keyof typeof XP_REWARDS.GAME_SCORES = 'bronze';
    if (gameData.percentile >= 90) {
      tier = 'gold';
    } else if (gameData.percentile >= 75) {
      tier = 'silver';
    }
    
    // Award XP based on game performance
    const xpAmount = XP_REWARDS.GAME_SCORES[tier];
    
    await awardXP.mutateAsync({
      userId,
      amount: xpAmount,
      category: 'Game Completion',
      description: `Scored ${gameData.score} in ${gameData.title}`
    });
  };
  
  return {
    checkExperimentCompletion,
    checkAssessmentCompletion,
    checkGameCompletion
  };
}

// Custom hook for gamification notifications
export function useGamificationNotifications(userId: string) {
  const [notifications, setNotifications] = useState<{
    badges: Badge[];
    levelUps: { oldLevel: number; newLevel: number }[];
  }>({
    badges: [],
    levelUps: []
  });
  
  const clearNotifications = () => {
    setNotifications({ badges: [], levelUps: [] });
  };
  
  const addBadgeNotification = (badge: Badge) => {
    setNotifications(prev => ({
      ...prev,
      badges: [...prev.badges, badge]
    }));
  };
  
  const addLevelUpNotification = (oldLevel: number, newLevel: number) => {
    setNotifications(prev => ({
      ...prev,
      levelUps: [...prev.levelUps, { oldLevel, newLevel }]
    }));
  };
  
  // Listen for new achievements
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('user-achievements')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Create a badge notification
        const achievement = payload.new;
        
        // Find badge details
        let badgeDetails;
        if (achievement.achievement_type.startsWith('experiment_')) {
          const experimentSlug = achievement.achievement_type.replace('experiment_', '');
          badgeDetails = EXPERIMENT_BADGES[experimentSlug];
        } else if (achievement.achievement_type.startsWith('performance_')) {
          const performanceType = achievement.achievement_type.replace('performance_', '');
          badgeDetails = PERFORMANCE_BADGES[performanceType];
        } else if (achievement.achievement_type.startsWith('special_')) {
          const specialType = achievement.achievement_type.replace('special_', '');
          badgeDetails = SPECIAL_BADGES[specialType];
        }
        
        if (badgeDetails) {
          addBadgeNotification({
            ...badgeDetails,
            id: achievement.id,
            unlockedAt: new Date(achievement.earned_at)
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  // Listen for level changes
  useEffect(() => {
    if (!userId) return;
    
    let previousLevel: number | null = null;
    
    const channel = supabase
      .channel('user-profile')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        const profile = payload.new;
        
        // Calculate level from XP
        const calculateLevel = (xp: number) => {
          const levels = Object.values(LEVEL_PROGRESSION);
          for (let i = 0; i < levels.length; i++) {
            const [min, max] = levels[i].xpRange;
            if (xp >= min && xp <= max) {
              return i + 1;
            }
          }
          return levels.length; // Max level
        };
        
        const currentLevel = calculateLevel(profile.xp);
        
        // Check if level increased
        if (previousLevel !== null && currentLevel > previousLevel) {
          addLevelUpNotification(previousLevel, currentLevel);
        }
        
        previousLevel = currentLevel;
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return {
    notifications,
    clearNotifications,
    addBadgeNotification,
    addLevelUpNotification
  };
}