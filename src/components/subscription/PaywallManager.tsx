import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Loader2, 
  Check, 
  X, 
  Zap, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Star, 
  Users, 
  School, 
  Beaker, 
  Gamepad2, 
  Globe, 
  Wifi, 
  BarChart, 
  Headphones 
} from 'lucide-react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { SUBSCRIPTION_PLANS } from '@/lib/revenuecat';
import { useSubscription } from './SubscriptionProvider';
import { toast } from 'sonner';

interface PaywallManagerProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  experimentId?: string;
  variant?: 'standard' | 'benefits' | 'testimonials';
}

export function PaywallManager({
  isOpen,
  onClose,
  feature,
  experimentId,
  variant
}: PaywallManagerProps) {
  const { 
    isLoading, 
    subscriptionStatus, 
    purchaseSubscription, 
    restorePurchases,
    paywallVariant
  } = useSubscriptionStore();
  
  const [selectedPlan, setSelectedPlan] = useState<'student' | 'school'>('student');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Use provided variant or fallback to A/B test variant
  const displayVariant = variant || paywallVariant;
  
  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      
      const planId = SUBSCRIPTION_PLANS[selectedPlan].revenueCatId;
      const result = await purchaseSubscription(planId);
      
      if (result.success) {
        onClose();
      }
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      
      const result = await restorePurchases();
      
      if (result.success) {
        onClose();
      }
    } finally {
      setIsRestoring(false);
    }
  };
  
  const getFeatureIcon = (featureName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Unlimited experiment access': <Beaker className="h-4 w-4" />,
      'All educational games': <Gamepad2 className="h-4 w-4" />,
      'Multi-language support': <Globe className="h-4 w-4" />,
      'Offline sync': <Wifi className="h-4 w-4" />,
      'Analytics dashboard': <BarChart className="h-4 w-4" />,
      'Priority support': <Headphones className="h-4 w-4" />,
      'Classroom management': <School className="h-4 w-4" />,
      'Bulk user management': <Users className="h-4 w-4" />,
    };
    
    return iconMap[featureName] || <Check className="h-4 w-4" />;
  };
  
  const renderStandardVariant = () => (
    <div className="space-y-6">
      <Tabs defaultValue="student" onValueChange={(value) => setSelectedPlan(value as 'student' | 'school')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">
            <Star className="h-4 w-4 mr-2" />
            Student
          </TabsTrigger>
          <TabsTrigger value="school">
            <School className="h-4 w-4 mr-2" />
            School
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="space-y-4">
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Most Popular
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">$2.99</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
          
          <div className="space-y-2">
            {SUBSCRIPTION_PLANS.student.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="school" className="space-y-4">
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Best Value
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">$19.99</div>
            <div className="text-sm text-gray-500">per month per teacher</div>
          </div>
          
          <div className="space-y-2">
            {SUBSCRIPTION_PLANS.school.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  const renderBenefitsVariant = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`border-2 ${selectedPlan === 'student' ? 'border-blue-500' : 'border-transparent'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-500" />
                Student Premium
              </div>
              <Badge>Popular</Badge>
            </CardTitle>
            <CardDescription>For individual learners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">$2.99</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
            
            <div className="space-y-2">
              {SUBSCRIPTION_PLANS.student.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                    {getFeatureIcon(feature)}
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setSelectedPlan('student')}
              variant={selectedPlan === 'student' ? 'default' : 'outline'}
            >
              {selectedPlan === 'student' ? 'Selected' : 'Select'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className={`border-2 ${selectedPlan === 'school' ? 'border-blue-500' : 'border-transparent'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <School className="h-5 w-5 mr-2 text-purple-500" />
                School Pro
              </div>
              <Badge>Best Value</Badge>
            </CardTitle>
            <CardDescription>For educational institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">$19.99</div>
              <div className="text-sm text-gray-500">per month per teacher</div>
            </div>
            
            <div className="space-y-2">
              {SUBSCRIPTION_PLANS.school.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                    {getFeatureIcon(feature)}
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setSelectedPlan('school')}
              variant={selectedPlan === 'school' ? 'default' : 'outline'}
            >
              {selectedPlan === 'school' ? 'Selected' : 'Select'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  const renderTestimonialsVariant = () => (
    <div className="space-y-6">
      <Tabs defaultValue="student" onValueChange={(value) => setSelectedPlan(value as 'student' | 'school')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">
            <Star className="h-4 w-4 mr-2" />
            Student
          </TabsTrigger>
          <TabsTrigger value="school">
            <School className="h-4 w-4 mr-2" />
            School
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">$2.99</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
          
          <div className="space-y-2">
            {SUBSCRIPTION_PLANS.student.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">J</span>
                </div>
              </div>
              <div>
                <p className="text-sm italic text-gray-700">
                  "LabXplorer Premium has transformed how I study chemistry. The unlimited access to experiments helped me ace my AP exam!"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  - Jamie S., High School Student
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="school" className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">$19.99</div>
            <div className="text-sm text-gray-500">per month per teacher</div>
          </div>
          
          <div className="space-y-2">
            {SUBSCRIPTION_PLANS.school.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                  <Check className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">D</span>
                </div>
              </div>
              <div>
                <p className="text-sm italic text-gray-700">
                  "Our science department has seen a 40% increase in student engagement since adopting LabXplorer School Pro. The analytics and classroom management tools are game-changers."
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  - Dr. Michael T., Science Department Head
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  const renderVariant = () => {
    switch (displayVariant) {
      case 'benefits':
        return renderBenefitsVariant();
      case 'testimonials':
        return renderTestimonialsVariant();
      default:
        return renderStandardVariant();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Upgrade Your LabXplorer Experience
          </DialogTitle>
          <DialogDescription>
            {feature 
              ? `Unlock ${feature} and many more premium features`
              : 'Choose a plan to unlock premium features'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {renderVariant()}
            
            <DialogFooter className="flex-col space-y-2">
              <Button 
                onClick={handlePurchase} 
                disabled={isPurchasing || isRestoring}
                className="w-full"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRestore}
                disabled={isPurchasing || isRestoring}
                className="w-full"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore Purchases
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}