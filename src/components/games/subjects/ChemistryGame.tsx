import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shuffle, RotateCcw, CheckCircle, X } from 'lucide-react';
import type { BaseGame, GameState, PeriodicTableCard, ChemicalEquation } from '@/types/games';

interface ChemistryGameProps {
  game: BaseGame;
  gameState: GameState;
  onGameAction: (action: any) => void;
  onUseHint: () => void;
}

export function ChemistryGame({ game, gameState, onGameAction, onUseHint }: ChemistryGameProps) {
  const renderGame = () => {
    switch (game.gameType) {
      case 'periodic_table_memory':
        return <PeriodicTableMemory {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'equation_balancer':
        return <EquationBalancer {...{ game, gameState, onGameAction, onUseHint }} />;
      case 'molecular_geometry':
        return <MolecularGeometry {...{ game, gameState, onGameAction, onUseHint }} />;
      default:
        return <div>Chemistry game not implemented</div>;
    }
  };

  return <div className="space-y-6">{renderGame()}</div>;
}

function PeriodicTableMemory({ game, gameState, onGameAction, onUseHint }: ChemistryGameProps) {
  const [cards, setCards] = useState<PeriodicTableCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  const elements = [
    { element: 'Hydrogen', symbol: 'H', atomicNumber: 1, atomicMass: 1.008, category: 'nonmetal' },
    { element: 'Helium', symbol: 'He', atomicNumber: 2, atomicMass: 4.003, category: 'noble-gas' },
    { element: 'Lithium', symbol: 'Li', atomicNumber: 3, atomicMass: 6.941, category: 'alkali-metal' },
    { element: 'Carbon', symbol: 'C', atomicNumber: 6, atomicMass: 12.011, category: 'nonmetal' },
    { element: 'Oxygen', symbol: 'O', atomicNumber: 8, atomicMass: 15.999, category: 'nonmetal' },
    { element: 'Sodium', symbol: 'Na', atomicNumber: 11, atomicMass: 22.990, category: 'alkali-metal' },
    { element: 'Iron', symbol: 'Fe', atomicNumber: 26, atomicMass: 55.845, category: 'transition-metal' },
    { element: 'Gold', symbol: 'Au', atomicNumber: 79, atomicMass: 196.967, category: 'transition-metal' },
  ];

  useEffect(() => {
    initializeCards();
  }, []);

  const initializeCards = () => {
    const selectedElements = elements.slice(0, 6); // 6 pairs = 12 cards
    const gameCards: PeriodicTableCard[] = [];

    selectedElements.forEach((element, index) => {
      // Add element name card
      gameCards.push({
        ...element,
        isFlipped: false,
        isMatched: false,
      });
      // Add symbol card
      gameCards.push({
        ...element,
        element: element.symbol, // Show symbol instead of name
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // Update card state
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setAttempts(prev => prev + 1);
      
      setTimeout(() => {
        checkForMatch(newFlippedCards);
      }, 1000);
    }
  };

  const checkForMatch = (flippedIndices: number[]) => {
    const [first, second] = flippedIndices;
    const firstCard = cards[first];
    const secondCard = cards[second];

    const isMatch = firstCard.symbol === secondCard.symbol;

    const newCards = [...cards];
    
    if (isMatch) {
      newCards[first].isMatched = true;
      newCards[second].isMatched = true;
      setMatchedPairs(prev => [...prev, first, second]);
      
      onGameAction({
        type: 'correct_answer',
        points: 20,
      });

      // Check if game is complete
      if (matchedPairs.length + 2 === cards.length) {
        onGameAction({
          type: 'level_complete',
        });
      }
    } else {
      newCards[first].isFlipped = false;
      newCards[second].isFlipped = false;
      
      onGameAction({
        type: 'wrong_answer',
      });
    }

    setCards(newCards);
    setFlippedCards([]);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'alkali-metal': 'bg-red-200 border-red-400',
      'transition-metal': 'bg-blue-200 border-blue-400',
      'nonmetal': 'bg-green-200 border-green-400',
      'noble-gas': 'bg-purple-200 border-purple-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-200 border-gray-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Periodic Table Memory Challenge</span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Attempts: {attempts}</Badge>
              <Badge variant="outline">Matches: {matchedPairs.length / 2}</Badge>
              <Button size="sm" onClick={initializeCards}>
                <Shuffle className="h-4 w-4 mr-1" />
                New Game
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                className={`
                  aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center text-center p-2
                  ${card.isMatched ? 'bg-green-100 border-green-400' : 
                    card.isFlipped ? getCategoryColor(card.category) : 'bg-gray-100 border-gray-300'}
                  ${!card.isFlipped && !card.isMatched ? 'hover:bg-gray-200' : ''}
                `}
                onClick={() => handleCardClick(index)}
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 180 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div className="font-bold text-lg">{card.element}</div>
                      {card.element.length <= 2 && (
                        <div className="text-xs text-gray-600">#{card.atomicNumber}</div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 180 }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl"
                    >
                      ⚛️
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EquationBalancer({ game, gameState, onGameAction, onUseHint }: ChemistryGameProps) {
  const [currentEquation, setCurrentEquation] = useState<ChemicalEquation | null>(null);
  const [userCoefficients, setUserCoefficients] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const equations = [
    {
      id: '1',
      reactants: ['H₂', 'O₂'],
      products: ['H₂O'],
      coefficients: [2, 1, 2],
      isBalanced: false,
      difficulty: 1,
    },
    {
      id: '2',
      reactants: ['CH₄', 'O₂'],
      products: ['CO₂', 'H₂O'],
      coefficients: [1, 2, 1, 2],
      isBalanced: false,
      difficulty: 2,
    },
    {
      id: '3',
      reactants: ['Fe', 'O₂'],
      products: ['Fe₂O₃'],
      coefficients: [4, 3, 2],
      isBalanced: false,
      difficulty: 2,
    },
  ];

  useEffect(() => {
    loadNewEquation();
  }, []);

  const loadNewEquation = () => {
    const equation = equations[Math.floor(Math.random() * equations.length)];
    setCurrentEquation(equation);
    setUserCoefficients(new Array(equation.reactants.length + equation.products.length).fill(1));
    setShowFeedback(false);
  };

  const handleCoefficientChange = (index: number, value: string) => {
    const newCoefficients = [...userCoefficients];
    newCoefficients[index] = parseInt(value) || 1;
    setUserCoefficients(newCoefficients);
  };

  const checkBalance = () => {
    if (!currentEquation) return;

    const correct = JSON.stringify(userCoefficients) === JSON.stringify(currentEquation.coefficients);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      onGameAction({
        type: 'correct_answer',
        points: 30 * currentEquation.difficulty,
      });
      
      setTimeout(() => {
        loadNewEquation();
      }, 2000);
    } else {
      onGameAction({
        type: 'wrong_answer',
      });
    }
  };

  if (!currentEquation) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Chemical Equation Balancer</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Difficulty: {currentEquation.difficulty}</Badge>
              <Button size="sm" onClick={onUseHint}>
                💡 Hint
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-mono flex items-center justify-center space-x-2 flex-wrap">
              {/* Reactants */}
              {currentEquation.reactants.map((reactant, index) => (
                <React.Fragment key={`reactant-${index}`}>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={userCoefficients[index]}
                    onChange={(e) => handleCoefficientChange(index, e.target.value)}
                    className="w-16 h-12 text-center text-lg"
                  />
                  <span className="text-xl">{reactant}</span>
                  {index < currentEquation.reactants.length - 1 && (
                    <span className="text-xl text-gray-500">+</span>
                  )}
                </React.Fragment>
              ))}
              
              <span className="text-2xl text-blue-600 mx-4">→</span>
              
              {/* Products */}
              {currentEquation.products.map((product, index) => (
                <React.Fragment key={`product-${index}`}>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={userCoefficients[currentEquation.reactants.length + index]}
                    onChange={(e) => handleCoefficientChange(currentEquation.reactants.length + index, e.target.value)}
                    className="w-16 h-12 text-center text-lg"
                  />
                  <span className="text-xl">{product}</span>
                  {index < currentEquation.products.length - 1 && (
                    <span className="text-xl text-gray-500">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={checkBalance} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Check Balance
            </Button>
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-center p-4 rounded-lg ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Correct! The equation is balanced.</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span>Not quite right. Check your coefficients.</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

function MolecularGeometry({ game, gameState, onGameAction, onUseHint }: ChemistryGameProps) {
  const [currentMolecule, setCurrentMolecule] = useState<any>(null);
  const [selectedGeometry, setSelectedGeometry] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const molecules = [
    {
      formula: 'CH₄',
      geometry: 'tetrahedral',
      bondAngle: 109.5,
      description: 'Methane with 4 bonding pairs',
    },
    {
      formula: 'NH₃',
      geometry: 'trigonal pyramidal',
      bondAngle: 107,
      description: 'Ammonia with 3 bonding pairs and 1 lone pair',
    },
    {
      formula: 'H₂O',
      geometry: 'bent',
      bondAngle: 104.5,
      description: 'Water with 2 bonding pairs and 2 lone pairs',
    },
    {
      formula: 'CO₂',
      geometry: 'linear',
      bondAngle: 180,
      description: 'Carbon dioxide with 2 double bonds',
    },
  ];

  const geometries = [
    'linear',
    'bent',
    'trigonal planar',
    'trigonal pyramidal',
    'tetrahedral',
    'trigonal bipyramidal',
    'octahedral',
  ];

  useEffect(() => {
    loadNewMolecule();
  }, []);

  const loadNewMolecule = () => {
    const molecule = molecules[Math.floor(Math.random() * molecules.length)];
    setCurrentMolecule(molecule);
    setSelectedGeometry('');
    setShowFeedback(false);
  };

  const handleGeometrySelect = (geometry: string) => {
    setSelectedGeometry(geometry);
  };

  const checkAnswer = () => {
    if (!currentMolecule || !selectedGeometry) return;

    const correct = selectedGeometry === currentMolecule.geometry;
    setShowFeedback(true);

    if (correct) {
      onGameAction({
        type: 'correct_answer',
        points: 25,
      });
      
      setTimeout(() => {
        loadNewMolecule();
      }, 3000);
    } else {
      onGameAction({
        type: 'wrong_answer',
      });
    }
  };

  if (!currentMolecule) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Molecular Geometry Puzzle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">{currentMolecule.formula}</div>
            <p className="text-gray-600">{currentMolecule.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Select the molecular geometry:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {geometries.map((geometry) => (
                <Button
                  key={geometry}
                  variant={selectedGeometry === geometry ? 'default' : 'outline'}
                  onClick={() => handleGeometrySelect(geometry)}
                  className="h-auto p-4 text-center"
                >
                  <div>
                    <div className="font-medium">{geometry}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={checkAnswer} 
              disabled={!selectedGeometry}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-center p-4 rounded-lg ${
                  selectedGeometry === currentMolecule.geometry 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedGeometry === currentMolecule.geometry ? (
                  <div>
                    <CheckCircle className="h-5 w-5 mx-auto mb-2" />
                    <div>Correct! {currentMolecule.formula} has {currentMolecule.geometry} geometry.</div>
                    <div className="text-sm mt-1">Bond angle: {currentMolecule.bondAngle}°</div>
                  </div>
                ) : (
                  <div>
                    <X className="h-5 w-5 mx-auto mb-2" />
                    <div>Incorrect. The correct geometry is {currentMolecule.geometry}.</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}