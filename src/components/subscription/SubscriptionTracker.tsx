import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Beaker, 
  Zap, 
  Calendar, 
  Infinity, 
  ArrowUpRight 
} from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';

interface SubscriptionTrackerProps {
  onUpgrade: () => void;
  className?: string;
}

export function SubscriptionTracker({
  onUpgrade,
  className = ''
}: SubscriptionTrackerProps) {
  const { 
    isSubscriptionLoading, 
    subscription, 
    tier, 
    remainingExperiments, 
    isUnlimited 
  } = useSubscription();
  
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free': return 'Free';
      case 'student': return 'Student Premium';
      case 'school': return 'School Pro';
      default: return tier;
    }
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'school': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isSubscriptionLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Status</CardTitle>
          <Badge className={getTierColor(tier)}>
            {getTierLabel(tier)}
          </Badge>
        </div>
        <CardDescription>
          {tier === 'free' 
            ? 'Free tier with limited access' 
            : `Active subscription with ${tier === 'student' ? 'premium' : 'pro'} features`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Experiment Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Beaker className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Experiment Usage</span>
            </div>
            <span className="text-sm">
              {isUnlimited 
                ? <Infinity className="h-4 w-4 text-blue-500" /> 
                : `${remainingExperiments} remaining`}
            </span>
          </div>
          
          {!isUnlimited && (
            <Progress 
              value={(remainingExperiments / 3) * 100} 
              className="h-2" 
            />
          )}
        </div>
        
        {/* Subscription Details */}
        {subscription?.renewalDate && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Next Renewal</span>
            </div>
            <span>{formatDate(subscription.renewalDate)}</span>
          </div>
        )}
        
        {subscription?.trialEndDate && subscription.isTrial && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center text-sm text-yellow-800">
              <Zap className="h-4 w-4 mr-2" />
              <span>Trial ends on {formatDate(subscription.trialEndDate)}</span>
            </div>
          </div>
        )}
        
        {/* Upgrade Button (for free tier) */}
        {tier === 'free' && (
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        )}
        
        {/* Manage Subscription (for paid tiers) */}
        {(tier === 'student' || tier === 'school') && subscription?.customerInfo?.managementURL && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(subscription.customerInfo?.managementURL, '_blank')}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}