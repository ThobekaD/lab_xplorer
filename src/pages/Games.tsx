import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Clock, Star, Play, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameEngine } from '@/components/games/GameEngine';
import { useAuthStore } from '@/stores/useAuthStore';
import type { BaseGame, GameSession } from '@/types/games';

export function Games() {
  const { user } = useAuthStore();
  const [selectedGame, setSelectedGame] = useState<BaseGame | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const games: BaseGame[] = [
    // Chemistry Games
    {
      id: 'periodic-memory',
      title: 'Periodic Table Memory Challenge',
      description: 'Match elements with their symbols in this fast-paced memory game.',
      subject: 'chemistry',
      difficulty: 2,
      estimatedDuration: 8,
      maxScore: 1000,
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'periodic_table_memory',
      instructions: [
        'Flip cards to reveal elements and symbols',
        'Match each element with its correct symbol',
        'Complete all pairs as quickly as possible',
        'Earn bonus points for consecutive matches'
      ],
      learningObjectives: [
        'Memorize element symbols',
        'Understand periodic table organization',
        'Recognize element categories'
      ]
    },
    {
      id: 'equation-balancer',
      title: 'Chemical Equation Balancer',
      description: 'Balance chemical equations by adjusting coefficients.',
      subject: 'chemistry',
      difficulty: 3,
      estimatedDuration: 12,
      maxScore: 1500,
      thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'equation_balancer',
      instructions: [
        'Drag coefficients to balance equations',
        'Follow conservation of mass',
        'Check your work before submitting',
        'Progress through increasingly complex reactions'
      ],
      learningObjectives: [
        'Apply conservation of mass',
        'Balance chemical equations',
        'Understand stoichiometry'
      ]
    },
    {
      id: 'molecular-geometry',
      title: 'Molecular Geometry Puzzle',
      description: 'Identify molecular shapes using VSEPR theory.',
      subject: 'chemistry',
      difficulty: 4,
      estimatedDuration: 15,
      maxScore: 2000,
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'molecular_geometry',
      instructions: [
        'Analyze molecular formulas',
        'Determine electron pair geometry',
        'Select the correct molecular shape',
        'Consider lone pairs and bonding pairs'
      ],
      learningObjectives: [
        'Apply VSEPR theory',
        'Predict molecular shapes',
        'Understand bond angles'
      ]
    },

    // Physics Games
    {
      id: 'circuit-maze',
      title: 'Circuit Maze Challenge',
      description: 'Navigate electricity through complex circuits using Ohm\'s law.',
      subject: 'physics',
      difficulty: 3,
      estimatedDuration: 10,
      maxScore: 1200,
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'circuit_maze',
      instructions: [
        'Adjust voltage and resistance values',
        'Achieve target current values',
        'Understand series and parallel circuits',
        'Apply Ohm\'s law principles'
      ],
      learningObjectives: [
        'Master Ohm\'s law calculations',
        'Understand electrical circuits',
        'Analyze current flow'
      ]
    },
    {
      id: 'wave-interference',
      title: 'Wave Interference Simulator',
      description: 'Create constructive and destructive interference patterns.',
      subject: 'physics',
      difficulty: 4,
      estimatedDuration: 12,
      maxScore: 1800,
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'wave_interference',
      instructions: [
        'Control multiple wave sources',
        'Adjust frequency and amplitude',
        'Create specific interference patterns',
        'Understand wave superposition'
      ],
      learningObjectives: [
        'Understand wave interference',
        'Apply superposition principle',
        'Analyze wave patterns'
      ]
    },
    {
      id: 'optics-ray-tracing',
      title: 'Optics Ray Tracing Game',
      description: 'Guide light rays through mirrors and lenses to hit targets.',
      subject: 'physics',
      difficulty: 3,
      estimatedDuration: 8,
      maxScore: 1000,
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'optics_ray_tracing',
      instructions: [
        'Adjust ray angles and lens positions',
        'Apply laws of reflection and refraction',
        'Hit targets with precision',
        'Understand focal points'
      ],
      learningObjectives: [
        'Apply laws of optics',
        'Understand refraction and reflection',
        'Work with lenses and mirrors'
      ]
    },

    // Biology Games
    {
      id: 'cell-division-race',
      title: 'Cell Division Race',
      description: 'Arrange chromosomes correctly during mitosis phases.',
      subject: 'biology',
      difficulty: 3,
      estimatedDuration: 10,
      maxScore: 1500,
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'cell_division_race',
      instructions: [
        'Drag chromosomes to correct positions',
        'Follow mitosis phase requirements',
        'Complete each phase within time limit',
        'Understand chromosome behavior'
      ],
      learningObjectives: [
        'Understand mitosis phases',
        'Learn chromosome movement',
        'Recognize cell division timing'
      ]
    },
    {
      id: 'dna-decoder',
      title: 'DNA Sequence Decoder',
      description: 'Match complementary DNA base pairs correctly.',
      subject: 'biology',
      difficulty: 2,
      estimatedDuration: 6,
      maxScore: 800,
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'dna_sequence_decoder',
      instructions: [
        'Select correct complementary bases',
        'Follow base pairing rules (A-T, G-C)',
        'Complete sequences accurately',
        'Build understanding of DNA structure'
      ],
      learningObjectives: [
        'Master base pairing rules',
        'Understand DNA structure',
        'Learn genetic code basics'
      ]
    },
    {
      id: 'ecosystem-balance',
      title: 'Ecosystem Balance Simulator',
      description: 'Maintain population equilibrium in food webs.',
      subject: 'biology',
      difficulty: 4,
      estimatedDuration: 15,
      maxScore: 2000,
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      gameType: 'ecosystem_balance',
      instructions: [
        'Adjust population levels',
        'Maintain trophic level balance',
        'Understand predator-prey relationships',
        'Keep ecosystem health above 70%'
      ],
      learningObjectives: [
        'Understand ecosystem dynamics',
        'Learn about food webs',
        'Analyze population interactions'
      ]
    },
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || game.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty.toString() === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleGameComplete = (session: GameSession) => {
    console.log('Game completed:', session);
    // TODO: Save to database
    setSelectedGame(null);
  };

  const handleGameExit = () => {
    setSelectedGame(null);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'chemistry': return 'bg-blue-100 text-blue-800';
      case 'physics': return 'bg-purple-100 text-purple-800';
      case 'biology': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedGame) {
    return (
      <GameEngine
        game={selectedGame}
        onComplete={handleGameComplete}
        onExit={handleGameExit}
      />
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Educational Games</h1>
            <p className="text-gray-600">
              Learn science concepts through interactive games and challenges
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Trophy className="w-3 h-3 mr-1" />
              {user ? `${user.xp || 0} XP` : '0 XP'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="biology">Biology</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">Easy</SelectItem>
            <SelectItem value="2">Easy</SelectItem>
            <SelectItem value="3">Medium</SelectItem>
            <SelectItem value="4">Hard</SelectItem>
            <SelectItem value="5">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
          <TabsTrigger value="physics">Physics</TabsTrigger>
          <TabsTrigger value="biology">Biology</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Games</h3>
              <p className="text-gray-500">
                {filteredGames.length} games available
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video relative">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-black/70 text-white">
                          +{Math.floor(game.maxScore / 10)} XP
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSubjectColor(game.subject)}>
                          {game.subject}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(game.difficulty)}>
                          {getDifficultyLabel(game.difficulty)}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1 text-lg">{game.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {game.estimatedDuration} min
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          4.8
                        </div>
                        <div className="flex items-center">
                          <Gamepad2 className="h-3 w-3 mr-1" />
                          {Math.floor(Math.random() * 1000 + 100)}
                        </div>
                      </div>
                      <Button 
                        className="w-full group bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedGame(game)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Game
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {['chemistry', 'physics', 'biology'].map(subject => (
          <TabsContent key={subject} value={subject}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games
                .filter(game => game.subject === subject)
                .map((game) => (
                  <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video relative">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{game.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedGame(game)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Game
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}