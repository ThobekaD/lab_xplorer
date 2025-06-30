//src/components/simulation/SafetyChecker.tsx
import type { UserAction, ExperimentStep, ValidationResult } from '@/types/simulation';

export class SafetyChecker {
  static validateAction(action: UserAction, step: ExperimentStep): ValidationResult {
    // Check against safety notes
    if (step.safety_notes && step.safety_notes.length > 0) {
      const safetyViolation = this.checkSafetyViolations(action, step.safety_notes);
      if (safetyViolation) {
        return {
          isValid: false,
          feedback: 'Safety protocol violation detected',
          safetyWarning: safetyViolation,
        };
      }
    }

    // Check for dangerous combinations
    const dangerousAction = this.checkDangerousActions(action);
    if (dangerousAction) {
      return {
        isValid: false,
        feedback: 'Dangerous action detected',
        safetyWarning: dangerousAction,
      };
    }

    return {
      isValid: true,
      feedback: 'Action is safe to proceed',
    };
  }

  private static checkSafetyViolations(action: UserAction, safetyNotes: string[]): string | null {
    const actionData = action.data;

    // Check for temperature violations
    if (actionData.temperature && actionData.temperature > 100) {
      const tempWarning = safetyNotes.find(note => 
        note.toLowerCase().includes('temperature') || note.toLowerCase().includes('heat')
      );
      if (tempWarning) {
        return `High temperature warning: ${tempWarning}`;
      }
    }

    // Check for chemical mixing violations
    if (action.type === 'add_reagent') {
      const chemicalWarning = safetyNotes.find(note => 
        note.toLowerCase().includes('mix') || 
        note.toLowerCase().includes('combine') ||
        note.toLowerCase().includes(actionData.reagent?.toLowerCase())
      );
      if (chemicalWarning) {
        return `Chemical safety warning: ${chemicalWarning}`;
      }
    }

    // Check for electrical safety
    if (actionData.voltage && actionData.voltage > 50) {
      const electricalWarning = safetyNotes.find(note => 
        note.toLowerCase().includes('electrical') || 
        note.toLowerCase().includes('voltage') ||
        note.toLowerCase().includes('shock')
      );
      if (electricalWarning) {
        return `Electrical safety warning: ${electricalWarning}`;
      }
    }

    return null;
  }

  private static checkDangerousActions(action: UserAction): string | null {
    const actionData = action.data;

    // Dangerous chemical combinations
    if (action.type === 'add_reagent') {
      const dangerousCombinations = [
        { chemicals: ['bleach', 'ammonia'], warning: 'Never mix bleach and ammonia - produces toxic chloramine gas!' },
        { chemicals: ['acid', 'base'], warning: 'Mixing strong acids and bases can cause violent reactions and heat generation!' },
        { chemicals: ['hydrogen peroxide', 'organic'], warning: 'Hydrogen peroxide with organic materials can cause fires or explosions!' },
      ];

      for (const combo of dangerousCombinations) {
        if (combo.chemicals.some(chem => 
          actionData.reagent?.toLowerCase().includes(chem.toLowerCase())
        )) {
          return combo.warning;
        }
      }
    }

    // Dangerous electrical conditions
    if (actionData.voltage && actionData.current) {
      const power = actionData.voltage * actionData.current;
      if (power > 1000) { // 1kW
        return 'High power levels detected! Risk of burns or fire. Reduce voltage or current.';
      }
    }

    // Dangerous temperatures
    if (actionData.temperature) {
      if (actionData.temperature > 200) {
        return 'Extremely high temperature! Risk of burns and fire. Use proper protective equipment.';
      }
      if (actionData.temperature < -50) {
        return 'Extremely low temperature! Risk of frostbite. Use proper protective equipment.';
      }
    }

    // Dangerous pressure levels
    if (actionData.pressure && actionData.pressure > 10) { // 10 atm
      return 'High pressure detected! Risk of explosion. Ensure proper containment.';
    }

    return null;
  }

  static getSafetyRecommendations(step: ExperimentStep): string[] {
    const recommendations: string[] = [];

    // Add general safety recommendations based on step content
    if (step.safety_notes) {
      recommendations.push(...step.safety_notes);
    }

    // Add specific recommendations based on experiment type
    const instructions = step.instructions;
    if (typeof instructions === 'object' && instructions.experimentType) {
      switch (instructions.experimentType) {
        case 'acid_base_titration':
          recommendations.push(
            'Wear safety goggles and gloves',
            'Work in a well-ventilated area',
            'Have a neutralizing agent ready',
            'Add acid to water, never water to acid'
          );
          break;
        case 'electrical_circuit':
          recommendations.push(
            'Ensure hands are dry before handling electrical components',
            'Check all connections before applying power',
            'Use appropriate voltage levels',
            'Have a fire extinguisher nearby'
          );
          break;
        case 'microscopy':
          recommendations.push(
            'Handle glass slides carefully',
            'Clean lenses with appropriate materials only',
            'Adjust lighting gradually to protect eyes',
            'Secure specimens properly'
          );
          break;
      }
    }

    return recommendations;
  }
}