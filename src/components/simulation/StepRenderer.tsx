//src/components/simulation/StepRenderer.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { ChemistrySimulator } from './simulators/ChemistrySimulator';
import { PhysicsSimulator } from './simulators/PhysicsSimulator';
import { BiologySimulator } from './simulators/BiologySimulator';
import type { ExperimentStep, SimulationState, UserAction } from '@/types/simulation';

interface StepRendererProps {
  step: ExperimentStep;
  simulationState: SimulationState;
  onUserAction: (action: Omit<UserAction, 'id' | 'timestamp' | 'isValid'>) => void;
  isRunning: boolean;
  experimentSubject: 'physics' | 'chemistry' | 'biology';
}

export function StepRenderer({
  step,
  simulationState,
  onUserAction,
  isRunning,
  experimentSubject
}: StepRendererProps) {
  const renderSimulator = () => {
    const commonProps = {
      step,
      simulationState,
      onUserAction,
      isRunning,
    };

    switch (experimentSubject) {
      case 'chemistry':
        return <ChemistrySimulator {...commonProps} />;
      case 'physics':
        return <PhysicsSimulator {...commonProps} />;
      case 'biology':
        return <BiologySimulator {...commonProps} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Simulator not available for this subject</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Step {step.step_number}: {step.title}
          </h3>
          <Badge variant="outline" className="mt-2">
            {experimentSubject.charAt(0).toUpperCase() + experimentSubject.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Instructions */}
      {step.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {typeof step.instructions === 'string' ? (
                <p>{step.instructions}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: step.instructions.html || '' }} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Notes */}
      {step.safety_notes && step.safety_notes.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Safety Notes:</strong>
            <ul className="mt-2 space-y-1">
              {step.safety_notes.map((note, index) => (
                <li key={index} className="text-yellow-800">• {note}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[400px]"
      >
        {renderSimulator()}
      </motion.div>

      {/* Expected Results */}
      {step.expected_results && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Expected Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700">
              {typeof step.expected_results === 'string' ? (
                <p>{step.expected_results}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: step.expected_results.html || '' }} />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}