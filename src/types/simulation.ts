//src/types/simulation.ts
export interface ExperimentData {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: 'physics' | 'chemistry' | 'biology';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimated_duration: number;
  learning_objectives: string[];
  prerequisites: string[];
  steps: ExperimentStep[];
  assessments: Assessment[];
  thumbnail_url?: string;
}

export interface ExperimentStep {
  id: string;
  step_number: number;
  title: string;
  instructions: any; // JSONB from database
  expected_results: any; // JSONB from database
  safety_notes: string[];
  assets: any; // JSONB from database
  validation_rules: any; // JSONB from database
}

export interface SimulationState {
  currentStep: number;
  totalSteps: number;
  variables: Record<string, any>;
  measurements: MeasurementData[];
  userActions: UserAction[];
  isComplete: boolean;
  score: number;
  startTime: Date;
  endTime?: Date;
}

export interface UserAction {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
  stepNumber: number;
  sessionId: string;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
  nextStep?: number;
  safetyWarning?: string;
  score?: number;
}

export interface MeasurementData {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface SimulationResults {
  finalScore: number;
  completionTime: number;
  measurements: MeasurementData[];
  achievements: string[];
  feedback: string;
  nextRecommendations: string[];
}

export interface InteractiveElement {
  id: string;
  type: 'draggable' | 'clickable' | 'input' | 'slider' | 'dropdown';
  position: { x: number; y: number };
  properties: Record<string, any>;
  constraints?: Record<string, any>;
  onInteraction: (data: any) => void;
}

export interface PhysicsProperties {
  mass?: number;
  velocity?: { x: number; y: number };
  acceleration?: { x: number; y: number };
  force?: { x: number; y: number };
  temperature?: number;
  pressure?: number;
  volume?: number;
  density?: number;
}

export interface ChemicalProperties {
  molarity?: number;
  ph?: number;
  temperature?: number;
  volume?: number;
  mass?: number;
  reactionRate?: number;
  equilibriumConstant?: number;
}

export interface BiologicalProperties {
  cellCount?: number;
  growthRate?: number;
  oxygenLevel?: number;
  co2Level?: number;
  lightIntensity?: number;
  temperature?: number;
  ph?: number;
}