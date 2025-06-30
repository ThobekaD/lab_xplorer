export interface BaseGame {
  id: string;
  title: string;
  description: string;
  subject: 'chemistry' | 'physics' | 'biology';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number; // minutes
  maxScore: number;
  thumbnail: string;
  gameType: string;
  instructions: string[];
  learningObjectives: string[];
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  timeBonus: number;
  streakBonus: number;
  accuracyBonus: number;
  totalXP: number;
  isCompleted: boolean;
  gameData: any;
  achievements: string[];
}

export interface GameScore {
  basePoints: number;
  timeBonus: number;
  streakBonus: number;
  accuracyBonus: number;
  difficultyMultiplier: number;
  total: number;
}

export interface GameLeaderboard {
  userId: string;
  username: string;
  avatar: string;
  score: number;
  timeCompleted: number;
  accuracy: number;
  rank: number;
  gameId: string;
  subject: string;
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Chemistry Game Types
export interface PeriodicTableCard {
  element: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface ChemicalEquation {
  id: string;
  reactants: string[];
  products: string[];
  coefficients: number[];
  isBalanced: boolean;
  difficulty: number;
}

export interface MolecularGeometry {
  id: string;
  formula: string;
  geometry: string;
  bondAngles: number[];
  electronPairs: number;
  shape3D: any;
}

// Physics Game Types
export interface CircuitComponent {
  id: string;
  type: 'battery' | 'resistor' | 'wire' | 'switch' | 'bulb';
  value?: number;
  position: { x: number; y: number };
  connections: string[];
  isActive: boolean;
}

export interface WaveSource {
  id: string;
  frequency: number;
  amplitude: number;
  phase: number;
  position: { x: number; y: number };
  isActive: boolean;
}

export interface OpticsElement {
  id: string;
  type: 'mirror' | 'lens' | 'prism' | 'screen';
  position: { x: number; y: number };
  angle: number;
  focalLength?: number;
  refractiveIndex?: number;
}

// Biology Game Types
export interface Chromosome {
  id: string;
  type: 'maternal' | 'paternal';
  genes: string[];
  position: { x: number; y: number };
  isPaired: boolean;
}

export interface DNABase {
  id: string;
  type: 'A' | 'T' | 'G' | 'C';
  position: number;
  isPaired: boolean;
  pairWith?: string;
}

export interface EcosystemOrganism {
  id: string;
  species: string;
  trophicLevel: number;
  population: number;
  energyRequirement: number;
  reproductionRate: number;
  position: { x: number; y: number };
}

export interface GameState {
  currentLevel: number;
  score: number;
  timeRemaining: number;
  streak: number;
  lives: number;
  hintsUsed: number;
  isGameActive: boolean;
  isPaused: boolean;
  gameSpecificData: any;
}