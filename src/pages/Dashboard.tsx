import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Gamepad2, BookOpen, Trophy, TrendingUp, Star, Award, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';

export function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { tier } = useSubscription();
  const navigate = useNavigate();

  const userLevel = user ? Math.floor(user.xp / 1000) + 1 : 1;
  const xpProgress = user ? (user.xp % 1000) / 10 : 0;
  const xpToNextLevel = user ? 1000 - (user.xp % 1000) : 1000;

  const quickStats = [
    {
      title: 'Experiments Completed',
      value: '12',
      icon: FlaskConical,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+3 this week',
    },
    {
      title: 'Games Played',
      value: '8',
      icon: Gamepad2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+2 this week',
    },
    {
      title: 'Notebook Entries',
      value: '24',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5 this week',
    },
    {
      title: 'Leaderboard Rank',
      value: '#15',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '+2 positions',
    },
  ];

  const recentAchievements = [
    { name: 'First Experiment', icon: '🧪', date: '2 days ago', xp: 100 },
    { name: 'Chemistry Master', icon: '⚗️', date: '1 week ago', xp: 250 },
    { name: 'Team Player', icon: '👥', date: '2 weeks ago', xp: 150 },
  ];

  const recommendedExperiments = [
    {
      title: 'Chemical Reactions Lab',
      difficulty: 'Intermediate',
      duration: '45 min',
      rating: 4.8,
      subject: 'Chemistry',
      thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=300',
      isPremium: false,
    },
    {
      title: 'Physics Motion Simulator',
      difficulty: 'Advanced',
      duration: '60 min',
      rating: 4.9,
      subject: 'Physics',
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=300',
      isPremium: true,
    },
    {
      title: 'Biology Cell Structure',
      difficulty: 'Beginner',
      duration: '30 min',
      rating: 4.7,
      subject: 'Biology',
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=300',
      isPremium: false,
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section for Non-Authenticated Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 sm:py-20"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to LabXplorer
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover the world of science through interactive virtual laboratories, 
              educational games, and collaborative learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate('/experiments')}
              >
                <FlaskConical className="mr-2 h-5 w-5" />
                Explore Experiments
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/games')}
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Play Games
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 sm:gap-8 md:grid-cols-3"
        >
          {[
            {
              icon: FlaskConical,
              title: 'Virtual Experiments',
              description: 'Conduct safe, interactive experiments in our virtual laboratory environment.',
            },
            {
              icon: Gamepad2,
              title: 'Educational Games',
              description: 'Learn through fun, engaging games that make science concepts memorable.',
            },
            {
              icon: BookOpen,
              title: 'Digital Notebook',
              description: 'Document your discoveries and collaborate with peers in real-time.',
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Subscription Banner for Free Tier */}
      {tier === 'free' && (
        <SubscriptionBanner variant="full" />
      )}
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Welcome back, {user?.display_name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to explore the world of science today?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Badge variant="secondary" className="text-sm w-fit">
              <Award className="w-3 h-3 mr-1" />
              Level {userLevel}
            </Badge>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium">{user?.xp || 0} XP</p>
              <Progress value={xpProgress} className="w-24 h-2" />
              <p className="text-xs text-gray-500">{xpToNextLevel} XP to next level</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {quickStats.map((stat, index) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SubscriptionCard />
        </motion.div>
        
        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    +{achievement.xp} XP
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/achievements')}>
                View All Achievements
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Experiments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-blue-500" />
                Recommended for You
              </CardTitle>
              <CardDescription>Experiments tailored to your interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedExperiments.map((experiment, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/experiments')}>
                  <img 
                    src={experiment.thumbnail} 
                    alt={experiment.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium line-clamp-1">{experiment.title}</p>
                      {experiment.isPremium && tier === 'free' && (
                        <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                          <Zap className="w-2 h-2 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{experiment.subject}</span>
                      <span>•</span>
                      <span>{experiment.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => navigate('/experiments')}>
                Browse All Experiments
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into your favorite activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => navigate('/experiments')}
              >
                <FlaskConical className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                <span className="text-xs sm:text-sm">New Experiment</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex-col space-y-2 hover:bg-green-50 hover:border-green-200"
                onClick={() => navigate('/games')}
              >
                <Gamepad2 className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                <span className="text-xs sm:text-sm">Play Games</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200"
                onClick={() => navigate('/notebook')}
              >
                <BookOpen className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                <span className="text-xs sm:text-sm">Open Notebook</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 sm:h-24 flex-col space-y-2 hover:bg-yellow-50 hover:border-yellow-200"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
                <span className="text-xs sm:text-sm">Leaderboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}