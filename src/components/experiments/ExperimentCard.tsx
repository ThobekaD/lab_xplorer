import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  Users, 
  ChevronRight, 
  Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { PaywallManager } from '@/components/subscription/PaywallManager';

interface ExperimentCardProps {
  experiment: {
    id: string;
    slug: string;
    title: string;
    description: string;
    subject: string;
    difficulty: number;
    thumbnail_url?: string;
    is_free: boolean;
    estimated_duration?: number;
  };
  stats?: {
    completions: number;
    averageRating: number;
  };
  index?: number;
  className?: string;
}

export function ExperimentCard({
  experiment,
  stats,
  index = 0,
  className = ''
}: ExperimentCardProps) {
  const navigate = useNavigate();
  const { canPerformExperiment } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const handleClick = () => {
    if (experiment.is_free || canPerformExperiment()) {
      navigate(`/experiment/${experiment.slug}`);
    } else {
      setShowPaywall(true);
    }
  };
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner';
    if (difficulty <= 3) return 'Intermediate';
    return 'Advanced';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chemistry': return 'bg-blue-100 text-blue-800';
      case 'physics': return 'bg-purple-100 text-purple-800';
      case 'biology': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 * index }}
        className={className}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={handleClick}>
          <div className="aspect-video relative">
            <img
              src={experiment.thumbnail_url || `https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400`}
              alt={experiment.title}
              className="w-full h-full object-cover"
            />
            {!experiment.is_free && !canPerformExperiment() && (
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-black/70 text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getCategoryColor(experiment.subject)}>
                {experiment.subject}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(experiment.difficulty)}>
                {getDifficultyLabel(experiment.difficulty)}
              </Badge>
            </div>
            <CardTitle className="line-clamp-1 text-lg">{experiment.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {experiment.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {experiment.estimated_duration || 30} min
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {stats?.averageRating || 4.5}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {stats?.completions || Math.floor(Math.random() * 1000 + 100)}
              </div>
            </div>
            <Button className="w-full group">
              {!experiment.is_free && !canPerformExperiment() ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              ) : (
                <>
                  Start
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="premium experiments"
        experimentId={experiment.id}
      />
    </>
  );
}