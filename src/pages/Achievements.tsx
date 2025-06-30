//src/pages/Achievements.tsx
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Award, Search, Filter, Star, Trophy, AlignCenterVertical as Certificate, Zap } from 'lucide-react';
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { CertificateDisplay } from '@/components/gamification/CertificateDisplay';
import { LeaderboardDisplay } from '@/components/gamification/LeaderboardDisplay';
import { useGamification } from '@/components/gamification/GamificationProvider';
import { useAuthStore } from '@/stores/useAuthStore';
import { 
  EXPERIMENT_BADGES, 
  PERFORMANCE_BADGES, 
  SPECIAL_BADGES, 
  Badge,
  LEADERBOARD_CATEGORIES
} from '@/types/gamification';

export function Achievements() {
  const { user } = useAuthStore();
  const { badges, unlockedBadgeIds, level, currentXP } = useGamification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // Combine all badge definitions
  const allBadgeDefinitions: Badge[] = [
    ...Object.entries(EXPERIMENT_BADGES).map(([id, badge]) => ({
      id,
      ...badge
    })),
    ...Object.entries(PERFORMANCE_BADGES).map(([id, badge]) => ({
      id,
      ...badge
    })),
    ...Object.entries(SPECIAL_BADGES).map(([id, badge]) => ({
      id,
      ...badge
    }))
  ];
  
  // Filter badges based on search and rarity
  const filteredBadges = allBadgeDefinitions.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || badge.rarity === rarityFilter;
    
    return matchesSearch && matchesRarity;
  });
  
  // Group badges by category
  const experimentBadges = filteredBadges.filter(badge => 
    Object.keys(EXPERIMENT_BADGES).includes(badge.id)
  );
  
  const performanceBadges = filteredBadges.filter(badge => 
    Object.keys(PERFORMANCE_BADGES).includes(badge.id)
  );
  
  const specialBadges = filteredBadges.filter(badge => 
    Object.keys(SPECIAL_BADGES).includes(badge.id)
  );
  
  // Mock certificates data
  const certificates = [
    {
      id: '1',
      userId: user?.id || '',
      experimentId: 'exp1',
      certificateType: 'completion' as const,
      issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      performanceData: {
        score: 92,
        timeCompleted: 45 * 60, // 45 minutes
        safetyCompliance: true,
      },
      metadata: {
        institutionName: 'LabXplorer Academy',
        verificationCode: 'ABC123XYZ',
      }
    },
    {
      id: '2',
      userId: user?.id || '',
      experimentId: 'exp2',
      certificateType: 'mastery' as const,
      issueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      performanceData: {
        score: 98,
        timeCompleted: 60 * 60, // 60 minutes
        safetyCompliance: true,
        collaborationRating: 4.8,
      },
      metadata: {
        institutionName: 'LabXplorer Academy',
        verificationCode: 'DEF456UVW',
      }
    }
  ];
  
  // Mock leaderboard data
  const leaderboardEntries = LEADERBOARD_CATEGORIES.flatMap(category => 
    Array.from({ length: 10 }).map((_, i) => ({
      id: `${category.id}-${i}`,
      userId: i === 0 ? (user?.id || 'user-0') : `user-${i}`,
      displayName: i === 0 ? (user?.display_name || 'Current User') : `User ${i + 1}`,
      avatarUrl: i % 3 === 0 ? `https://i.pravatar.cc/150?u=${i}` : undefined,
      score: Math.floor(Math.random() * 5000) + 1000,
      rank: i + 1,
      category: category.id,
      timeframe: category.timeframe,
      subject: category.subject
    }))
  );
  
  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
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
            <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and earn rewards
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <XPProgressBar currentXP={currentXP} />
      </motion.div>
      
      {/* Achievement Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{badges.length}</div>
            <div className="text-sm text-gray-500">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{level}</div>
            <div className="text-sm text-gray-500">Current Level</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{currentXP.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total XP</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{certificates.length}</div>
            <div className="text-sm text-gray-500">Certificates</div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="uncommon">Uncommon</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
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
      </motion.div>
      
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Certificate className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Experiment Badges
                </CardTitle>
                <CardDescription>
                  Badges earned by completing specific experiments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeDisplay 
                  badges={experimentBadges}
                  unlockedBadgeIds={unlockedBadgeIds}
                  onBadgeClick={handleBadgeClick}
                />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-500" />
                  Performance Badges
                </CardTitle>
                <CardDescription>
                  Badges earned through exceptional performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeDisplay 
                  badges={performanceBadges}
                  unlockedBadgeIds={unlockedBadgeIds}
                  onBadgeClick={handleBadgeClick}
                />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-purple-500" />
                  Special Recognition
                </CardTitle>
                <CardDescription>
                  Rare badges for outstanding achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeDisplay 
                  badges={specialBadges}
                  unlockedBadgeIds={unlockedBadgeIds}
                  onBadgeClick={handleBadgeClick}
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((certificate) => (
                <CertificateDisplay
                  key={certificate.id}
                  certificate={certificate}
                  experimentTitle={`Experiment ${certificate.experimentId}`}
                  userName={user?.display_name || 'Student'}
                  onDownload={() => {}}
                  onShare={() => {}}
                />
              ))}
              
              {certificates.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Certificate className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No certificates earned yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <LeaderboardDisplay
              entries={leaderboardEntries}
              currentUserId={user?.id}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Badge Details</DialogTitle>
            <DialogDescription>
              Learn more about this achievement
            </DialogDescription>
          </DialogHeader>
          
          {selectedBadge && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${unlockedBadgeIds.includes(selectedBadge.id) ? 'bg-white' : 'bg-gray-200'}
                  border-2 border-current
                  ${unlockedBadgeIds.includes(selectedBadge.id) 
                    ? 'text-yellow-500' 
                    : 'text-gray-400'}
                `}>
                  {selectedBadge.iconUrl ? (
                    <img 
                      src={selectedBadge.iconUrl} 
                      alt={selectedBadge.name} 
                      className="w-10 h-10"
                    />
                  ) : (
                    <Award className="h-10 w-10" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedBadge.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm capitalize text-gray-500">
                      {selectedBadge.rarity}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      +{selectedBadge.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">{selectedBadge.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Requirements:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedBadge.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{req.type.replace(/_/g, ' ')}: {req.value.toString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {unlockedBadgeIds.includes(selectedBadge.id) && selectedBadge.unlockedAt && (
                <div className="text-sm text-gray-500">
                  Earned on: {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}