import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Lock, 
  Zap 
} from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';
import { PaywallManager } from './PaywallManager';

interface FeatureGatingProps {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
  experimentId?: string;
  showUpgradeButton?: boolean;
  className?: string;
}

export function FeatureGating({
  feature,
  fallback,
  children,
  experimentId,
  showUpgradeButton = true,
  className = ''
}: FeatureGatingProps) {
  const { canAccessFeature } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const hasAccess = canAccessFeature(feature);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return (
      <div className={className}>
        {fallback}
        
        {showUpgradeButton && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => setShowPaywall(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Unlock
            </Button>
          </div>
        )}
        
        <PaywallManager
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          feature={feature}
          experimentId={experimentId}
        />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-4">
              Upgrade your subscription to access {feature}
            </p>
            
            {showUpgradeButton && (
              <Button 
                onClick={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Unlock
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
        experimentId={experimentId}
      />
    </div>
  );
}

interface GatedButtonProps {
  feature: string;
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function GatedButton({
  feature,
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}: GatedButtonProps) {
  const { canAccessFeature } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const hasAccess = canAccessFeature(feature);
  
  const handleClick = () => {
    if (hasAccess) {
      onClick();
    } else {
      setShowPaywall(true);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={className}
            disabled={disabled}
          >
            {!hasAccess && <Lock className="h-3 w-3 mr-1" />}
            {children}
          </Button>
        </TooltipTrigger>
        {!hasAccess && (
          <TooltipContent>
            <p>Upgrade to access this feature</p>
          </TooltipContent>
        )}
      </Tooltip>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
      />
    </TooltipProvider>
  );
}