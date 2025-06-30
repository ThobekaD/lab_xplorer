import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target,
  Lightbulb,
  Star,
  Zap
} from 'lucide-react';
import { ChemistryGame } from './subjects/ChemistryGame';
import { PhysicsGame } from './subjects/PhysicsGame';
import { BiologyGame } from './subjects/BiologyGame';
import { GameScorer } from './GameScorer';
import { GameRewards } from './GameRewards';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { BaseGame, GameSession, GameState, GameScore } from '@/types/games';

interface GameEngineProps {
  game: BaseGame;
  onComplete: (session: GameSession) => void;
  onExit: () => void;
}

export function GameEngine({ game, onComplete, onExit }: GameEngineProps) {
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    score: 0,
    timeRemaining: game.estimatedDuration * 60, // Convert to seconds
    streak: 0,
    lives: 3,
    hintsUsed: 0,
    isGameActive: false,
    isPaused: false,
    gameSpecificData: {},
  });

  const [session, setSession] = useState<GameSession>({
    id: crypto.randomUUID(),
    gameId: game.id,
    userId: user?.id || '',
    startTime: new Date(),
    score: 0,
    maxScore: game.maxScore,
    timeBonus: 0,
    streakBonus: 0,
    accuracyBonus: 0,
    totalXP: 0,
    isCompleted: false,
    gameData: {},
    achievements: [],
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isGameActive && !gameState.isPaused && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }

    if (gameState.timeRemaining === 0 && gameState.isGameActive) {
      handleGameEnd();
    }

    return () => clearInterval(interval);
  }, [gameState.isGameActive, gameState.isPaused, gameState.timeRemaining]);

  const startGame = () => {
    setShowInstructions(false);
    setGameState(prev => ({ ...prev, isGameActive: true }));
    setSession(prev => ({ ...prev, startTime: new Date() }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const resetGame = () => {
    setGameState({
      currentLevel: 1,
      score: 0,
      timeRemaining: game.estimatedDuration * 60,
      streak: 0,
      lives: 3,
      hintsUsed: 0,
      isGameActive: false,
      isPaused: false,
      gameSpecificData: {},
    });
    setSession(prev => ({
      ...prev,
      startTime: new Date(),
      score: 0,
      timeBonus: 0,
      streakBonus: 0,
      accuracyBonus: 0,
      totalXP: 0,
      isCompleted: false,
      gameData: {},
      achievements: [],
    }));
    setGameComplete(false);
    setShowInstructions(true);
  };

  const useHint = () => {
    if (gameState.hintsUsed < 3) {
      setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      toast.info('Hint used!', {
        description: 'You have ' + (2 - gameState.hintsUsed) + ' hints remaining.',
      });
    }
  };

  const handleGameAction = useCallback((action: any) => {
    if (!gameState.isGameActive || gameState.isPaused) return;

    // Update game state based on action
    setGameState(prev => {
      const newState = { ...prev };
      
      if (action.type === 'correct_answer') {
        newState.score += action.points || 10;
        newState.streak += 1;
        
        // Streak bonus
        if (newState.streak >= 5) {
          const bonus = Math.floor(newState.streak / 5) * 5;
          newState.score += bonus;
          toast.success(`Streak Bonus! +${bonus} points`, {
            description: `${newState.streak} correct answers in a row!`,
          });
        }
      } else if (action.type === 'wrong_answer') {
        newState.streak = 0;
        newState.lives = Math.max(0, newState.lives - 1);
        
        if (newState.lives === 0) {
          handleGameEnd();
        }
      } else if (action.type === 'level_complete') {
        newState.currentLevel += 1;
        newState.score += 50; // Level completion bonus
        toast.success('Level Complete!', {
          description: `Moving to level ${newState.currentLevel}`,
        });
      }

      return newState;
    });
  }, [gameState.isGameActive, gameState.isPaused]);

  const handleGameEnd = () => {
    setGameState(prev => ({ ...prev, isGameActive: false }));
    
    const endTime = new Date();
    const timeElapsed = (endTime.getTime() - session.startTime.getTime()) / 1000;
    const timeRemaining = gameState.timeRemaining;
    
    // Calculate final score
    const finalScore = GameScorer.calculateFinalScore({
      baseScore: gameState.score,
      timeRemaining,
      totalTime: game.estimatedDuration * 60,
      streak: gameState.streak,
      hintsUsed: gameState.hintsUsed,
      difficulty: game.difficulty,
      accuracy: calculateAccuracy(),
    });

    // Calculate XP reward
    const xpReward = GameRewards.calculateXP(finalScore, game.difficulty);

    // Check for achievements
    const achievements = GameRewards.checkAchievements({
      score: finalScore.total,
      timeElapsed,
      streak: gameState.streak,
      accuracy: calculateAccuracy(),
      difficulty: game.difficulty,
      subject: game.subject,
    });

    const completedSession: GameSession = {
      ...session,
      endTime,
      score: finalScore.total,
      timeBonus: finalScore.timeBonus,
      streakBonus: finalScore.streakBonus,
      accuracyBonus: finalScore.accuracyBonus,
      totalXP: xpReward,
      isCompleted: true,
      gameData: gameState.gameSpecificData,
      achievements: achievements.map(a => a.id),
    };

    setSession(completedSession);
    setGameComplete(true);
    
    // Show achievements
    achievements.forEach(achievement => {
      toast.success(`Achievement Unlocked: ${achievement.name}!`, {
        description: achievement.description,
      });
    });

    onComplete(completedSession);
  };

  const calculateAccuracy = (): number => {
    const totalAttempts = gameState.gameSpecificData.totalAttempts || 1;
    const correctAnswers = gameState.gameSpecificData.correctAnswers || 0;
    return (correctAnswers / totalAttempts) * 100;
  };

  const renderGameContent = () => {
    const commonProps = {
      gameState,
      onGameAction: handleGameAction,
      onUseHint: useHint,
    };

    switch (game.subject) {
      case 'chemistry':
        return <ChemistryGame game={game} {...commonProps} />;
      case 'physics':
        return <PhysicsGame game={game} {...commonProps} />;
      case 'biology':
        return <BiologyGame game={game} {...commonProps} />;
      default:
        return <div>Game not implemented</div>;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showInstructions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              {game.title}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{game.subject}</Badge>
              <Badge variant="outline">Difficulty {game.difficulty}</Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {game.estimatedDuration} min
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{game.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="space-y-1">
                {game.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">{index + 1}.</span>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Learning Objectives</h3>
              <ul className="space-y-1">
                {game.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-600">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button onClick={startGame} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
              <Button onClick={onExit} variant="outline" className="flex-1">
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{session.score}</div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{session.totalXP}</div>
                <div className="text-sm text-gray-500">XP Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{gameState.streak}</div>
                <div className="text-sm text-gray-500">Best Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{calculateAccuracy().toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>

            {session.achievements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Achievements Unlocked</h3>
                <div className="flex flex-wrap gap-2">
                  {session.achievements.map((achievementId, index) => (
                    <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Achievement {index + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button onClick={resetGame} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onExit} variant="outline" className="flex-1">
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                {game.title}
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline">{game.subject}</Badge>
                <Badge variant="outline">Level {gameState.currentLevel}</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={useHint}
                disabled={gameState.hintsUsed >= 3}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({3 - gameState.hintsUsed})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={pauseGame}
                disabled={!gameState.isGameActive}
              >
                {gameState.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
              >
                Exit
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatTime(gameState.timeRemaining)}</div>
              <div className="text-sm text-gray-500">Time Left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{gameState.streak}</div>
              <div className="text-sm text-gray-500">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{gameState.lives}</div>
              <div className="text-sm text-gray-500">Lives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{gameState.currentLevel}</div>
              <div className="text-sm text-gray-500">Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round((gameState.score / game.maxScore) * 100)}%</span>
            </div>
            <Progress value={(gameState.score / game.maxScore) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Game Paused Overlay */}
      <AnimatePresence>
        {gameState.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="w-96">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-4">Game Paused</h3>
                <Button onClick={pauseGame} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Resume Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content */}
      <div className="min-h-[600px]">
        {renderGameContent()}
      </div>
    </div>
  );
}