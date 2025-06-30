//src/pages/Experiments.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Star, Users, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useExperiments } from '@/hooks/useExperiments';
import { useExperimentStats } from '@/hooks/useExperimentStats';
import { ExperimentCard } from '@/components/experiments/ExperimentCard';

// Define utility functions at the top of the component before they're used
const getDifficultyLevel = (difficulty: number): string => {
  if (difficulty <= 2) return 'beginner';
  if (difficulty <= 3) return 'intermediate';
  return 'advanced';
};

const getDefaultThumbnail = (subject: string): string => {
  const thumbnails = {
    chemistry: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
    physics: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    biology: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  return thumbnails[subject as keyof typeof thumbnails] || thumbnails.chemistry;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getCategoryColor = (subject: string) => {
  switch (subject) {
    case 'chemistry': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'physics': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'biology': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function Experiments() {
  const navigate = useNavigate();
  const experimentsQueryResult = useExperiments();
  const experiments = experimentsQueryResult.data || [];
  const isLoading = experimentsQueryResult.isLoading;
  const error = experimentsQueryResult.error;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Debug logging
  console.log('Experiments component:', {
    experiments,
    isLoading,
    error,
    experimentsType: typeof experiments,
    isArray: Array.isArray(experiments)
  });

  // Transform database experiments to UI format
  const transformedExperiments = Array.isArray(experiments) ? experiments.map(exp => ({
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    description: exp.description || 'No description available',
    subject: exp.subject,
    difficulty: getDifficultyLevel(exp.difficulty),
    duration: exp.estimated_duration || 30,
    rating: 4.5, // Default rating - you can calculate this from stats later
    completions: 0, // Default completions - you can calculate this from stats later
    thumbnail: exp.thumbnail_url || getDefaultThumbnail(exp.subject),
    featured: exp.is_free, // Free experiments as featured
    learningObjectives: exp.learning_objectives || [],
    prerequisites: exp.prerequisites || []
  })) : [];

  const filteredExperiments = transformedExperiments.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.subject === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exp.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const featuredExperiments = transformedExperiments.filter(exp => exp.featured);

  const handleStartExperiment = (slug: string) => {
    navigate(`/experiment/${slug}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-muted-foreground">Loading experiments...</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-red-600">Error loading experiments: {error.message}</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Failed to load experiments. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // No experiments state
  if (!experiments || experiments.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-muted-foreground">No experiments available</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-600">No experiments found in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
            <p className="text-muted-foreground">
              Discover and conduct virtual laboratory experiments ({transformedExperiments.length} available)
            </p>
          </div>
          <Button size="lg">
            Create New Experiment
          </Button>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
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
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Experiments</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Featured Experiments */}
          {featuredExperiments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Featured Experiments</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredExperiments.slice(0, 2).map((experiment) => (
                  <Card key={experiment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <img
                        src={experiment.thumbnail}
                        alt={experiment.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-600">
                        Featured
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="line-clamp-1">{experiment.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {experiment.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getCategoryColor(experiment.subject)}>
                          {experiment.subject}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(experiment.difficulty)}>
                          {experiment.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {experiment.duration} min
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {experiment.rating}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {experiment.completions.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full group"
                        onClick={() => handleStartExperiment(experiment.slug)}
                      >
                        View Experiment
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Experiments Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Experiments</h3>
              <p className="text-muted-foreground">
                {filteredExperiments.length} experiments found
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperiments.map((experiment, index) => (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video relative">
                      <img
                        src={experiment.thumbnail}
                        alt={experiment.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-1 text-lg">{experiment.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {experiment.description}
                      </CardDescription>
                      <div className="flex items-center space-x-2 pt-2">
                        <Badge className={getCategoryColor(experiment.subject)}>
                          {experiment.subject}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(experiment.difficulty)}>
                          {experiment.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {experiment.duration} min
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {experiment.rating}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {experiment.completions > 1000 
                            ? `${(experiment.completions / 1000).toFixed(1)}k`
                            : experiment.completions
                          }
                        </div>
                      </div>
                      <Button 
                        className="w-full group" 
                        size="sm"
                        onClick={() => handleStartExperiment(experiment.slug)}
                      >
                        View
                        <ChevronRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredExperiments.map((experiment) => (
              <Card key={experiment.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={experiment.thumbnail}
                    alt={experiment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{experiment.title}</CardTitle>
                  <CardDescription>{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleStartExperiment(experiment.slug)}
                  >
                    View Experiment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transformedExperiments.slice(0, 6).map((experiment) => (
              <Card key={experiment.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={experiment.thumbnail}
                    alt={experiment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{experiment.title}</CardTitle>
                  <CardDescription>{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleStartExperiment(experiment.slug)}
                  >
                    View Experiment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Most popular experiments will appear here once we have usage data.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}