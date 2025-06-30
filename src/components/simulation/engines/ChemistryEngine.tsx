//src/components/simulation/engines/ChemistryEngine.tsx
import type { 
  UserAction, 
  SimulationState, 
  ValidationResult, 
  ChemicalProperties 
} from '@/types/simulation';

export class ChemistryEngine {
  private reactions: Map<string, any> = new Map();
  private compounds: Map<string, ChemicalProperties> = new Map();

  constructor() {
    this.initializeReactions();
    this.initializeCompounds();
  }

  async validateAction(action: UserAction, state: SimulationState): Promise<ValidationResult> {
    switch (action.type) {
      case 'add_reagent':
        return this.validateReagentAddition(action, state);
      case 'measurement':
        return this.validateMeasurement(action, state);
      case 'heat':
        return this.validateHeating(action, state);
      default:
        return {
          isValid: true,
          feedback: 'Action completed',
        };
    }
  }

  async updateState(action: UserAction, state: SimulationState): Promise<SimulationState> {
    const newState = { ...state };

    switch (action.type) {
      case 'add_reagent':
        newState.variables = this.updateReagentConcentrations(action, newState.variables);
        newState.variables = this.calculateReactionProducts(newState.variables);
        break;
      case 'heat':
        newState.variables = this.updateTemperatureEffects(action, newState.variables);
        break;
      case 'measurement':
        // Measurements don't change state but might trigger step completion
        if (this.isStepComplete(newState)) {
          newState.score += 10;
        }
        break;
    }

    return newState;
  }

  private validateReagentAddition(action: UserAction, state: SimulationState): ValidationResult {
    const { reagent, volume, concentration } = action.data;

    // Check if reagent is valid for current step
    const allowedReagents = state.variables.allowedReagents || [];
    if (allowedReagents.length > 0 && !allowedReagents.includes(reagent)) {
      return {
        isValid: false,
        feedback: `${reagent} is not allowed in this step. Allowed reagents: ${allowedReagents.join(', ')}`,
      };
    }

    // Check volume limits
    const currentVolume = state.variables.totalVolume || 0;
    const maxVolume = state.variables.maxVolume || 500; // mL
    if (currentVolume + volume > maxVolume) {
      return {
        isValid: false,
        feedback: `Adding ${volume} mL would exceed maximum volume of ${maxVolume} mL`,
      };
    }

    // Check for dangerous reactions
    const dangerousReaction = this.checkDangerousReactions(reagent, state.variables);
    if (dangerousReaction) {
      return {
        isValid: false,
        feedback: 'Dangerous reaction detected!',
        safetyWarning: dangerousReaction,
      };
    }

    return {
      isValid: true,
      feedback: `Added ${volume} mL of ${reagent}`,
      score: 5,
    };
  }

  private validateMeasurement(action: UserAction, state: SimulationState): ValidationResult {
    const { measurementType } = action.data;

    // Check if measurement is appropriate for current conditions
    switch (measurementType) {
      case 'ph':
        if (!state.variables.hasIndicator && !state.variables.hasPhMeter) {
          return {
            isValid: false,
            feedback: 'pH measurement requires an indicator or pH meter',
          };
        }
        break;
      case 'temperature':
        if (!state.variables.hasThermometer) {
          return {
            isValid: false,
            feedback: 'Temperature measurement requires a thermometer',
          };
        }
        break;
      case 'volume':
        if (!state.variables.hasGraduatedCylinder) {
          return {
            isValid: false,
            feedback: 'Volume measurement requires a graduated cylinder or burette',
          };
        }
        break;
    }

    return {
      isValid: true,
      feedback: `Measured ${measurementType}: ${this.calculateMeasurementValue(measurementType, state)}`,
      score: 3,
    };
  }

  private validateHeating(action: UserAction, state: SimulationState): ValidationResult {
    const { temperature } = action.data;

    if (temperature > 100 && !state.variables.hasHeatResistantGlassware) {
      return {
        isValid: false,
        feedback: 'High temperature heating requires heat-resistant glassware',
        safetyWarning: 'Risk of glassware breaking at high temperatures',
      };
    }

    return {
      isValid: true,
      feedback: `Heating to ${temperature}°C`,
      score: 2,
    };
  }

