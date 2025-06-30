import type { GameScore } from '@/types/games';

interface ScoreCalculationParams {
  baseScore: number;
  timeRemaining: number;
  totalTime: number;
  streak: number;
  hintsUsed: number;
  difficulty: number;
  accuracy: number;
}

export class GameScorer {
  static calculateFinalScore(params: ScoreCalculationParams): GameScore {
    const {
      baseScore,
      timeRemaining,
      totalTime,
      streak,
      hintsUsed,
      difficulty,
      accuracy
    } = params;

    // Time bonus: up to 25% of base score for completing quickly
    const timePercentage = timeRemaining / totalTime;
    const timeBonus = Math.floor(baseScore * 0.25 * timePercentage);

    // Streak bonus: 5 points per streak milestone
    const streakBonus = Math.floor(streak / 5) * 5 * difficulty;

    // Accuracy bonus: up to 20% of base score for high accuracy
    const accuracyBonus = Math.floor(baseScore * 0.2 * (accuracy / 100));

    // Difficulty multiplier
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;

    // Hint penalty: -10% per hint used
    const hintPenalty = hintsUsed * 0.1;

    const subtotal = (baseScore + timeBonus + streakBonus + accuracyBonus) * difficultyMultiplier;
    const total = Math.floor(subtotal * (1 - hintPenalty));

    return {
      basePoints: baseScore,
      timeBonus,
      streakBonus,
      accuracyBonus,
      difficultyMultiplier,
      total: Math.max(0, total),
    };
  }

  static calculateStreakMultiplier(streak: number): number {
    if (streak < 5) return 1;
    if (streak < 10) return 1.2;
    if (streak < 20) return 1.5;
    return 2.0;
  }

  static calculateTimeBonus(timeRemaining: number, totalTime: number, baseScore: number): number {
    const timePercentage = timeRemaining / totalTime;
    if (timePercentage > 0.8) return Math.floor(baseScore * 0.25);
    if (timePercentage > 0.6) return Math.floor(baseScore * 0.15);
    if (timePercentage > 0.4) return Math.floor(baseScore * 0.1);
    return 0;
  }

  static calculateAccuracyBonus(correctAnswers: number, totalAnswers: number, baseScore: number): number {
    if (totalAnswers === 0) return 0;
    
    const accuracy = correctAnswers / totalAnswers;
    if (accuracy >= 0.95) return Math.floor(baseScore * 0.2);
    if (accuracy >= 0.85) return Math.floor(baseScore * 0.15);
    if (accuracy >= 0.75) return Math.floor(baseScore * 0.1);
    return 0;
  }

  static getScoreRank(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 95) return 'S+';
    if (percentage >= 90) return 'S';
    if (percentage >= 85) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    return 'D';
  }

  static getScoreColor(rank: string): string {
    switch (rank) {
      case 'S+': return 'text-purple-600';
      case 'S': return 'text-yellow-600';
      case 'A+': case 'A': return 'text-green-600';
      case 'B+': case 'B': return 'text-blue-600';
      case 'C+': case 'C': return 'text-orange-600';
      default: return 'text-red-600';
    }
  }
}