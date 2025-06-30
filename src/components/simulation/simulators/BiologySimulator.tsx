//src/components/simulation/simulators/BiologyEngine.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Eye, Sun, Thermometer, Droplets } from 'lucide-react';
import type { ExperimentStep, SimulationState, UserAction } from '@/types/simulation';

interface BiologySimulatorProps {
  step: ExperimentStep;
  simulationState: SimulationState;
  onUserAction: (action: Omit<UserAction, 'id' | 'timestamp' | 'isValid'>) => void;
  isRunning: boolean;
}

export function BiologySimulator({
  step,
  simulationState,
  onUserAction,
  isRunning
}: BiologySimulatorProps) {
  const [magnification, setMagnification] = useState([100]);
  const [lightIntensity, setLightIntensity] = useState([50]);
  const [temperature, setTemperature] = useState([25]);
  const [oxygenBubbles, setOxygenBubbles] = useState(0);
  const [cellsVisible, setCellsVisible] = useState(false);
  const [photosynthesisRate, setPhotosynthesisRate] = useState(0);

  // Get experiment type from step data
  const getExperimentType = () => {
    const stepData = step.instructions;
    if (typeof stepData === 'object' && stepData.experimentType) {
      return stepData.experimentType;
    }
    return 'general';
  };

  const experimentType = getExperimentType();

  // Calculate biological processes with precision control to prevent infinite loops
  useEffect(() => {
    // Photosynthesis rate based on light intensity and temperature
    const tempFactor = Math.max(0, 1 - Math.abs(temperature[0] - 25) / 25);
    const lightFactor = lightIntensity[0] / 100;
    const newPhotosynthesisRate = Math.round((lightFactor * tempFactor * 100) * 100) / 100; // Round to 2 decimal places
    
    // Only update if value actually changed to prevent infinite loops
    setPhotosynthesisRate(prevRate => {
      const roundedPrev = Math.round(prevRate * 100) / 100;
      return roundedPrev !== newPhotosynthesisRate ? newPhotosynthesisRate : prevRate;
    });
  }, [lightIntensity, temperature]);

  // Oxygen bubble production effect
  useEffect(() => {
    if (isRunning && lightIntensity[0] > 20) {
      const interval = setInterval(() => {
        setOxygenBubbles(prev => prev + Math.floor(photosynthesisRate / 10));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, lightIntensity, photosynthesisRate]);

  // Handle measurements
  const takeMeasurement = (type: string) => {
    if (!isRunning) return;

    let value, unit;
    switch (type) {
      case 'oxygen_bubbles':
        value = oxygenBubbles;
        unit = 'bubbles/min';
        break;
      case 'light_intensity':
        value = lightIntensity[0];
        unit = '%';
        break;
      case 'temperature':
        value = temperature[0];
        unit = '°C';
        break;
      case 'photosynthesis_rate':
        value = photosynthesisRate;
        unit = 'rate';
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

  // Focus microscope
  const focusMicroscope = () => {
    if (!isRunning) return;
    
    setCellsVisible(true);
    onUserAction({
      type: 'focus_microscope',
      data: { magnification: magnification[0] },
      stepNumber: step.step_number,
      sessionId: simulationState.sessionId || '',
    });
  };

  // Render different experiment types
  const renderExperiment = () => {
    switch (experimentType) {
      case 'microscopy':
        return renderMicroscopyExperiment();
      case 'photosynthesis':
        return renderPhotosynthesisExperiment();
      case 'respiration':
        return renderRespirationExperiment();
      default:
        return renderGeneralBiologyExperiment();
    }
  };

  const renderMicroscopyExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Microscope View */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Microscope View</h4>
          <div className="relative w-full h-64 bg-black rounded-full border-4 border-gray-400 overflow-hidden">
            {cellsVisible ? (
              <div className="relative w-full h-full">
                {/* Cell structures */}
                {Array.from({ length: Math.floor(magnification[0] / 20) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute border-2 border-green-400 bg-green-100 rounded-lg"
                    style={{
                      width: `${40 + Math.random() * 20}px`,
                      height: `${30 + Math.random() * 15}px`,
                      left: `${Math.random() * 80}%`,
                      top: `${Math.random() * 80}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {/* Nucleus */}
                    <div 
                      className="absolute bg-blue-400 rounded-full"
                      style={{
                        width: '8px',
                        height: '8px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2" />
                  <p>Focus to see cells</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="outline">
              Magnification: {magnification[0]}x
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Microscope Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Magnification</label>
            <Slider
              value={magnification}
              onValueChange={setMagnification}
              max={1000}
              min={40}
              step={10}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{magnification[0]}x</div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={focusMicroscope}
              disabled={!isRunning}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Focus Microscope
            </Button>
            
            <Button 
              onClick={() => takeMeasurement('cell_count')}
              disabled={!isRunning || !cellsVisible}
              variant="outline"
              className="w-full"
            >
              Count Cells
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Observations</h5>
            <div className="space-y-1 text-sm">
              <div>• Cell walls visible: {cellsVisible ? 'Yes' : 'No'}</div>
              <div>• Nuclei visible: {cellsVisible && magnification[0] > 400 ? 'Yes' : 'No'}</div>
              <div>• Cell count: {cellsVisible ? Math.floor(magnification[0] / 20) : 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhotosynthesisExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Aquatic Plant Setup */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Photosynthesis Setup</h4>
          <div className="relative w-full h-64 bg-blue-100 rounded-lg overflow-hidden">
            {/* Water */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-300" />
            
            {/* Plant */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-32 bg-green-500 rounded-t-lg" />
              {/* Leaves */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-3 bg-green-400 rounded-full"
                  style={{
                    left: i % 2 === 0 ? '-12px' : '8px',
                    bottom: `${20 + i * 15}px`,
                  }}
                />
              ))}
            </div>

            {/* Oxygen bubbles */}
            {Array.from({ length: Math.min(oxygenBubbles, 20) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                style={{
                  left: `${45 + Math.random() * 10}%`,
                  bottom: '100px',
                }}
                animate={{
                  y: [-100, -200],
                  opacity: [0.7, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}

            {/* Light rays */}
            {lightIntensity[0] > 0 && (
              <div className="absolute top-0 left-0 right-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 bg-yellow-300 opacity-60"
                    style={{
                      left: `${20 + i * 15}%`,
                      height: `${lightIntensity[0]}%`,
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-500">{lightIntensity[0]}%</div>
              <div className="text-sm text-gray-500">Light</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{oxygenBubbles}</div>
              <div className="text-sm text-gray-500">O₂ Bubbles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{photosynthesisRate.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Light Intensity (%)</label>
            <Slider
              value={lightIntensity}
              onValueChange={setLightIntensity}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{lightIntensity[0]}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={40}
              min={10}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{temperature[0]}°C</div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => takeMeasurement('oxygen_bubbles')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Count Bubbles
            </Button>
            
            <Button 
              onClick={() => takeMeasurement('photosynthesis_rate')}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              <Sun className="h-4 w-4 mr-2" />
              Measure Rate
            </Button>

            <Button 
              onClick={() => setOxygenBubbles(0)}
              disabled={!isRunning}
              variant="outline"
              className="w-full"
            >
              Reset Counter
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Photosynthesis Equation</h5>
            <div className="text-center text-sm font-mono">
              6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRespirationExperiment = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">Respiration experiment simulator coming soon...</p>
    </div>
  );

  const renderGeneralBiologyExperiment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Biology Simulation</h4>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔬</div>
            <p className="text-gray-600">General biology simulation interface</p>
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