  private updateReagentConcentrations(action: UserAction, variables: any): any {
    const { reagent, volume, concentration = 1 } = action.data;
    const newVariables = { ...variables };

    // Update total volume
    newVariables.totalVolume = (newVariables.totalVolume || 0) + volume;

    // Update reagent concentrations
    if (!newVariables.reagents) {
      newVariables.reagents = {};
    }

    const currentMoles = (newVariables.reagents[reagent] || 0) * (newVariables.totalVolume - volume);
    const addedMoles = concentration * volume / 1000; // Convert mL to L
    newVariables.reagents[reagent] = (currentMoles + addedMoles) / (newVariables.totalVolume / 1000);

    return newVariables;
  }

  private calculateReactionProducts(variables: any): any {
    const newVariables = { ...variables };
    const reagents = newVariables.reagents || {};

    // Example: Acid-base neutralization
    if (reagents.acid && reagents.base) {
      const acidMoles = reagents.acid * (newVariables.totalVolume / 1000);
      const baseMoles = reagents.base * (newVariables.totalVolume / 1000);
      
      const neutralizedMoles = Math.min(acidMoles, baseMoles);
      newVariables.reagents.acid = Math.max(0, acidMoles - neutralizedMoles) / (newVariables.totalVolume / 1000);
      newVariables.reagents.base = Math.max(0, baseMoles - neutralizedMoles) / (newVariables.totalVolume / 1000);
      newVariables.reagents.salt = (newVariables.reagents.salt || 0) + neutralizedMoles / (newVariables.totalVolume / 1000);
      
      // Calculate pH
      const excessAcid = acidMoles - neutralizedMoles;
      const excessBase = baseMoles - neutralizedMoles;
      
      if (excessAcid > 0) {
        newVariables.ph = -Math.log10(excessAcid / (newVariables.totalVolume / 1000));
      } else if (excessBase > 0) {
        newVariables.ph = 14 + Math.log10(excessBase / (newVariables.totalVolume / 1000));
      } else {
        newVariables.ph = 7; // Neutral
      }
    }

    return newVariables;
  }

  private updateTemperatureEffects(action: UserAction, variables: any): any {
    const { temperature } = action.data;
    const newVariables = { ...variables };

    newVariables.temperature = temperature;

    // Temperature affects reaction rates (Arrhenius equation simplified)
    if (newVariables.reactionRate) {
      const tempFactor = Math.exp((temperature - 25) / 10); // Simplified
      newVariables.reactionRate *= tempFactor;
    }

    return newVariables;
  }

  private calculateMeasurementValue(measurementType: string, state: SimulationState): number {
    const variables = state.variables;

    switch (measurementType) {
      case 'ph':
        return variables.ph || 7;
      case 'temperature':
        return variables.temperature || 25;
      case 'volume':
        return variables.totalVolume || 0;
      case 'concentration':
        const reagent = Object.keys(variables.reagents || {})[0];
        return reagent ? variables.reagents[reagent] : 0;
      default:
        return 0;
    }
  }

  private checkDangerousReactions(reagent: string, variables: any): string | null {
    const reagents = variables.reagents || {};

    // Check for dangerous combinations
    if (reagent.toLowerCase().includes('acid') && reagents.base > 0.5) {
      return 'Strong acid-base reaction may generate excessive heat!';
    }

    if (reagent.toLowerCase().includes('oxidizer') && reagents.organic > 0) {
      return 'Oxidizer with organic compounds may cause fire or explosion!';
    }

    return null;
  }

  private isStepComplete(state: SimulationState): boolean {
    // Example completion criteria
    const variables = state.variables;
    
    // For titration: endpoint reached
    if (variables.ph && Math.abs(variables.ph - 7) < 0.1) {
      return true;
    }

    // For synthesis: product formed
    if (variables.reagents?.product > 0.1) {
      return true;
    }

    return false;
  }

  private initializeReactions(): void {
    // Initialize common chemical reactions
    this.reactions.set('acid_base', {
      reactants: ['acid', 'base'],
      products: ['salt', 'water'],
      equilibriumConstant: 1e14,
    });

    this.reactions.set('precipitation', {
      reactants: ['cation', 'anion'],
      products: ['precipitate'],
      solubilityProduct: 1e-10,
    });
  }

  private initializeCompounds(): void {
    // Initialize compound properties
    this.compounds.set('HCl', {
      molarity: 1.0,
      ph: 0,
      temperature: 25,
    });

    this.compounds.set('NaOH', {
      molarity: 1.0,
      ph: 14,
      temperature: 25,
    });
  }
}