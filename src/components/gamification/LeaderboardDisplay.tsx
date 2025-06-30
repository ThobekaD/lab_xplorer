import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Clock, 
  Zap, 
  Users 
} from 'lucide-react';
import { LEADERBOARD_CATEGORIES, LeaderboardEntry } from '@/types/gamification';

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

export function LeaderboardDisplay({
  entries,
  currentUserId,
  className = ''
}: LeaderboardDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(LEADERBOARD_CATEGORIES[0].id);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('weekly');
  
  const filteredEntries = entries.filter(entry => 
    entry.category === selectedCategory && entry.timeframe === selectedTimeframe
  );
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };
  
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'semester': return 'This Semester';
      case 'annual': return 'This Year';
      default: return timeframe;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Leaderboard
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {LEADERBOARD_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="annual">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Top 3 Podium */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {filteredEntries.slice(0, 3).map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.userId === currentUserId;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={`
                    relative flex-1 flex flex-col items-center
                    ${rank === 1 ? 'order-2 sm:order-2 z-10' : rank === 2 ? 'order-1 sm:order-1' : 'order-3 sm:order-3'}
                  `}
                >
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${getRankBadge(rank)}
                    ${rank === 1 ? 'sm:w-20 sm:h-20' : ''}
                    ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  `}>
                    {getRankIcon(rank)}
                  </div>
                  
                  <div className={`
                    mt-2 text-center
                    ${rank === 1 ? 'sm:-mt-2' : ''}
                  `}>
                    <Avatar className={`
                      mx-auto mb-2 border-2 border-white
                      ${rank === 1 ? 'h-16 w-16' : 'h-12 w-12'}
                    `}>
                      <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                      <AvatarFallback>
                        {entry.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <p className={`
                      font-semibold truncate max-w-[120px] mx-auto
                      ${rank === 1 ? 'text-base' : 'text-sm'}
                    `}>
                      {entry.displayName}
                    </p>
                    
                    <p className="text-sm font-bold text-blue-600">
                      {entry.score.toLocaleString()} pts
                    </p>
                    
                    {isCurrentUser && (
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        You
                      </Badge>
                    )}
                  </div>
                  
                  <div className={`
                    absolute bottom-0 left-1/2 transform -translate-x-1/2
                    h-4 sm:h-8 w-full max-w-[80px] rounded-t-lg
                    ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-orange-500'}
                  `} />
                </motion.div>
              );
            })}
          </div>
          
          {/* Leaderboard List */}
          <div className="space-y-2">
            {filteredEntries.slice(3).map((entry, index) => {
              const rank = index + 4; // Start from rank 4
              const isCurrentUser = entry.userId === currentUserId;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Card className={`
                    hover:shadow-md transition-shadow
                    ${isCurrentUser ? 'border-blue-200 bg-blue-50' : ''}
                  `}>
                    <CardContent className="p-3 flex items-center">
                      <div className="flex items-center flex-1">
                        <div className="w-8 h-8 flex items-center justify-center mr-3 text-gray-500">
                          {rank}
                        </div>
                        
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                          <AvatarFallback>
                            {entry.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium text-sm">
                            {entry.displayName}
                            {isCurrentUser && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="font-bold text-blue-600">
                        {entry.score.toLocaleString()} pts
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No entries for this category yet</p>
              </div>
            )}
          </div>
          
          {/* Leaderboard Info */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>Leaderboard updates every 24 hours. Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}