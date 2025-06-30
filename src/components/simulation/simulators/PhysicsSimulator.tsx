//src/components/simulation/simulators/PhysicsSimulator.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Zap, Gauge, Timer, Target } from 'lucide-react';
import type { ExperimentStep, SimulationState, UserAction } from '@/types/simulation';

interface PhysicsSimulatorProps {
  step: ExperimentStep;
  simulationState: SimulationState;
  onUserAction: (action: Omit<UserAction, 'id' | 'timestamp' | 'isValid'>) => void;
  isRunning: boolean;
}

export function PhysicsSimulator({
  step,
  simulationState,
  onUserAction,
  isRunning
}: PhysicsSimulatorProps) {
  const [voltage, setVoltage] = useState([5]);
  const [resistance, setResistance] = useState([10]);
  const [pendulumLength, setPendulumLength] = useState([50]);
  const [angle, setAngle] = useState([15]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [period, setPeriod] = useState(0);

  // Get experiment type from step data
  const getExperimentType = () => {
    const stepData = step.instructions;
    if (typeof stepData === 'object' && stepData.experimentType) {
      return stepData.experimentType;
    }
    return 'general';
  };

  const experimentType = getExperimentType();

  // Calculate physics values with precision control to prevent infinite loops
  useEffect(() => {
    // Ohm's Law: I = V/R - round to 3 decimal places
    const newCurrent = Math.round((voltage[0] / resistance[0]) * 1000) / 1000;
    
    // Pendulum period: T = 2π√(L/g) - round to 3 decimal places
    const newPeriod = Math.round((2 * Math.PI * Math.sqrt(pendulumLength[0] / 100 / 9.81)) * 1000) / 1000;
    
    // Only update if values actually changed to prevent infinite loops
    setCurrent(prevCurrent => {
      const roundedPrev = Math.round(prevCurrent * 1000) / 1000;
      return roundedPrev !== newCurrent ? newCurrent : prevCurrent;
    });
    
    setPeriod(prevPeriod => {
      const roundedPrev = Math.round(prevPeriod * 1000) / 1000;
      return roundedPrev !== newPeriod ? newPeriod : prevPeriod;
    });
  }, [voltage, resistance, pendulumLength]);

  // Handle measurements
  const takeMeasurement = (type: string) => {
    if (!isRunning) return;

    let value, unit;
    switch (type) {
      case 'current':
        value = current;
        unit = 'A';
        break;
      case 'voltage':
        value = voltage[0];
        unit = 'V';
        break;
      case 'resistance':
        value = resistance[0];
        unit = 'Ω';
        break;
      case 'period':
        value = period;
        unit = 's';
        break;
      case 'length':
        value = pendulumLength[0];
        unit = 'cm';
        break;
      default:
        return;
    }

    onUserAction({
      type: 'measurement',
      data: { measurementType: type, value, unit },
      stepNumber: step.step_number,
      sessionId: simulationState.sessionId || '',
    });
  };

  // Start pendulum animation
  const startPendulum = () => {
    if (!isRunning) return;
    
    setIsAnimating(true);
    onUserAction({
      type: 'start_pendulum',
      data: { length: pendulumLength[0], angle: angle[0] },
      stepNumber: step.step_number,
      sessionId: simulationState.sessionId || '',
    });

    setTimeout(() => setIsAnimating(false), period * 1000 * 3); // 3 oscillations
  };

  // Render different experiment types
  const renderExperiment = () => {
    switch (experimentType) {
      case 'ohms_law':
        return renderOhmsLawExperiment();
      case 'pendulum':
        return renderPendulumExperiment();
      case 'electric_circuit':
        return renderCircuitExperiment();
      default:
        return renderGeneralPhysicsExperiment();
    }
  };

  const renderOhmsLawExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Circuit Diagram */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Circuit Diagram</h4>
          <div className="relative w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            {/* Simple circuit representation */}
            <svg width="200" height="150" viewBox="0 0 200 150">
              {/* Battery */}
              <rect x="20" y="60" width="30" height="30" fill="#ff6b6b" stroke="#333" strokeWidth="2" />
              <text x="35" y="78" textAnchor="middle" className="text-xs font-bold">V</text>
              
              {/* Resistor */}
              <rect x="100" y="60" width="40" height="30" fill="#4ecdc4" stroke="#333" strokeWidth="2" />
              <text x="120" y="78" textAnchor="middle" className="text-xs font-bold">R</text>
              
              {/* Wires */}
              <line x1="50" y1="75" x2="100" y2="75" stroke="#333" strokeWidth="3" />
              <line x1="140" y1="75" x2="180" y2="75" stroke="#333" strokeWidth="3" />
              <line x1="180" y1="75" x2="180" y2="120" stroke="#333" strokeWidth="3" />
              <line x1="180" y1="120" x2="20" y2="120" stroke="#333" strokeWidth="3" />
              <line x1="20" y1="120" x2="20" y2="90" stroke="#333" strokeWidth="3" />
              
              {/* Current flow animation */}
              {isRunning && (
                <motion.circle
                  r="3"
                  fill="#ffd93d"
                  animate={{
                    x: [50, 100, 140, 180, 180, 20, 20, 50],
                    y: [75, 75, 75, 75, 120, 120, 90, 75],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </svg>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-500">{voltage[0]}V</div>
              <div className="text-sm text-gray-500">Voltage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{resistance[0]}Ω</div>
              <div className="text-sm text-gray-500">Resistance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{current.toFixed(2)}A</div>
              <div className="text-sm text-gray-500">Current</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Voltage (V)</label>
            <Slider
              value={voltage}
              onValueChange={setVoltage}
              max={20}
              min={1}
              step={0.5}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{voltage[0]} V</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resistance (Ω)</label>
            <Slider
              value={resistance}
              onValueChange={setResistance}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{resistance[0]} Ω</div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => takeMeasurement('voltage')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Measure Voltage
            </Button>
            
            <Button 
              onClick={() => takeMeasurement('current')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Gauge className="h-4 w-4 mr-2" />
              Measure Current
            </Button>

            <Button 
              onClick={() => takeMeasurement('resistance')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Target className="h-4 w-4 mr-2" />
              Measure Resistance
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Ohm's Law</h5>
            <div className="text-center text-lg font-mono">
              I = V / R
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              {current.toFixed(2)} = {voltage[0]} / {resistance[0]}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPendulumExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pendulum Animation */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Pendulum Motion</h4>
          <div className="relative w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 300 250">
              {/* Pivot point */}
              <circle cx="150" cy="20" r="5" fill="#333" />
              
              {/* String */}
              <motion.line
                x1="150"
                y1="20"
                x2={150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180)}
                y2={20 + pendulumLength[0] * 1.5}
                stroke="#333"
                strokeWidth="2"
                animate={isAnimating ? {
                  x2: [
                    150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                    150 - (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                    150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                  ]
                } : {}}
                transition={isAnimating ? {
                  duration: period,
                  repeat: 3,
                  ease: "easeInOut"
                } : {}}
              />
              
              {/* Bob */}
              <motion.circle
                cx={150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180)}
                cy={20 + pendulumLength[0] * 1.5}
                r="10"
                fill="#4ecdc4"
                stroke="#333"
                strokeWidth="2"
                animate={isAnimating ? {
                  cx: [
                    150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                    150 - (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                    150 + (pendulumLength[0] * 1.5) * Math.sin((angle[0] * Math.PI) / 180),
                  ]
                } : {}}
                transition={isAnimating ? {
                  duration: period,
                  repeat: 3,
                  ease: "easeInOut"
                } : {}}
              />
              
              {/* Arc showing angle */}
              <path
                d={`M 150 ${20 + pendulumLength[0] * 1.5} A 20 20 0 0 1 ${150 + 20 * Math.sin((angle[0] * Math.PI) / 180)} ${20 + pendulumLength[0] * 1.5 - 20 * Math.cos((angle[0] * Math.PI) / 180)}`}
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </svg>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">{pendulumLength[0]} cm</div>
              <div className="text-sm text-gray-500">Length</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{period.toFixed(2)} s</div>
              <div className="text-sm text-gray-500">Period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Length (cm)</label>
            <Slider
              value={pendulumLength}
              onValueChange={setPendulumLength}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{pendulumLength[0]} cm</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Release Angle (°)</label>
            <Slider
              value={angle}
              onValueChange={setAngle}
              max={45}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{angle[0]}°</div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={startPendulum}
              disabled={!isRunning || isAnimating}
              className="w-full"
            >
              <Timer className="h-4 w-4 mr-2" />
              {isAnimating ? 'Swinging...' : 'Start Pendulum'}
            </Button>
            
            <Button 
              onClick={() => takeMeasurement('period')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Timer className="h-4 w-4 mr-2" />
              Measure Period
            </Button>

            <Button 
              onClick={() => takeMeasurement('length')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Target className="h-4 w-4 mr-2" />
              Record Length
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Pendulum Formula</h5>
            <div className="text-center text-lg font-mono">
              T = 2π√(L/g)
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              Period = {period.toFixed(2)} seconds
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCircuitExperiment = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">Circuit experiment simulator coming soon...</p>
    </div>
  );

  const renderGeneralPhysicsExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Physics Simulation</h4>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-gray-600">General physics simulation interface</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="font-semibold">Controls</h4>
          <Button 
            onClick={() => takeMeasurement('general')}
            disabled={!isRunning}
            className="w-full"
          >
            Take Measurement
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderExperiment()}
    </div>
  );
}