import { motion } from 'framer-motion';
import { User, Mail, Calendar, Trophy, Star, BookOpen, FlaskConical, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/useAuthStore';

export function Profile() {
  const { user } = useAuthStore();

  const achievements = [
    { id: '1', name: 'First Experiment', description: 'Complete your first experiment', icon: '🧪', unlocked: true },
    { id: '2', name: 'Chemistry Master', description: 'Complete 10 chemistry experiments', icon: '⚗️', unlocked: true },
    { id: '3', name: 'Team Player', description: 'Collaborate on 5 experiments', icon: '👥', unlocked: true },
    { id: '4', name: 'Note Taker', description: 'Create 20 notebook entries', icon: '📝', unlocked: false },
    { id: '5', name: 'Game Champion', description: 'Win 10 educational games', icon: '🏆', unlocked: false },
    { id: '6', name: 'Perfect Score', description: 'Score 100% on an assessment', icon: '💯', unlocked: true },
  ];

  const recentActivity = [
    { date: '2024-01-15', activity: 'Completed Chemical Reactions Lab', type: 'experiment' },
    { date: '2024-01-14', activity: 'Added notes to Physics Lab', type: 'notebook' },
    { date: '2024-01-13', activity: 'Played Element Hunter game', type: 'game' },
    { date: '2024-01-12', activity: 'Shared Biology Cell Structure notes', type: 'collaboration' },
    { date: '2024-01-11', activity: 'Completed Weather Patterns assessment', type: 'assessment' },
  ];

  const stats = [
    { label: 'Experiments Completed', value: '18', icon: FlaskConical, color: 'text-blue-600' },
    { label: 'Notebook Entries', value: '24', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Games Played', value: '12', icon: Trophy, color: 'text-green-600' },
    { label: 'Achievements', value: '4', icon: Star, color: 'text-yellow-600' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'experiment': return '🧪';
      case 'notebook': return '📝';
      case 'game': return '🎮';
      case 'collaboration': return '👥';
      case 'assessment': return '📊';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar_url} alt={user?.username} />
              <AvatarFallback className="text-2xl">
                {user?.username?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user?.username}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user?.created_at || '').toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="secondary" className="text-sm">
                  Level {user?.level || 1}
                </Badge>
                <Badge variant="outline" className="text-sm capitalize">
                  {user?.role || 'student'}
                </Badge>
              </div>
            </div>
          </div>
          <Button size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Experience Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Experience Progress</CardTitle>
            <CardDescription>Your journey to the next level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Level {user?.level || 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user?.experience_points || 0} / {((user?.level || 1) + 1) * 1000} XP
                </span>
              </div>
              <Progress 
                value={((user?.experience_points || 0) % 1000) / 10} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                {((user?.level || 1) + 1) * 1000 - (user?.experience_points || 0)} XP until next level
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4">Your Achievements</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className={`${achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : 'opacity-60'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={achievement.unlocked ? "default" : "secondary"}
                        className={achievement.unlocked ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : ""}
                      >
                        {achievement.unlocked ? "Unlocked" : "Locked"}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.activity}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Edit Profile</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your privacy and data sharing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Manage Privacy</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Notification Settings</Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}