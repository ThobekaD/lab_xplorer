//src/components/simulation/engines/PhysicsEngine.tsx
import type { 
  UserAction, 
  SimulationState, 
  ValidationResult, 
  PhysicsProperties 
} from '@/types/simulation';

export class PhysicsEngine {
  private constants = {
    g: 9.81, // m/s²
    c: 3e8,  // m/s
    k: 8.99e9, // N⋅m²/C²
    h: 6.626e-34, // J⋅s
  };

  async validateAction(action: UserAction, state: SimulationState): Promise<ValidationResult> {
    switch (action.type) {
      case 'set_voltage':
        return this.validateVoltage(action, state);
      case 'set_resistance':
        return this.validateResistance(action, state);
      case 'start_pendulum':
        return this.validatePendulum(action, state);
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
      case 'set_voltage':
        newState.variables = this.updateElectricalProperties(action, newState.variables);
        break;
      case 'set_resistance':
        newState.variables = this.updateElectricalProperties(action, newState.variables);
        break;
      case 'start_pendulum':
        newState.variables = this.updatePendulumProperties(action, newState.variables);
        break;
      case 'measurement':
        if (this.isStepComplete(newState)) {
          newState.score += 10;
        }
        break;
    }

    return newState;
  }

  private validateVoltage(action: UserAction, state: SimulationState): ValidationResult {
    const { voltage } = action.data;

    if (voltage < 0) {
      return {
        isValid: false,
        feedback: 'Voltage cannot be negative in this circuit configuration',
      };
    }

    if (voltage > 50) {
      return {
        isValid: false,
        feedback: 'Voltage too high for safe operation',
        safetyWarning: 'High voltage can cause electrical shock. Use appropriate safety measures.',
      };
    }

    return {
      isValid: true,
      feedback: `Voltage set to ${voltage}V`,
      score: 2,
    };
  }

  private validateResistance(action: UserAction, state: SimulationState): ValidationResult {
    const { resistance } = action.data;

    if (resistance <= 0) {
      return {
        isValid: false,
        feedback: 'Resistance must be greater than zero',
      };
    }

    if (resistance < 1) {
      return {
        isValid: false,
        feedback: 'Resistance too low - risk of short circuit',
        safetyWarning: 'Very low resistance can cause excessive current and overheating.',
      };
    }

    return {
      isValid: true,
      feedback: `Resistance set to ${resistance}Ω`,
      score: 2,
    };
  }

  private validatePendulum(action: UserAction, state: SimulationState): ValidationResult {
    const { length, angle } = action.data;

    if (length <= 0) {
      return {
        isValid: false,
        feedback: 'Pendulum length must be greater than zero',
      };
    }

    if (angle > 45) {
      return {
        isValid: false,
        feedback: 'Angle too large for simple harmonic motion approximation',
      };
    }

    return {
      isValid: true,
      feedback: `Pendulum started with length ${length}cm and angle ${angle}°`,
      score: 5,
    };
  }

  private validateMeasurement(action: UserAction, state: SimulationState): ValidationResult {
    const { measurementType } = action.data;

    switch (measurementType) {
      case 'current':
        if (!state.variables.voltage || !state.variables.resistance) {
          return {
            isValid: false,
            feedback: 'Current measurement requires both voltage and resistance to be set',
          };
        }
        break;
      case 'period':
        if (!state.variables.pendulumLength) {
          return {
            isValid: false,
            feedback: 'Period measurement requires pendulum to be set up',
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

  private updateElectricalProperties(action: UserAction, variables: any): any {
    const newVariables = { ...variables };

    if (action.data.voltage !== undefined) {
      newVariables.voltage = action.data.voltage;
    }
    if (action.data.resistance !== undefined) {
      newVariables.resistance = action.data.resistance;
    }

    // Calculate current using Ohm's law: I = V/R
    if (newVariables.voltage && newVariables.resistance) {
      newVariables.current = newVariables.voltage / newVariables.resistance;
      newVariables.power = newVariables.voltage * newVariables.current; // P = VI
    }

    return newVariables;
  }

  private updatePendulumProperties(action: UserAction, variables: any): any {
    const newVariables = { ...variables };
    const { length, angle } = action.data;

    newVariables.pendulumLength = length / 100; // Convert cm to m
    newVariables.pendulumAngle = angle;

    // Calculate period using T = 2π√(L/g)
    newVariables.period = 2 * Math.PI * Math.sqrt(newVariables.pendulumLength / this.constants.g);

    // Calculate frequency
    newVariables.frequency = 1 / newVariables.period;

    // For small angles, calculate maximum velocity
    const amplitude = newVariables.pendulumLength * Math.sin(angle * Math.PI / 180);
    newVariables.maxVelocity = amplitude * 2 * Math.PI * newVariables.frequency;

    return newVariables;
  }

  private calculateMeasurementValue(measurementType: string, state: SimulationState): number {
    const variables = state.variables;

    switch (measurementType) {
      case 'current':
        return variables.current || 0;
      case 'voltage':
        return variables.voltage || 0;
      case 'resistance':
        return variables.resistance || 0;
      case 'power':
        return variables.power || 0;
      case 'period':
        return variables.period || 0;
      case 'frequency':
        return variables.frequency || 0;
      case 'length':
        return variables.pendulumLength ? variables.pendulumLength * 100 : 0; // Convert back to cm
      default:
        return 0;
    }
  }

  private isStepComplete(state: SimulationState): boolean {
    const variables = state.variables;

    // For Ohm's law: measurements taken
    if (variables.current && variables.voltage && variables.resistance) {
      const calculatedCurrent = variables.voltage / variables.resistance;
      if (Math.abs(variables.current - calculatedCurrent) < 0.01) {
        return true;
      }
    }

    // For pendulum: period measured
    if (variables.period && variables.pendulumLength) {
      const calculatedPeriod = 2 * Math.PI * Math.sqrt(variables.pendulumLength / this.constants.g);
      if (Math.abs(variables.period - calculatedPeriod) < 0.1) {
        return true;
      }
    }

    return false;
  }

  // Physics calculation methods
  calculateOhmsLaw(voltage: number, resistance: number): PhysicsProperties {
    const current = voltage / resistance;
    const power = voltage * current;

    return {
      voltage,
      current,
      resistance,
      power,
    };
  }

  calculatePendulumMotion(length: number, angle: number): PhysicsProperties {
    const period = 2 * Math.PI * Math.sqrt(length / this.constants.g);
    const frequency = 1 / period;
    const angularFrequency = 2 * Math.PI * frequency;

    return {
      period,
      frequency,
      angularFrequency,
      amplitude: length * Math.sin(angle * Math.PI / 180),
    };
  }

  calculateProjectileMotion(velocity: number, angle: number): PhysicsProperties {
    const vx = velocity * Math.cos(angle * Math.PI / 180);
    const vy = velocity * Math.sin(angle * Math.PI / 180);
    
    const timeOfFlight = 2 * vy / this.constants.g;
    const range = vx * timeOfFlight;
    const maxHeight = (vy * vy) / (2 * this.constants.g);

    return {
      velocity: { x: vx, y: vy },
      timeOfFlight,
      range,
      maxHeight,
    };
  }
}