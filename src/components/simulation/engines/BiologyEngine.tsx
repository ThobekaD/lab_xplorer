//src/components/simulation/engines/BiologyEngine.tsx
import type { 
  UserAction, 
  SimulationState, 
  ValidationResult, 
  BiologicalProperties 
} from '@/types/simulation';

export class BiologyEngine {
  private biologicalConstants = {
    photosynthesisOptimalTemp: 25, // °C
    photosynthesisOptimalPH: 7.0,
    respirationRate: 0.1, // arbitrary units
    cellDivisionTime: 24, // hours
  };

  async validateAction(action: UserAction, state: SimulationState): Promise<ValidationResult> {
    switch (action.type) {
      case 'focus_microscope':
        return this.validateMicroscope(action, state);
      case 'set_light_intensity':
        return this.validateLightIntensity(action, state);
      case 'add_substrate':
        return this.validateSubstrate(action, state);
      case 'measurement':
        return this.validateMeasurement(action, state);
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
      case 'focus_microscope':
        newState.variables = this.updateMicroscopeView(action, newState.variables);
        break;
      case 'set_light_intensity':
        newState.variables = this.updatePhotosynthesis(action, newState.variables);
        break;
      case 'add_substrate':
        newState.variables = this.updateEnzymeReaction(action, newState.variables);
        break;
      case 'measurement':
        if (this.isStepComplete(newState)) {
          newState.score += 10;
        }
        break;
    }

    return newState;
  }

  private validateMicroscope(action: UserAction, state: SimulationState): ValidationResult {
    const { magnification } = action.data;

    if (magnification < 40) {
      return {
        isValid: false,
        feedback: 'Magnification too low to observe cellular structures',
      };
    }

    if (magnification > 1000 && !state.variables.hasOilImmersion) {
      return {
        isValid: false,
        feedback: 'High magnification requires oil immersion lens',
      };
    }

    return {
      isValid: true,
      feedback: `Microscope focused at ${magnification}x magnification`,
      score: 3,
    };
  }

  private validateLightIntensity(action: UserAction, state: SimulationState): ValidationResult {
    const { lightIntensity } = action.data;

    if (lightIntensity < 0 || lightIntensity > 100) {
      return {
        isValid: false,
        feedback: 'Light intensity must be between 0% and 100%',
      };
    }

    return {
      isValid: true,
      feedback: `Light intensity set to ${lightIntensity}%`,
      score: 2,
    };
  }

  private validateSubstrate(action: UserAction, state: SimulationState): ValidationResult {
    const { substrate, concentration } = action.data;

    if (concentration <= 0) {
      return {
        isValid: false,
        feedback: 'Substrate concentration must be greater than zero',
      };
    }

    if (concentration > 10) {
      return {
        isValid: false,
        feedback: 'Substrate concentration too high - may inhibit enzyme activity',
      };
    }

    return {
      isValid: true,
      feedback: `Added ${substrate} at ${concentration} mM concentration`,
      score: 3,
    };
  }

  private validateMeasurement(action: UserAction, state: SimulationState): ValidationResult {
    const { measurementType } = action.data;

    switch (measurementType) {
      case 'oxygen_bubbles':
        if (!state.variables.hasAquaticPlant) {
          return {
            isValid: false,
            feedback: 'Oxygen bubble measurement requires an aquatic plant setup',
          };
        }
        break;
      case 'cell_count':
        if (!state.variables.microscopeInFocus) {
          return {
            isValid: false,
            feedback: 'Cell counting requires microscope to be in focus',
          };
        }
        break;
      case 'enzyme_activity':
        if (!state.variables.hasEnzyme || !state.variables.hasSubstrate) {
          return {
            isValid: false,
            feedback: 'Enzyme activity measurement requires both enzyme and substrate',
          };
        }
        break;
    }

    return {
      isValid: true,
      feedback: `Measured ${measurementType}: ${this.calculateMeasurementValue(measurementType, state)}`,
      score: 5,
    };
  }

  private updateMicroscopeView(action: UserAction, variables: any): any {
    const newVariables = { ...variables };
    const { magnification } = action.data;

    newVariables.magnification = magnification;
    newVariables.microscopeInFocus = true;

    // Calculate visible cell structures based on magnification
    newVariables.visibleStructures = [];
    
    if (magnification >= 40) {
      newVariables.visibleStructures.push('cell_walls');
    }
    if (magnification >= 100) {
      newVariables.visibleStructures.push('nuclei');
    }
    if (magnification >= 400) {
      newVariables.visibleStructures.push('chloroplasts', 'vacuoles');
    }
    if (magnification >= 1000) {
      newVariables.visibleStructures.push('mitochondria', 'endoplasmic_reticulum');
    }

    // Calculate cell count based on magnification and field of view
    const fieldOfViewArea = Math.PI * Math.pow(1000 / magnification, 2); // Simplified
    newVariables.cellCount = Math.floor(fieldOfViewArea * 0.1); // Cells per unit area

    return newVariables;
  }

