import type { GameAchievement } from '@/types/games';

interface AchievementCheckParams {
  score: number;
  timeElapsed: number;
  streak: number;
  accuracy: number;
  difficulty: number;
  subject: string;
}

export class GameRewards {
  private static achievements: GameAchievement[] = [
    {
      id: 'first_game',
      name: 'First Steps',
      description: 'Complete your first game',
      icon: '🎮',
      condition: 'complete_game',
      xpReward: 50,
      rarity: 'common',
    },
    {
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Achieve 100% accuracy',
      icon: '💯',
      condition: 'accuracy_100',
      xpReward: 200,
      rarity: 'rare',
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a game in under 2 minutes',
      icon: '⚡',
      condition: 'time_under_120',
      xpReward: 150,
      rarity: 'rare',
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Achieve a 20+ answer streak',
      icon: '🔥',
      condition: 'streak_20',
      xpReward: 100,
      rarity: 'uncommon',
    },
    {
      id: 'chemistry_expert',
      name: 'Chemistry Expert',
      description: 'Complete 10 chemistry games',
      icon: '⚗️',
      condition: 'chemistry_games_10',
      xpReward: 300,
      rarity: 'epic',
    },
    {
      id: 'physics_master',
      name: 'Physics Master',
      description: 'Complete 10 physics games',
      icon: '⚛️',
      condition: 'physics_games_10',
      xpReward: 300,
      rarity: 'epic',
    },
    {
      id: 'biology_genius',
      name: 'Biology Genius',
      description: 'Complete 10 biology games',
      icon: '🧬',
      condition: 'biology_games_10',
      xpReward: 300,
      rarity: 'epic',
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Score over 1000 points in a single game',
      icon: '🏆',
      condition: 'score_1000',
      xpReward: 250,
      rarity: 'rare',
    },
    {
      id: 'no_hints',
      name: 'Self Reliant',
      description: 'Complete a game without using hints',
      icon: '🧠',
      condition: 'no_hints_used',
      xpReward: 100,
      rarity: 'uncommon',
    },
    {
      id: 'legendary_player',
      name: 'Legendary Player',
      description: 'Complete 50 games across all subjects',
      icon: '👑',
      condition: 'total_games_50',
      xpReward: 1000,
      rarity: 'legendary',
    },
  ];

  static calculateXP(score: GameScore, difficulty: number): number {
    const baseXP = Math.floor(score.total / 10);
    const difficultyBonus = difficulty * 10;
    const timeBonus = Math.floor(score.timeBonus / 5);
    const streakBonus = Math.floor(score.streakBonus / 2);
    
    return baseXP + difficultyBonus + timeBonus + streakBonus;
  }

  static checkAchievements(params: AchievementCheckParams): GameAchievement[] {
    const unlockedAchievements: GameAchievement[] = [];

    // Check each achievement condition
    for (const achievement of this.achievements) {
      if (this.checkAchievementCondition(achievement, params)) {
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  private static checkAchievementCondition(
    achievement: GameAchievement, 
    params: AchievementCheckParams
  ): boolean {
    switch (achievement.condition) {
      case 'complete_game':
        return true; // Always unlocked on game completion
      
      case 'accuracy_100':
        return params.accuracy >= 100;
      
      case 'time_under_120':
        return params.timeElapsed < 120;
      
      case 'streak_20':
        return params.streak >= 20;
      
      case 'score_1000':
        return params.score >= 1000;
      
      case 'no_hints_used':
        // This would need to be passed in params
        return true; // Placeholder
      
      // Subject-specific achievements would need game history
      case 'chemistry_games_10':
      case 'physics_games_10':
      case 'biology_games_10':
      case 'total_games_50':
        return false; // Would need to check user's game history
      
      default:
        return false;
    }
  }

  static getAchievementRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  static getAchievementRarityBg(rarity: string): string {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-green-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  }

  static getAllAchievements(): GameAchievement[] {
    return this.achievements;
  }

  static getAchievementById(id: string): GameAchievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }
}