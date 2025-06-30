import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dna, TreePine, CheckCircle, X, RotateCcw } from 'lucide-react';
import type { BaseGame, GameState, Chromosome, DNABase, EcosystemOrganism } from '@/types/games';

interface BiologyGameProps {
  game: BaseGame;
  gameState: GameState;
  onGameAction: (action: any) => void;
  onUseHint: () => void;
}

export function BiologyGame({ game, gameState, onGameAction, onUseHint }: BiologyGameProps) {
  const renderGame = () => {
    switch (game.gameType) {
      case 'cell_division_race':
        return <CellDivisionRace {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'dna_sequence_decoder':
        return <DNASequenceDecoder {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'ecosystem_balance':
        return <EcosystemBalance {...{ game, gameState, onGameAction, onUseHint }} />;
      default:
        return <div>Biology game not implemented</div>;
    }
  };

  return <div className="space-y-6">{renderGame()}</div>;
}

function CellDivisionRace({ game, gameState, onGameAction, onUseHint }: BiologyGameProps) {
  const [chromosomes, setChromosomes] = useState<Chromosome[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('prophase');
  const [isCorrectArrangement, setIsCorrectArrangement] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  const phases = ['prophase', 'metaphase', 'anaphase', 'telophase'];
  const phaseInstructions = {
    prophase: 'Chromosomes condense and become visible',
    metaphase: 'Align chromosomes at the cell center',
    anaphase: 'Separate sister chromatids to opposite poles',
    telophase: 'Nuclear envelopes reform around each set of chromosomes',
  };

  useEffect(() => {
    initializeChromosomes();
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onGameAction({ type: 'wrong_answer' });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initializeChromosomes = () => {
    const newChromosomes: Chromosome[] = [];
    for (let i = 0; i < 8; i++) {
      newChromosomes.push({
        id: `chr-${i}`,
        type: i % 2 === 0 ? 'maternal' : 'paternal',
        genes: [`gene${i}A`, `gene${i}B`],
        position: { 
          x: Math.random() * 300 + 50, 
          y: Math.random() * 200 + 50 
        },
        isPaired: false,
      });
    }
    setChromosomes(newChromosomes);
  };

  const moveChromosome = (id: string, newPosition: { x: number; y: number }) => {
    setChromosomes(prev => prev.map(chr => 
      chr.id === id ? { ...chr, position: newPosition } : chr
    ));
    checkArrangement();
  };

  const checkArrangement = () => {
    // Simplified check based on current phase
    let correct = false;
    
    switch (currentPhase) {
      case 'metaphase':
        // Check if chromosomes are aligned in the center
        correct = chromosomes.every(chr => 
          Math.abs(chr.position.x - 200) < 50
        );
        break;
      case 'anaphase':
        // Check if chromosomes are separated
        const leftSide = chromosomes.filter(chr => chr.position.x < 200);
        const rightSide = chromosomes.filter(chr => chr.position.x > 200);
        correct = leftSide.length === rightSide.length && leftSide.length > 0;
        break;
      default:
        correct = true;
    }

    setIsCorrectArrangement(correct);
    
    if (correct && !isCorrectArrangement) {
      onGameAction({
        type: 'correct_answer',
        points: 25,
      });
      
      // Move to next phase
      const currentIndex = phases.indexOf(currentPhase);
      if (currentIndex < phases.length - 1) {
        setTimeout(() => {
          setCurrentPhase(phases[currentIndex + 1]);
          setTimeRemaining(30);
        }, 1500);
      } else {
        onGameAction({
          type: 'level_complete',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Dna className="h-5 w-5 mr-2 text-green-600" />
              Cell Division Race
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Phase: {currentPhase}</Badge>
              <Badge variant={timeRemaining > 10 ? "outline" : "destructive"}>
                Time: {timeRemaining}s
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phase Instructions */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2 capitalize">{currentPhase} Phase</h3>
            <p className="text-green-800">{phaseInstructions[currentPhase as keyof typeof phaseInstructions]}</p>
          </div>

          {/* Cell Visualization */}
          <div className="relative h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              {/* Cell membrane */}
              <ellipse 
                cx="200" 
                cy="150" 
                rx="180" 
                ry="130" 
                fill="rgba(200, 230, 255, 0.3)" 
                stroke="#333" 
                strokeWidth="2" 
              />
              
              {/* Cell center line (for metaphase) */}
              {currentPhase === 'metaphase' && (
                <line 
                  x1="200" 
                  y1="50" 
                  x2="200" 
                  y2="250" 
                  stroke="#ff6b6b" 
                  strokeWidth="2" 
                  strokeDasharray="5,5" 
                />
              )}
              
              {/* Chromosomes */}
              {chromosomes.map((chromosome) => (
                <g key={chromosome.id}>
                  <motion.rect
                    x={chromosome.position.x - 8}
                    y={chromosome.position.y - 15}
                    width="16"
                    height="30"
                    rx="8"
                    fill={chromosome.type === 'maternal' ? '#ff6b6b' : '#4ecdc4'}
                    stroke="#333"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    drag
                    onDrag={(event, info) => {
                      const rect = event.currentTarget.closest('svg')?.getBoundingClientRect();
                      if (rect) {
                        const x = (info.point.x - rect.left) * (400 / rect.width);
                        const y = (info.point.y - rect.top) * (300 / rect.height);
                        moveChromosome(chromosome.id, { x, y });
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileDrag={{ scale: 1.2 }}
                  />
                  
                  {/* Centromere */}
                  <circle
                    cx={chromosome.position.x}
                    cy={chromosome.position.y}
                    r="3"
                    fill="#333"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Progress and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Phase Progress</span>
                <span>{phases.indexOf(currentPhase) + 1} / {phases.length}</span>
              </div>
              <Progress value={((phases.indexOf(currentPhase) + 1) / phases.length) * 100} />
            </div>
            
            <div className="text-center">
              <Badge 
                variant={isCorrectArrangement ? "default" : "secondary"}
                className={`text-lg p-2 ${
                  isCorrectArrangement 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {isCorrectArrangement ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Correct!
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Keep arranging...
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onUseHint} variant="outline">
              💡 Hint
            </Button>
            <Button onClick={initializeChromosomes} variant="outline">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DNASequenceDecoder({ game, gameState, onGameAction, onUseHint }: BiologyGameProps) {
  const [dnaSequence, setDnaSequence] = useState<DNABase[]>([]);
  const [complementSequence, setComplementSequence] = useState<DNABase[]>([]);
  const [currentBase, setCurrentBase] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const baseColors = {
    A: '#ff6b6b', // Red
    T: '#4ecdc4', // Teal
    G: '#ffd93d', // Yellow
    C: '#a8e6cf', // Green
  };

  const basePairs = { A: 'T', T: 'A', G: 'C', C: 'G' };

  useEffect(() => {
    generateSequence();
  }, []);

  const generateSequence = () => {
    const bases = ['A', 'T', 'G', 'C'];
    const sequence: DNABase[] = [];
    
    for (let i = 0; i < 12; i++) {
      sequence.push({
        id: `base-${i}`,
        type: bases[Math.floor(Math.random() * bases.length)] as 'A' | 'T' | 'G' | 'C',
        position: i,
        isPaired: false,
      });
    }
    
    setDnaSequence(sequence);
    setComplementSequence(new Array(12).fill(null).map((_, i) => ({
      id: `comp-${i}`,
      type: 'A' as 'A' | 'T' | 'G' | 'C',
      position: i,
      isPaired: false,
    })));
    setCurrentBase(0);
    setScore(0);
    setMistakes(0);
  };

  const selectBase = (baseType: 'A' | 'T' | 'G' | 'C') => {
    if (currentBase >= dnaSequence.length) return;

    const originalBase = dnaSequence[currentBase];
    const correctPair = basePairs[originalBase.type as keyof typeof basePairs];
    const isCorrect = baseType === correctPair;

    // Update complement sequence
    const newComplement = [...complementSequence];
    newComplement[currentBase] = {
      ...newComplement[currentBase],
      type: baseType,
      isPaired: isCorrect,
    };
    setComplementSequence(newComplement);

    // Update DNA sequence pairing status
    const newDNA = [...dnaSequence];
    newDNA[currentBase].isPaired = isCorrect;
    setDnaSequence(newDNA);

    if (isCorrect) {
      setScore(prev => prev + 10);
      onGameAction({
        type: 'correct_answer',
        points: 10,
      });
    } else {
      setMistakes(prev => prev + 1);
      onGameAction({
        type: 'wrong_answer',
      });
    }

    // Move to next base
    setTimeout(() => {
      if (currentBase < dnaSequence.length - 1) {
        setCurrentBase(prev => prev + 1);
      } else {
        // Sequence complete
        const accuracy = ((dnaSequence.length - mistakes) / dnaSequence.length) * 100;
        if (accuracy >= 80) {
          onGameAction({
            type: 'level_complete',
          });
        }
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Dna className="h-5 w-5 mr-2 text-blue-600" />
              DNA Sequence Decoder
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Score: {score}</Badge>
              <Badge variant="outline">Mistakes: {mistakes}</Badge>
              <Badge variant="outline">
                Progress: {currentBase + 1}/{dnaSequence.length}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Base Pairing Rules</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>A pairs with T</div>
              <div>G pairs with C</div>
            </div>
          </div>

          {/* DNA Strands */}
          <div className="space-y-4">
            {/* Original Strand */}
            <div>
              <h4 className="font-semibold mb-2">Original DNA Strand (5' → 3')</h4>
              <div className="flex space-x-2 justify-center">
                {dnaSequence.map((base, index) => (
                  <motion.div
                    key={base.id}
                    className={`
                      w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white
                      ${index === currentBase ? 'ring-4 ring-blue-400' : ''}
                      ${base.isPaired ? 'border-green-400' : 'border-gray-400'}
                    `}
                    style={{ backgroundColor: baseColors[base.type] }}
                    animate={index === currentBase ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: index === currentBase ? Infinity : 0 }}
                  >
                    {base.type}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hydrogen Bonds */}
            <div className="text-center">
              <div className="flex justify-center space-x-2">
                {dnaSequence.map((_, index) => (
                  <div key={index} className="w-12 text-center">
                    {index <= currentBase && (
                      <div className="text-gray-400 text-xs">
                        {complementSequence[index]?.isPaired ? '|||' : '···'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Complement Strand */}
            <div>
              <h4 className="font-semibold mb-2">Complement DNA Strand (3' → 5')</h4>
              <div className="flex space-x-2 justify-center">
                {complementSequence.map((base, index) => (
                  <div
                    key={base.id}
                    className={`
                      w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white
                      ${index > currentBase ? 'bg-gray-300 border-gray-400' : ''}
                      ${index <= currentBase && base.isPaired ? 'border-green-400' : 'border-red-400'}
                    `}
                    style={{ 
                      backgroundColor: index <= currentBase 
                        ? baseColors[base.type] 
                        : '#d1d5db' 
                    }}
                  >
                    {index <= currentBase ? base.type : '?'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Base Selection */}
          {currentBase < dnaSequence.length && (
            <div className="text-center space-y-4">
              <h4 className="font-semibold">
                Select the complement for: 
                <span 
                  className="ml-2 px-3 py-1 rounded text-white font-bold"
                  style={{ backgroundColor: baseColors[dnaSequence[currentBase].type] }}
                >
                  {dnaSequence[currentBase].type}
                </span>
              </h4>
              
              <div className="flex justify-center space-x-4">
                {Object.keys(baseColors).map((base) => (
                  <Button
                    key={base}
                    onClick={() => selectBase(base as 'A' | 'T' | 'G' | 'C')}
                    className="w-16 h-16 text-xl font-bold text-white"
                    style={{ backgroundColor: baseColors[base as keyof typeof baseColors] }}
                  >
                    {base}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Sequence Progress</span>
              <span>{Math.round(((currentBase + 1) / dnaSequence.length) * 100)}%</span>
            </div>
            <Progress value={((currentBase + 1) / dnaSequence.length) * 100} />
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onUseHint} variant="outline">
              💡 Hint
            </Button>
            <Button onClick={generateSequence} variant="outline">
              <RotateCcw className="h-4 w-4 mr-1" />
              New Sequence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EcosystemBalance({ game, gameState, onGameAction, onUseHint }: BiologyGameProps) {
  const [organisms, setOrganisms] = useState<EcosystemOrganism[]>([]);
  const [ecosystemHealth, setEcosystemHealth] = useState(50);
  const [isBalanced, setIsBalanced] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    initializeEcosystem();
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      updateEcosystem();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initializeEcosystem = () => {
    const newOrganisms: EcosystemOrganism[] = [
      {
        id: 'grass',
        species: 'Grass',
        trophicLevel: 1,
        population: 100,
        energyRequirement: 0,
        reproductionRate: 0.1,
        position: { x: 100, y: 200 },
      },
      {
        id: 'rabbit',
        species: 'Rabbit',
        trophicLevel: 2,
        population: 20,
        energyRequirement: 5,
        reproductionRate: 0.05,
        position: { x: 200, y: 150 },
      },
      {
        id: 'fox',
        species: 'Fox',
        trophicLevel: 3,
        population: 5,
        energyRequirement: 10,
        reproductionRate: 0.02,
        position: { x: 300, y: 100 },
      },
    ];
    setOrganisms(newOrganisms);
  };

  const updateEcosystem = () => {
    setOrganisms(prev => {
      const updated = prev.map(organism => {
        let newPopulation = organism.population;
        
        // Population dynamics based on trophic level
        if (organism.trophicLevel === 1) {
          // Producers grow naturally
          newPopulation += organism.population * organism.reproductionRate;
        } else {
          // Consumers need food from lower trophic levels
          const prey = prev.find(p => p.trophicLevel === organism.trophicLevel - 1);
          if (prey && prey.population > organism.energyRequirement) {
            newPopulation += organism.population * organism.reproductionRate;
          } else {
            newPopulation -= organism.population * 0.1; // Starvation
          }
        }
        
        return {
          ...organism,
          population: Math.max(0, Math.floor(newPopulation)),
        };
      });
      
      // Calculate ecosystem health
      const totalBiomass = updated.reduce((sum, org) => sum + org.population, 0);
      const diversity = updated.filter(org => org.population > 0).length;
      const health = Math.min(100, (totalBiomass / 10) + (diversity * 20));
      
      setEcosystemHealth(health);
      
      // Check if ecosystem is balanced
      const balanced = health > 70 && updated.every(org => org.population > 0);
      setIsBalanced(balanced);
      
      if (balanced && !isBalanced) {
        onGameAction({
          type: 'correct_answer',
          points: 50,
        });
      }
      
      return updated;
    });
  };

  const adjustPopulation = (id: string, change: number) => {
    setOrganisms(prev => prev.map(org => 
      org.id === id 
        ? { ...org, population: Math.max(0, org.population + change) }
        : org
    ));
  };

  const getOrganismIcon = (species: string) => {
    const icons = {
      Grass: '🌱',
      Rabbit: '🐰',
      Fox: '🦊',
    };
    return icons[species as keyof typeof icons] || '🔬';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TreePine className="h-5 w-5 mr-2 text-green-600" />
              Ecosystem Balance Simulator
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Time: {timeElapsed}s</Badge>
              <Badge 
                variant={ecosystemHealth > 70 ? "default" : "destructive"}
                className={ecosystemHealth > 70 ? "bg-green-100 text-green-800" : ""}
              >
                Health: {ecosystemHealth.toFixed(0)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ecosystem Health */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2">Ecosystem Health</h3>
            <Progress value={ecosystemHealth} className="h-4 mb-2" />
            <p className="text-sm text-green-800">
              Maintain balance between all trophic levels for a healthy ecosystem
            </p>
          </div>

          {/* Ecosystem Visualization */}
          <div className="relative h-64 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg border">
            <svg width="100%" height="100%" viewBox="0 0 400 250">
              {/* Food web connections */}
              <line x1="150" y1="200" x2="200" y2="150" stroke="#666" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="250" y1="150" x2="300" y2="100" stroke="#666" strokeWidth="2" strokeDasharray="3,3" />
              
              {/* Organisms */}
              {organisms.map((organism) => (
                <g key={organism.id}>
                  <circle
                    cx={organism.position.x}
                    cy={organism.position.y}
                    r={Math.max(20, Math.min(50, organism.population / 2))}
                    fill={organism.population > 0 ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                    stroke={organism.population > 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                  />
                  <text
                    x={organism.position.x}
                    y={organism.position.y - 5}
                    textAnchor="middle"
                    className="text-2xl"
                  >
                    {getOrganismIcon(organism.species)}
                  </text>
                  <text
                    x={organism.position.x}
                    y={organism.position.y + 15}
                    textAnchor="middle"
                    className="text-xs font-bold"
                  >
                    {organism.population}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Population Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organisms.map((organism) => (
              <div key={organism.id} className="p-4 border rounded-lg">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-1">{getOrganismIcon(organism.species)}</div>
                  <h4 className="font-semibold">{organism.species}</h4>
                  <Badge variant="outline">Level {organism.trophicLevel}</Badge>
                </div>
                
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold">{organism.population}</div>
                  <div className="text-sm text-gray-500">Population</div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustPopulation(organism.id, -5)}
                    disabled={organism.population <= 0}
                    className="flex-1"
                  >
                    -5
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustPopulation(organism.id, 5)}
                    className="flex-1"
                  >
                    +5
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="text-center">
            <Badge 
              variant={isBalanced ? "default" : "secondary"}
              className={`text-lg p-2 ${
                isBalanced 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isBalanced ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ecosystem Balanced!
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Ecosystem Unstable
                </>
              )}
            </Badge>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onUseHint} variant="outline">
              💡 Hint
            </Button>
            <Button onClick={initializeEcosystem} variant="outline">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Ecosystem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}