import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserAchievements, 
  awardAchievement, 
  recordGameScore, 
  getLeaderboard 
} from '@/lib/supabase';
import { Inserts } from '@/lib/supabase';

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: () => getUserAchievements(userId),
    select: (data) => data.data,
    enabled: !!userId,
  });
}

export function useAwardAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (achievementData: Inserts<'user_achievements'>) => awardAchievement(achievementData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements', variables.user_id] });
    },
  });
}

export function useRecordGameScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scoreData: Inserts<'game_scores'>) => recordGameScore(scoreData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useLeaderboard(subject?: 'physics' | 'chemistry' | 'biology', limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', subject, limit],
    queryFn: () => getLeaderboard(subject, limit),
    select: (data) => data.data,
  });
}