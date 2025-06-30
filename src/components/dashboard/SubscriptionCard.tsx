import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
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
  Progress 
} from '@/components/ui/progress';
import { 
  Beaker, 
  Zap, 
  ArrowRight, 
  Gamepad2, 
  Globe 
} from 'lucide-react';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { PaywallManager } from '@/components/subscription/PaywallManager';
import { useNavigate } from 'react-router-dom';

interface SubscriptionCardProps {
  className?: string;
}

export function SubscriptionCard({
  className = ''
}: SubscriptionCardProps) {
  const { tier, remainingExperiments, isUnlimited } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    setShowPaywall(true);
  };
  
  const handleManage = () => {
    navigate('/subscription');
  };
  
  if (tier !== 'free') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            {tier === 'student' ? 'Premium Subscription' : 'School Pro Subscription'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={tier === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                {tier === 'student' ? 'Student Premium' : 'School Pro'}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Beaker className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="text-xs">Unlimited Experiments</div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Gamepad2 className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <div className="text-xs">All Games</div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Globe className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                <div className="text-xs">Multi-Language</div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleManage}
            >
              Manage Subscription
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Beaker className="h-5 w-5 mr-2 text-blue-500" />
            Experiment Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge>Free Tier</Badge>
              <span className="text-sm font-medium">
                {remainingExperiments} / 3 remaining
              </span>
            </div>
            
            <Progress value={(remainingExperiments / 3) * 100} className="h-2" />
            
            <div className="text-sm text-gray-600">
              <p>Upgrade to unlock unlimited experiments and premium features.</p>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={handleUpgrade}
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="unlimited experiments"
      />
    </>
  );
}