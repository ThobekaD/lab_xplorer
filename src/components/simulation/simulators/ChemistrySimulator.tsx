//src/components/simulation/simulators/ChemistrySimulator.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Beaker, Droplets, Thermometer, Scale } from 'lucide-react';
import type { ExperimentStep, SimulationState, UserAction } from '@/types/simulation';

interface ChemistrySimulatorProps {
  step: ExperimentStep;
  simulationState: SimulationState;
  onUserAction: (action: Omit<UserAction, 'id' | 'timestamp' | 'isValid'>) => void;
  isRunning: boolean;
}

export function ChemistrySimulator({
  step,
  simulationState,
  onUserAction,
  isRunning
}: ChemistrySimulatorProps) {
  const [selectedReagent, setSelectedReagent] = useState<string>('');
  const [volume, setVolume] = useState([10]);
  const [temperature, setTemperature] = useState([25]);
  const [ph, setPh] = useState([7]);
  const [reactionProgress, setReactionProgress] = useState(0);
  const [colorChange, setColorChange] = useState('#ffffff');

  // Simulate different chemistry experiments based on step data
  const getExperimentType = () => {
    const stepData = step.instructions;
    if (typeof stepData === 'object' && stepData.experimentType) {
      return stepData.experimentType;
    }
    return 'general';
  };

  const experimentType = getExperimentType();

  // Handle reagent addition
  const addReagent = (reagent: string) => {
    if (!isRunning) return;

    onUserAction({
      type: 'add_reagent',
      data: { reagent, volume: volume[0], temperature: temperature[0] },
      stepNumber: step.step_number,
      sessionId: simulationState.sessionId || '',
    });

    // Simulate reaction
    setReactionProgress(prev => Math.min(prev + 20, 100));
    
    // Simulate color change based on reagent
    if (reagent === 'acid') {
      setColorChange('#ff6b6b');
    } else if (reagent === 'base') {
      setColorChange('#4ecdc4');
    } else if (reagent === 'indicator') {
      setColorChange('#ffd93d');
    }
  };

  // Handle measurement
  const takeMeasurement = (type: string) => {
    if (!isRunning) return;

    const value = type === 'ph' ? ph[0] : type === 'temperature' ? temperature[0] : volume[0];
    
    onUserAction({
      type: 'measurement',
      data: { 
        measurementType: type, 
        value, 
        unit: type === 'ph' ? 'pH' : type === 'temperature' ? '°C' : 'mL' 
      },
      stepNumber: step.step_number,
      sessionId: simulationState.sessionId || '',
    });
  };

  // Render different experiment types
  const renderExperiment = () => {
    switch (experimentType) {
      case 'acid_base_titration':
        return renderTitrationExperiment();
      case 'ph_indicator':
        return renderPhIndicatorExperiment();
      case 'density_column':
        return renderDensityExperiment();
      default:
        return renderGeneralChemistryExperiment();
    }
  };

  const renderTitrationExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Burette and Flask */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="font-semibold">Titration Setup</h4>
            
            {/* Burette */}
            <div className="relative mx-auto w-16 h-64 bg-gray-200 rounded-lg">
              <div 
                className="absolute bottom-0 w-full bg-blue-400 rounded-b-lg transition-all duration-1000"
                style={{ height: `${100 - reactionProgress}%` }}
              />
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-mono">
                {(50 - (reactionProgress * 0.5)).toFixed(1)} mL
              </div>
            </div>

            {/* Flask */}
            <div className="relative mx-auto w-24 h-24">
              <div 
                className="w-full h-full rounded-full border-4 border-gray-400 transition-colors duration-500"
                style={{ backgroundColor: colorChange }}
              />
              <Badge className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                pH: {ph[0].toFixed(1)}
              </Badge>
            </div>

            <Button 
              onClick={() => addReagent('titrant')}
              disabled={!isRunning || reactionProgress >= 100}
              className="w-full"
            >
              Add Titrant (0.1 mL)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Volume (mL)</label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={50}
              min={0.1}
              step={0.1}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{volume[0]} mL</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">pH</label>
            <Slider
              value={ph}
              onValueChange={setPh}
              max={14}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{ph[0].toFixed(1)}</div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => takeMeasurement('ph')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Thermometer className="h-4 w-4 mr-2" />
              Measure pH
            </Button>
            
            <Button 
              onClick={() => takeMeasurement('volume')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Record Volume
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Reaction Progress</h5>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${reactionProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">{reactionProgress}% Complete</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhIndicatorExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Test Tubes */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">pH Indicator Test</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Lemon Juice', 'Water', 'Soap'].map((solution, index) => (
              <div key={solution} className="text-center">
                <div 
                  className="w-16 h-32 mx-auto rounded-lg border-2 border-gray-400 transition-colors duration-500"
                  style={{ 
                    backgroundColor: index === 0 ? '#ff6b6b' : index === 1 ? '#4ecdc4' : '#9b59b6' 
                  }}
                />
                <p className="text-sm mt-2">{solution}</p>
                <Badge variant="outline" className="mt-1">
                  pH: {index === 0 ? '2.0' : index === 1 ? '7.0' : '9.0'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="font-semibold">Add Indicator</h4>
          
          <Button 
            onClick={() => addReagent('indicator')}
            disabled={!isRunning}
            className="w-full"
          >
            <Droplets className="h-4 w-4 mr-2" />
            Add Red Cabbage Juice
          </Button>

          <div className="space-y-2">
            {['Lemon Juice', 'Water', 'Soap'].map((solution) => (
              <Button
                key={solution}
                onClick={() => takeMeasurement('ph')}
                disabled={!isRunning}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Test {solution}
              </Button>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">pH Scale</h5>
            <div className="flex justify-between text-xs">
              <span>Acidic</span>
              <span>Neutral</span>
              <span>Basic</span>
            </div>
            <div className="w-full h-4 rounded-lg bg-gradient-to-r from-red-500 via-green-500 to-blue-500 mt-1" />
            <div className="flex justify-between text-xs mt-1">
              <span>0</span>
              <span>7</span>
              <span>14</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDensityExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Density Column */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Density Column</h4>
          <div className="relative mx-auto w-32 h-64 border-4 border-gray-400 rounded-lg overflow-hidden">
            {/* Layers */}
            <div className="absolute bottom-0 w-full h-16 bg-amber-600" /> {/* Honey */}
            <div className="absolute bottom-16 w-full h-12 bg-blue-400" /> {/* Dish Soap */}
            <div className="absolute bottom-28 w-full h-12 bg-blue-200" /> {/* Water */}
            <div className="absolute bottom-40 w-full h-12 bg-yellow-300" /> {/* Oil */}
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-300 rounded mr-2" />
              <span>Oil (0.92 g/mL)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 rounded mr-2" />
              <span>Water (1.00 g/mL)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-400 rounded mr-2" />
              <span>Dish Soap (1.03 g/mL)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-600 rounded mr-2" />
              <span>Honey (1.42 g/mL)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="font-semibold">Add Liquids</h4>
          
          {['Honey', 'Dish Soap', 'Water', 'Oil'].map((liquid) => (
            <Button
              key={liquid}
              onClick={() => addReagent(liquid.toLowerCase())}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Add {liquid}
            </Button>
          ))}

          <div className="space-y-2">
            <Button 
              onClick={() => takeMeasurement('density')}
              disabled={!isRunning}
              className="w-full"
            >
              <Scale className="h-4 w-4 mr-2" />
              Measure Density
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGeneralChemistryExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Reaction Vessel */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="font-semibold">Reaction Vessel</h4>
            
            <div className="relative mx-auto w-32 h-32">
              <div 
                className="w-full h-full rounded-full border-4 border-gray-400 transition-colors duration-500"
                style={{ backgroundColor: colorChange }}
              />
              {reactionProgress > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-2xl">⚗️</div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="font-medium">Temperature</div>
                <div>{temperature[0]}°C</div>
              </div>
              <div>
                <div className="font-medium">pH</div>
                <div>{ph[0].toFixed(1)}</div>
              </div>
              <div>
                <div className="font-medium">Volume</div>
                <div>{volume[0]} mL</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Volume (mL)</label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => addReagent('acid')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              Add Acid
            </Button>
            
            <Button 
              onClick={() => addReagent('base')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              Add Base
            </Button>

            <Button 
              onClick={() => takeMeasurement('ph')}
              disabled={!isRunning}
              className="w-full"
            >
              <Beaker className="h-4 w-4 mr-2" />
              Take Measurement
            </Button>
          </div>
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