import { Tables } from '@/lib/supabase';

export interface XPReward {
  category: string;
  basePoints: number;
  multiplier?: number;
  description: string;
}

export const XP_REWARDS = {
  // Experiment Completion (based on difficulty 1-5)
  EXPERIMENT_COMPLETE: {
    difficulty1: 50,   // Middle school experiments
    difficulty2: 75,   // 
    difficulty3: 100,  // High school experiments
    difficulty4: 150,  // 
    difficulty5: 200,  // College experiments
  },
  
  // Assessment Performance
  PERFECT_QUIZ: {
    prelab: 25,     // Perfect pre-lab assessment
    postlab: 50,    // Perfect post-lab assessment
    checkpoint: 35, // Perfect checkpoint quiz
  },
  
  // Game Performance
  GAME_SCORES: {
    bronze: 10,   // Top 50% in educational games
    silver: 25,   // Top 25% in educational games
    gold: 50,     // Top 10% in educational games
  },
  
  // Collaboration & Social
  COLLABORATION: {
    session_join: 20,        // Join collaborative lab session
    session_complete: 50,    // Complete collaborative experiment
    help_peer: 15,          // Answer peer question
    mentor_session: 40,     // Lead mentoring session
  },
  
  // Special Bonuses
  DISCOVERY_BONUS: {
    creative_approach: 100,  // Use creative problem-solving
    error_recovery: 75,      // Successfully recover from mistakes
    efficiency: 150,         // Complete under optimal time
    innovation: 500,         // Discover new insights
  }
};

export interface UserLevel {
  name: string;
  xpRequired: number;
  perks: string[];
  unlockedFeatures: string[];
}

export const LEVEL_PROGRESSION = {
  BEGINNER: {
    name: "Laboratory Novice",
    xpRange: [0, 500],
    unlockedExperiments: ["difficulty-1", "difficulty-2"],
    perks: ["Basic experiments", "Guided tutorials", "Safety training"]
  },
  
  INTERMEDIATE: {
    name: "Science Explorer", 
    xpRange: [501, 2000],
    unlockedExperiments: ["difficulty-1", "difficulty-2", "difficulty-3"],
    perks: ["Complex simulations", "Peer collaboration", "Data analysis tools"]
  },
  
  ADVANCED: {
    name: "Research Scientist",
    xpRange: [2001, 5000], 
    unlockedExperiments: ["difficulty-1", "difficulty-2", "difficulty-3", "difficulty-4"],
    perks: ["Research projects", "Mentor privileges", "Custom experiments"]
  },
  
  EXPERT: {
    name: "Laboratory Master",
    xpRange: [5001, Infinity],
    unlockedExperiments: ["all"],
    perks: ["Content creation", "Curriculum design", "Institution partnerships"]
  }
};

export interface MasteryPathway {
  name: string;
  experiments: string[];
}

export interface MasteryTrack {
  subject: string;
  pathways: MasteryPathway[];
}

export const SUBJECT_TRACKS = {
  PHYSICS: {
    pathways: [
      { name: "Mechanics Master", experiments: ["pendulum-period-length", "hookes-law-springs", "archimedes-water-displacement"] },
      { name: "Electricity Expert", experiments: ["simple-electric-circuit", "ohms-law-hs"] },
      { name: "Optics Oracle", experiments: ["refractive-index-glass", "michelson-interferometer", "fourier-optics"] },
      { name: "Quantum Pioneer", experiments: ["radioactive-half-life", "semiconductor-band-gap"] }
    ]
  },
  
  CHEMISTRY: {
    pathways: [
      { name: "Basic Chemistry Champion", experiments: ["baking-soda-volcano", "cabbage-ph-indicator", "liquid-density-column"] },
      { name: "Analytical Ace", experiments: ["acid-base-titration", "flame-tests-metal-ions", "gcms-essential-oils"] },
      { name: "Organic Olympian", experiments: ["esterification-synthesis", "wittig-reaction-synthesis", "diels-alder-cycloaddition"] },
      { name: "Synthesis Specialist", experiments: ["mof-synthesis-hkust1", "computational-chemistry-modeling"] }
    ]
  },
  
  BIOLOGY: {
    pathways: [
      { name: "Cell Biology Specialist", experiments: ["onion-cell-microscopy", "enzyme-action-catalase"] },
      { name: "Genetics Guardian", experiments: ["pcr-dna-amplification", "bioinformatics-phylogenetics"] },
      { name: "Ecology Expert", experiments: ["field-ecology-quadrat-sampling", "leaf-transpiration-bag"] },
      { name: "Molecular Biologist", experiments: ["protein-purification-column-chromatography", "elisa-assay-diagnostics"] }
    ]
  }
};