  private updatePhotosynthesis(action: UserAction, variables: any): any {
    const newVariables = { ...variables };
    const { lightIntensity, temperature = 25 } = action.data;

    newVariables.lightIntensity = lightIntensity;
    newVariables.temperature = temperature;

    // Calculate photosynthesis rate based on light intensity and temperature
    const lightFactor = Math.min(lightIntensity / 100, 1.0);
    const tempFactor = this.calculateTemperatureFactor(temperature);
    
    newVariables.photosynthesisRate = lightFactor * tempFactor * 100;

    // Calculate oxygen production (bubbles per minute)
    newVariables.oxygenProduction = newVariables.photosynthesisRate * 0.5;

    // Update CO2 consumption
    newVariables.co2Consumption = newVariables.photosynthesisRate * 0.6;

    return newVariables;
  }

  private updateEnzymeReaction(action: UserAction, variables: any): any {
    const newVariables = { ...variables };
    const { substrate, concentration, temperature = 37 } = action.data;

    newVariables.substrateConcentration = concentration;
    newVariables.temperature = temperature;
    newVariables.hasSubstrate = true;

    // Calculate enzyme activity using Michaelis-Menten kinetics (simplified)
    const km = 2.0; // Michaelis constant (mM)
    const vmax = 10.0; // Maximum velocity
    const tempFactor = this.calculateTemperatureFactor(temperature);

    newVariables.enzymeActivity = (vmax * concentration * tempFactor) / (km + concentration);

    // Calculate product formation rate
    newVariables.productFormation = newVariables.enzymeActivity * 0.8;

    return newVariables;
  }

  private calculateTemperatureFactor(temperature: number): number {
    // Simplified temperature effect on biological processes
    const optimalTemp = this.biologicalConstants.photosynthesisOptimalTemp;
    const tempDifference = Math.abs(temperature - optimalTemp);
    
    if (tempDifference <= 5) {
      return 1.0; // Optimal range
    } else if (tempDifference <= 15) {
      return 1.0 - (tempDifference - 5) * 0.05; // Gradual decrease
    } else {
      return 0.25; // Severely reduced activity
    }
  }

  private calculateMeasurementValue(measurementType: string, state: SimulationState): number {
    const variables = state.variables;

    switch (measurementType) {
      case 'oxygen_bubbles':
        return Math.floor(variables.oxygenProduction || 0);
      case 'cell_count':
        return variables.cellCount || 0;
      case 'photosynthesis_rate':
        return Math.round(variables.photosynthesisRate || 0);
      case 'enzyme_activity':
        return Math.round((variables.enzymeActivity || 0) * 100) / 100;
      case 'light_intensity':
        return variables.lightIntensity || 0;
      case 'temperature':
        return variables.temperature || 25;
      default:
        return 0;
    }
  }

  private isStepComplete(state: SimulationState): boolean {
    const variables = state.variables;

    // For microscopy: cells observed and counted
    if (variables.microscopeInFocus && variables.cellCount > 0) {
      return true;
    }

    // For photosynthesis: optimal conditions achieved
    if (variables.photosynthesisRate > 80) {
      return true;
    }

    // For enzyme kinetics: activity measured at multiple concentrations
    if (variables.enzymeActivity && variables.substrateConcentration) {
      return true;
    }

    return false;
  }

  // Biological calculation methods
  calculatePhotosynthesisRate(lightIntensity: number, temperature: number, co2Level: number): BiologicalProperties {
    const lightFactor = Math.min(lightIntensity / 100, 1.0);
    const tempFactor = this.calculateTemperatureFactor(temperature);
    const co2Factor = Math.min(co2Level / 400, 1.0); // 400 ppm is normal atmospheric CO2

    const rate = lightFactor * tempFactor * co2Factor * 100;

    return {
      photosynthesisRate: rate,
      oxygenLevel: rate * 0.5,
      co2Level: 400 - (rate * 0.3),
      lightIntensity,
      temperature,
    };
  }

  calculateCellGrowth(initialCount: number, timeHours: number, temperature: number): BiologicalProperties {
    const tempFactor = this.calculateTemperatureFactor(temperature);
    const growthRate = 0.693 / (this.biologicalConstants.cellDivisionTime * tempFactor); // ln(2) / doubling time
    
    const finalCount = initialCount * Math.exp(growthRate * timeHours);

    return {
      cellCount: Math.floor(finalCount),
      growthRate,
      temperature,
    };
  }

  calculateEnzymeKinetics(substrateConcentration: number, temperature: number, ph: number): BiologicalProperties {
    const km = 2.0; // Michaelis constant
    const vmax = 10.0; // Maximum velocity
    
    const tempFactor = this.calculateTemperatureFactor(temperature);
    const phFactor = this.calculatePHFactor(ph);
    
    const velocity = (vmax * substrateConcentration * tempFactor * phFactor) / (km + substrateConcentration);

    return {
      enzymeActivity: velocity,
      substrateConcentration,
      temperature,
      ph,
    };
  }

  private calculatePHFactor(ph: number): number {
    const optimalPH = this.biologicalConstants.photosynthesisOptimalPH;
    const phDifference = Math.abs(ph - optimalPH);
    
    if (phDifference <= 0.5) {
      return 1.0;
    } else if (phDifference <= 2.0) {
      return 1.0 - (phDifference - 0.5) * 0.3;
    } else {
      return 0.1; // Severely reduced activity
    }
  }
}