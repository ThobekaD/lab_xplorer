import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, CheckCircle, X } from 'lucide-react';
import type { BaseGame, GameState, CircuitComponent, WaveSource } from '@/types/games';

interface PhysicsGameProps {
  game: BaseGame;
  gameState: GameState;
  onGameAction: (action: any) => void;
  onUseHint: () => void;
}

export function PhysicsGame({ game, gameState, onGameAction, onUseHint }: PhysicsGameProps) {
  const renderGame = () => {
    switch (game.gameType) {
      case 'circuit_maze':
        return <CircuitMaze {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'wave_interference':
        return <WaveInterference {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'optics_ray_tracing':
        return <OpticsRayTracing {...{ game, gameState, onGameAction, onUseHint }} />;
      default:
        return <div>Physics game not implemented</div>;
    }
  };

  return <div className="space-y-6">{renderGame()}</div>;
}

function CircuitMaze({ game, gameState, onGameAction, onUseHint }: PhysicsGameProps) {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [voltage, setVoltage] = useState([5]);
  const [resistance, setResistance] = useState([10]);
  const [current, setCurrent] = useState(0);
  const [power, setPower] = useState(0);
  const [targetCurrent, setTargetCurrent] = useState(0.5);
  const [isCircuitComplete, setIsCircuitComplete] = useState(false);

  useEffect(() => {
    initializeCircuit();
  }, []);

  useEffect(() => {
    // Calculate current using Ohm's law
    const calculatedCurrent = voltage[0] / resistance[0];
    setCurrent(calculatedCurrent);
    setPower(voltage[0] * calculatedCurrent);

    // Check if target current is achieved
    const tolerance = 0.05;
    if (Math.abs(calculatedCurrent - targetCurrent) < tolerance) {
      setIsCircuitComplete(true);
      onGameAction({
        type: 'correct_answer',
        points: 50,
      });
    } else {
      setIsCircuitComplete(false);
    }
  }, [voltage, resistance, targetCurrent]);

  const initializeCircuit = () => {
    // Generate random target current
    const target = Math.round((Math.random() * 0.8 + 0.2) * 100) / 100;
    setTargetCurrent(target);
    
    setComponents([
      { id: '1', type: 'battery', value: voltage[0], position: { x: 50, y: 50 }, connections: [], isActive: true },
      { id: '2', type: 'resistor', value: resistance[0], position: { x: 200, y: 50 }, connections: [], isActive: true },
      { id: '3', type: 'wire', position: { x: 125, y: 50 }, connections: [], isActive: true },
    ]);
  };

  const generateNewChallenge = () => {
    const target = Math.round((Math.random() * 0.8 + 0.2) * 100) / 100;
    setTargetCurrent(target);
    setIsCircuitComplete(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Circuit Maze Challenge
            </span>
            <Button size="sm" onClick={generateNewChallenge}>
              New Challenge
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Display */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Target Current</h3>
            <div className="text-3xl font-bold text-blue-600">{targetCurrent.toFixed(2)} A</div>
            <div className="text-sm text-gray-600 mt-1">
              Adjust voltage and resistance to achieve this current
            </div>
          </div>

          {/* Circuit Visualization */}
          <div className="relative h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Battery */}
              <rect x="20" y="80" width="60" height="40" fill="#ff6b6b" stroke="#333" strokeWidth="2" />
              <text x="50" y="105" textAnchor="middle" className="text-sm font-bold fill-white">
                {voltage[0]}V
              </text>
              
              {/* Resistor */}
              <rect x="200" y="80" width="80" height="40" fill="#4ecdc4" stroke="#333" strokeWidth="2" />
              <text x="240" y="105" textAnchor="middle" className="text-sm font-bold">
                {resistance[0]}Ω
              </text>
              
              {/* Wires */}
              <line x1="80" y1="100" x2="200" y2="100" stroke="#333" strokeWidth="4" />
              <line x1="280" y1="100" x2="360" y2="100" stroke="#333" strokeWidth="4" />
              <line x1="360" y1="100" x2="360" y2="160" stroke="#333" strokeWidth="4" />
              <line x1="360" y1="160" x2="20" y2="160" stroke="#333" strokeWidth="4" />
              <line x1="20" y1="160" x2="20" y2="120" stroke="#333" strokeWidth="4" />
              
              {/* Current flow animation */}
              {isCircuitComplete && (
                <motion.circle
                  r="4"
                  fill="#ffd93d"
                  animate={{
                    x: [80, 200, 280, 360, 360, 20, 20, 80],
                    y: [100, 100, 100, 100, 160, 160, 120, 100],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </svg>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{resistance[0]} Ω</div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{current.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Current (A)</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{power.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Power (W)</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${isCircuitComplete ? 'text-green-600' : 'text-red-600'}`}>
                {isCircuitComplete ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">Target Met</div>
            </div>
          </div>

          {/* Ohm's Law Reference */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Ohm's Law Reference</h4>
            <div className="text-center text-lg font-mono">
              I = V / R
            </div>
            <div className="text-center text-sm text-gray-600 mt-1">
              Current = Voltage / Resistance
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WaveInterference({ game, gameState, onGameAction, onUseHint }: PhysicsGameProps) {
  const [sources, setSources] = useState<WaveSource[]>([]);
  const [targetPattern, setTargetPattern] = useState<string>('constructive');
  const [currentPattern, setCurrentPattern] = useState<string>('none');
  const [showWaves, setShowWaves] = useState(false);

  useEffect(() => {
    initializeSources();
  }, []);

  useEffect(() => {
    calculateInterference();
  }, [sources]);

  const initializeSources = () => {
    setSources([
      {
        id: '1',
        frequency: 1,
        amplitude: 1,
        phase: 0,
        position: { x: 100, y: 150 },
        isActive: true,
      },
      {
        id: '2',
        frequency: 1,
        amplitude: 1,
        phase: 0,
        position: { x: 300, y: 150 },
        isActive: true,
      },
    ]);
    
    // Random target pattern
    const patterns = ['constructive', 'destructive', 'partial'];
    setTargetPattern(patterns[Math.floor(Math.random() * patterns.length)]);
  };

  const calculateInterference = () => {
    if (sources.length < 2) return;

    const [source1, source2] = sources;
    const phaseDiff = Math.abs(source1.phase - source2.phase);
    const freqDiff = Math.abs(source1.frequency - source2.frequency);
    const ampRatio = Math.min(source1.amplitude, source2.amplitude) / Math.max(source1.amplitude, source2.amplitude);

    let pattern = 'none';
    
    if (freqDiff < 0.1 && phaseDiff < 0.2 && ampRatio > 0.8) {
      pattern = 'constructive';
    } else if (freqDiff < 0.1 && Math.abs(phaseDiff - Math.PI) < 0.2 && ampRatio > 0.8) {
      pattern = 'destructive';
    } else if (freqDiff < 0.1) {
      pattern = 'partial';
    }

    setCurrentPattern(pattern);

    if (pattern === targetPattern) {
      onGameAction({
        type: 'correct_answer',
        points: 40,
      });
    }
  };

  const updateSource = (id: string, property: string, value: number) => {
    setSources(prev => prev.map(source => 
      source.id === id ? { ...source, [property]: value } : source
    ));
  };

  const generateNewTarget = () => {
    const patterns = ['constructive', 'destructive', 'partial'];
    setTargetPattern(patterns[Math.floor(Math.random() * patterns.length)]);
    setCurrentPattern('none');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wave Interference Simulator</span>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => setShowWaves(!showWaves)}>
                {showWaves ? 'Hide' : 'Show'} Waves
              </Button>
              <Button size="sm" onClick={generateNewTarget}>
                New Target
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Pattern */}
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold mb-2">Target Interference Pattern</h3>
            <div className="text-2xl font-bold text-purple-600 capitalize">{targetPattern}</div>
            <div className="text-sm text-gray-600 mt-1">
              Adjust wave properties to create this interference pattern
            </div>
          </div>

          {/* Wave Visualization */}
          <div className="relative h-64 bg-gray-50 rounded-lg border">
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Wave sources */}
              {sources.map((source, index) => (
                <g key={source.id}>
                  <circle
                    cx={source.position.x}
                    cy={source.position.y}
                    r="8"
                    fill={index === 0 ? "#ff6b6b" : "#4ecdc4"}
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <text
                    x={source.position.x}
                    y={source.position.y - 15}
                    textAnchor="middle"
                    className="text-xs font-bold"
                  >
                    Source {index + 1}
                  </text>
                  
                  {/* Ripple animation */}
                  {showWaves && source.isActive && (
                    <motion.circle
                      cx={source.position.x}
                      cy={source.position.y}
                      r="0"
                      fill="none"
                      stroke={index === 0 ? "#ff6b6b" : "#4ecdc4"}
                      strokeWidth="2"
                      opacity="0.6"
                      animate={{ r: [0, 50], opacity: [0.6, 0] }}
                      transition={{
                        duration: 2 / source.frequency,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </g>
              ))}
              
              {/* Interference pattern indicator */}
              <text
                x="200"
                y="30"
                textAnchor="middle"
                className={`text-lg font-bold ${
                  currentPattern === targetPattern ? 'fill-green-600' : 'fill-gray-600'
                }`}
              >
                Current: {currentPattern}
              </text>
            </svg>
          </div>

          {/* Wave Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sources.map((source, index) => (
              <div key={source.id} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Source {index + 1}</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <Slider
                    value={[source.frequency]}
                    onValueChange={(value) => updateSource(source.id, 'frequency', value[0])}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{source.frequency.toFixed(1)} Hz</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amplitude</label>
                  <Slider
                    value={[source.amplitude]}
                    onValueChange={(value) => updateSource(source.id, 'amplitude', value[0])}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{source.amplitude.toFixed(1)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phase (π)</label>
                  <Slider
                    value={[source.phase]}
                    onValueChange={(value) => updateSource(source.id, 'phase', value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{source.phase.toFixed(1)}π</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pattern Status */}
          <div className="text-center">
            <Badge 
              variant={currentPattern === targetPattern ? "default" : "secondary"}
              className={`text-lg p-2 ${
                currentPattern === targetPattern 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {currentPattern === targetPattern ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Target Achieved!
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-1" />
                  Keep Adjusting...
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OpticsRayTracing({ game, gameState, onGameAction, onUseHint }: PhysicsGameProps) {
  const [rayAngle, setRayAngle] = useState([30]);
  const [lensPosition, setLensPosition] = useState([200]);
  const [targetHit, setTargetHit] = useState(false);
  const [rayPath, setRayPath] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    calculateRayPath();
  }, [rayAngle, lensPosition]);

  const calculateRayPath = () => {
    // Simplified ray tracing calculation
    const startX = 50;
    const startY = 150;
    const angle = rayAngle[0] * Math.PI / 180;
    
    // Ray to lens
    const lensX = lensPosition[0];
    const lensY = 150;
    
    // Refracted ray (simplified)
    const refractedAngle = angle * 0.7; // Simplified refraction
    const endX = lensX + 100 * Math.cos(refractedAngle);
    const endY = lensY + 100 * Math.sin(refractedAngle);
    
    setRayPath([
      { x: startX, y: startY },
      { x: lensX, y: lensY },
      { x: endX, y: endY }
    ]);

    // Check if ray hits target (simplified)
    const targetX = 350;
    const targetY = 150;
    const distance = Math.sqrt((endX - targetX) ** 2 + (endY - targetY) ** 2);
    
    if (distance < 20) {
      setTargetHit(true);
      onGameAction({
        type: 'correct_answer',
        points: 35,
      });
    } else {
      setTargetHit(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Optics Ray Tracing Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">Objective</h3>
            <div className="text-yellow-800">
              Guide the light ray to hit the target using the lens
            </div>
          </div>

          {/* Optics Setup */}
          <div className="relative h-64 bg-gray-50 rounded-lg border">
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Light source */}
              <circle cx="50" cy="150" r="8" fill="#ffd93d" stroke="#333" strokeWidth="2" />
              <text x="50" y="135" textAnchor="middle" className="text-xs font-bold">
                Light
              </text>
              
              {/* Lens */}
              <ellipse 
                cx={lensPosition[0]} 
                cy="150" 
                rx="8" 
                ry="40" 
                fill="rgba(135, 206, 235, 0.5)" 
                stroke="#333" 
                strokeWidth="2" 
              />
              <text x={lensPosition[0]} y="135" textAnchor="middle" className="text-xs font-bold">
                Lens
              </text>
              
              {/* Target */}
              <circle 
                cx="350" 
                cy="150" 
                r="12" 
                fill={targetHit ? "#4ade80" : "#ef4444"} 
                stroke="#333" 
                strokeWidth="2" 
              />
              <text x="350" y="135" textAnchor="middle" className="text-xs font-bold">
                Target
              </text>
              
              {/* Ray path */}
              {rayPath.length > 1 && (
                <g>
                  {rayPath.slice(0, -1).map((point, index) => (
                    <line
                      key={index}
                      x1={point.x}
                      y1={point.y}
                      x2={rayPath[index + 1].x}
                      y2={rayPath[index + 1].y}
                      stroke="#ff6b6b"
                      strokeWidth="3"
                      markerEnd="url(#arrowhead)"
                    />
                  ))}
                  
                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#ff6b6b"
                      />
                    </marker>
                  </defs>
                </g>
              )}
            </svg>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Ray Angle (degrees)</label>
              <Slider
                value={rayAngle}
                onValueChange={setRayAngle}
                max={60}
                min={-60}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{rayAngle[0]}°</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lens Position</label>
              <Slider
                value={lensPosition}
                onValueChange={setLensPosition}
                max={300}
                min={100}
                step={10}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{lensPosition[0]} px</div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <Badge 
              variant={targetHit ? "default" : "secondary"}
              className={`text-lg p-2 ${
                targetHit 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {targetHit ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Target Hit!
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-1" />
                  Adjust Ray Path
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}