export interface BadgeRequirement {
  type: string;
  value: any;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  requirements: BadgeRequirement[];
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export const EXPERIMENT_BADGES: Record<string, Omit<Badge, 'id'>> = {
  // Chemistry Badges
  "baking-soda-volcano": {
    name: "Volcano Virtuoso",
    description: "Successfully created a chemical volcano reaction",
    requirements: [
      { type: "complete_experiment", value: "baking-soda-volcano" },
      { type: "safety_compliance", value: true }
    ],
    xpReward: 50,
    rarity: 'common'
  },
  
  "acid-base-titration": {
    name: "Titration Titan", 
    description: "Mastered precise acid-base titration techniques",
    requirements: [
      { type: "complete_experiment", value: "acid-base-titration" },
      { type: "accuracy", value: 95 }
    ],
    xpReward: 100,
    rarity: 'uncommon'
  },
  
  "nmr-spectroscopy-analysis": {
    name: "NMR Navigator",
    description: "Successfully analyzed molecular structure using NMR",
    requirements: [
      { type: "complete_experiment", value: "nmr-spectroscopy-analysis" },
      { type: "structure_identification", value: true }
    ],
    xpReward: 200,
    rarity: 'rare'
  },
  
  // Physics Badges  
  "simple-electric-circuit": {
    name: "Circuit Starter",
    description: "Built your first working electrical circuit",
    requirements: [
      { type: "complete_experiment", value: "simple-electric-circuit" },
      { type: "circuit_functional", value: true }
    ],
    xpReward: 50,
    rarity: 'common'
  },
  
  "michelson-interferometer": {
    name: "Interference Investigator", 
    description: "Mastered precision optical measurements",
    requirements: [
      { type: "complete_experiment", value: "michelson-interferometer" },
      { type: "measurement_precision", value: true }
    ],
    xpReward: 200,
    rarity: 'rare'
  },
  
  // Biology Badges
  "onion-cell-microscopy": {
    name: "Microscopy Master",
    description: "Successfully observed and identified cell structures", 
    requirements: [
      { type: "complete_experiment", value: "onion-cell-microscopy" },
      { type: "structure_identification", value: true }
    ],
    xpReward: 75,
    rarity: 'common'
  },
  
  "pcr-dna-amplification": {
    name: "DNA Detective",
    description: "Successfully amplified DNA using PCR techniques",
    requirements: [
      { type: "complete_experiment", value: "pcr-dna-amplification" },
      { type: "protocol_adherence", value: true }
    ],
    xpReward: 150,
    rarity: 'uncommon'
  }
};

export const PERFORMANCE_BADGES: Record<string, Omit<Badge, 'id'>> = {
  // Core Achievements
  "first-steps": {
    name: "First Steps",
    description: "Completed your first experiment",
    requirements: [
      { type: "complete_any_experiment", value: 1 }
    ],
    xpReward: 100,
    rarity: 'common'
  },
  
  "perfect-score": {
    name: "Perfect Scholar", 
    description: "Achieved 100% on any assessment",
    requirements: [
      { type: "assessment_score", value: 100 }
    ],
    xpReward: 75,
    rarity: 'uncommon'
  },
  
  "speed-demon": {
    name: "Speed Demon",
    description: "Completed experiment under optimal time",
    requirements: [
      { type: "completion_time_under_target", value: true }
    ],
    xpReward: 50,
    rarity: 'uncommon'
  },
  
  "collaborator": {
    name: "Team Player",
    description: "Participated in 10 group lab sessions", 
    requirements: [
      { type: "collaborative_sessions", value: 10 }
    ],
    xpReward: 150,
    rarity: 'rare'
  },
  
  "mentor": {
    name: "Peer Mentor",
    description: "Helped 5 struggling students",
    requirements: [
      { type: "help_peers", value: 5 }
    ],
    xpReward: 200,
    rarity: 'rare'
  },
  
  // Subject-Specific Badges
  "molecule-master": {
    name: "Molecule Master",
    description: "Completed 10 chemistry experiments",
    requirements: [
      { type: "chemistry_experiments", value: 10 }
    ],
    xpReward: 300,
    rarity: 'epic'
  },
  
  "circuit-wizard": {
    name: "Circuit Wizard", 
    description: "Mastered electrical circuit experiments",
    requirements: [
      { type: "physics_circuit_experiments", value: 5 }
    ],
    xpReward: 250,
    rarity: 'rare'
  },
  
  "cell-explorer": {
    name: "Cell Explorer",
    description: "Completed all microscopy experiments",
    requirements: [
      { type: "biology_microscopy_complete", value: true }
    ],
    xpReward: 275,
    rarity: 'epic'
  }
};

export const SPECIAL_BADGES: Record<string, Omit<Badge, 'id'>> = {
  "innovation-award": {
    name: "Innovation Award",
    description: "Created unique experimental approach",
    requirements: [
      { type: "creative_solution", value: true },
      { type: "peer_validation", value: true }
    ],
    xpReward: 500,
    rarity: 'legendary'
  },
  
  "safety-champion": {
    name: "Safety Champion", 
    description: "Perfect safety compliance across all experiments",
    requirements: [
      { type: "safety_violations", value: 0 },
      { type: "experiments_completed", value: 20 }
    ],
    xpReward: 400,
    rarity: 'epic'
  },
  
  "global-citizen": {
    name: "Global Citizen",
    description: "Completed experiments in multiple languages",
    requirements: [
      { type: "languages_used", value: 3 }
    ],
    xpReward: 350,
    rarity: 'epic'
  },
  
  "teaching-assistant": {
    name: "Teaching Assistant",
    description: "Helped design new experiment variations",
    requirements: [
      { type: "content_contribution", value: true },
      { type: "educator_approval", value: true }
    ],
    xpReward: 600,
    rarity: 'legendary'
  }
};

export interface DigitalCertificate {
  id: string;
  userId: string;
  experimentId: string;
  certificateType: 'completion' | 'mastery' | 'excellence';
  issueDate: Date;
  performanceData: {
    score: number;
    timeCompleted: number;
    safetyCompliance: boolean;
    collaborationRating?: number;
  };
  metadata: {
    institutionName?: string;
    educatorSignature?: string;
    verificationCode: string;
  };
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  timeframe: 'weekly' | 'monthly' | 'semester' | 'annual';
  subject?: string;
  criteria: string;
}

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  { id: 'weekly-speed', name: "Weekly Speed Champions", timeframe: "weekly", criteria: "fastest_completion" },
  { id: 'monthly-knowledge', name: "Monthly Knowledge Masters", timeframe: "monthly", criteria: "assessment_scores" },
  { id: 'weekly-collaboration', name: "Collaboration Champions", timeframe: "weekly", criteria: "peer_helping" },
  { id: 'chemistry-specialists', name: "Subject Specialists - Chemistry", timeframe: "monthly", subject: "chemistry", criteria: "subject_xp" },
  { id: 'physics-specialists', name: "Subject Specialists - Physics", timeframe: "monthly", subject: "physics", criteria: "subject_xp" },
  { id: 'biology-specialists', name: "Subject Specialists - Biology", timeframe: "monthly", subject: "biology", criteria: "subject_xp" },
  { id: 'semester-innovation', name: "Innovation Leaders", timeframe: "semester", criteria: "creative_solutions" }
];

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  category: string;
  timeframe: string;
  subject?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  experimentId?: string;
  metadata?: Record<string, any>;
}

export interface UserProgress {
  userId: string;
  totalXp: number;
  level: number;
  nextLevelXp: number;
  progressToNextLevel: number;
  subjectProgress: Record<string, number>;
  experimentsCompleted: number;
  assessmentsCompleted: number;
  badgesEarned: number;
}