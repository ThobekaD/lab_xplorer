import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Users, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Leaderboard() {
  const leaderboardData = [
    {
      rank: 1,
      username: 'ScienceWhiz',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      experience_points: 12450,
      level: 15,
      experiments_completed: 45,
      assessments_passed: 38,
      achievements: 28,
    },
    {
      rank: 2,
      username: 'ChemMaster',
      avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      experience_points: 11200,
      level: 14,
      experiments_completed: 42,
      assessments_passed: 35,
      achievements: 25,
    },
    {
      rank: 3,
      username: 'LabExplorer',
      avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      experience_points: 10800,
      level: 13,
      experiments_completed: 39,
      assessments_passed: 32,
      achievements: 22,
    },
    {
      rank: 4,
      username: 'BiologyBuff',
      avatar_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      experience_points: 9950,
      level: 12,
      experiments_completed: 36,
      assessments_passed: 29,
      achievements: 20,
    },
    {
      rank: 5,
      username: 'PhysicsPhenom',
      avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      experience_points: 9450,
      level: 12,
      experiments_completed: 34,
      assessments_passed: 27,
      achievements: 19,
    },
  ];

  const topPerformers = [
    { title: 'Most Experiments', username: 'ScienceWhiz', value: '45 experiments', icon: '🧪' },
    { title: 'Highest Level', username: 'ScienceWhiz', value: 'Level 15', icon: '⭐' },
    { title: 'Most Achievements', username: 'ScienceWhiz', value: '28 badges', icon: '🏆' },
    { title: 'Best Collaborator', username: 'ChemMaster', value: '15 collaborations', icon: '👥' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">
              See how you stack up against other scientists
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-3 h-3 mr-1" />
              1,247 Active Scientists
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Current User Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Your Ranking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                  #15
                </div>
                <div>
                  <p className="font-semibold">Current User</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Level 8</span>
                    <span>3,450 XP</span>
                    <span>18 experiments</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next Rank</p>
                <p className="font-semibold">250 XP to go</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {topPerformers.map((performer, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{performer.icon}</span>
                      <CardTitle className="text-sm">{performer.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{performer.username}</p>
                    <p className="text-sm text-muted-foreground">{performer.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Main Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4">Overall Rankings</h3>
            <div className="space-y-4">
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-300 ${user.rank <= 3 ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full">
                            <Badge className={`${getRankBadge(user.rank)} w-12 h-12 rounded-full flex items-center justify-center`}>
                              {getRankIcon(user.rank)}
                            </Badge>
                          </div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url} alt={user.username} />
                            <AvatarFallback>
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-lg">{user.username}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Level {user.level}</span>
                              <span>{user.experience_points.toLocaleString()} XP</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="text-center">
                              <p className="font-semibold">{user.experiments_completed}</p>
                              <p className="text-muted-foreground text-xs">Experiments</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{user.assessments_passed}</p>
                              <p className="text-muted-foreground text-xs">Assessments</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{user.achievements}</p>
                              <p className="text-muted-foreground text-xs">Achievements</p>
                            </div>
                          </div>
                          {user.rank <= 3 && (
                            <div className="flex justify-end">
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Top Performer
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Weekly rankings will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Monthly rankings will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Achievement leaderboard will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}