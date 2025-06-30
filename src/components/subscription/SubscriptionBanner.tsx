import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Zap, 
  X, 
  Beaker, 
  Gamepad2, 
  Globe 
} from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';
import { PaywallManager } from './PaywallManager';

interface SubscriptionBannerProps {
  variant?: 'compact' | 'full';
  className?: string;
  onDismiss?: () => void;
}

export function SubscriptionBanner({
  variant = 'compact',
  className = '',
  onDismiss
}: SubscriptionBannerProps) {
  const { tier, remainingExperiments } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Don't show for paid tiers
  if (tier !== 'free') {
    return null;
  }
  
  const handleUpgrade = () => {
    setShowPaywall(true);
  };
  
  if (variant === 'compact') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 ${className}`}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {remainingExperiments > 0 
                  ? `${remainingExperiments} experiments remaining this month` 
                  : 'You\'ve reached your monthly experiment limit'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-7 text-xs bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleUpgrade}
              >
                Upgrade
              </Button>
              
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0 text-white hover:bg-white/20"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
        
        <PaywallManager
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </>
    );
  }
  
  return (
    <>
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center mb-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  Free Tier
                </Badge>
                {remainingExperiments === 0 && (
                  <Badge variant="destructive" className="ml-2">
                    Limit Reached
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-1">
                Upgrade to LabXplorer Premium
              </h3>
              
              <p className="text-gray-600 text-sm mb-3">
                Unlock unlimited experiments, all games, and advanced features
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full">
                  <Beaker className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Unlimited experiments</span>
                </div>
                <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full">
                  <Gamepad2 className="h-3 w-3 mr-1 text-green-500" />
                  <span>All games</span>
                </div>
                <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full">
                  <Globe className="h-3 w-3 mr-1 text-purple-500" />
                  <span>Multi-language</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}