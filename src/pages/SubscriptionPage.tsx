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
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Zap, 
  CreditCard, 
  Settings, 
  BarChart, 
  Star, 
  School, 
  Check, 
  X 
} from 'lucide-react';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { SubscriptionTracker } from '@/components/subscription/SubscriptionTracker';
import { SubscriptionSettings } from '@/components/subscription/SubscriptionSettings';
import { RevenueAnalytics } from '@/components/subscription/RevenueAnalytics';
import { PaywallManager } from '@/components/subscription/PaywallManager';
import { SUBSCRIPTION_PLANS } from '@/lib/revenuecat';
import { useAuthStore } from '@/stores/useAuthStore';

export function SubscriptionPage() {
  const { user } = useAuthStore();
  const { tier, isSubscriptionLoading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  const handleUpgrade = () => {
    setShowPaywall(true);
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
            <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
            <p className="text-muted-foreground">
              Manage your LabXplorer subscription and billing
            </p>
          </div>
          
          {tier === 'free' && (
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <SubscriptionTracker onUpgrade={handleUpgrade} />
        </div>
        
        <div className="md:col-span-2">
          <SubscriptionSettings />
        </div>
      </div>
      
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription Plans
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="plans" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className={`${tier === 'free' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Basic access to LabXplorer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-sm text-gray-500">forever</div>
                </div>
                
                <div className="space-y-2">
                  {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={tier === 'free'}
                >
                  {tier === 'free' ? 'Current Plan' : 'Downgrade'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Student Plan */}
            <Card className={`${tier === 'student' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-500" />
                    Student Premium
                  </CardTitle>
                  <Badge>Popular</Badge>
                </div>
                <CardDescription>Enhanced learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">$2.99</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
                
                <div className="space-y-2">
                  {SUBSCRIPTION_PLANS.student.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={handleUpgrade}
                  disabled={tier === 'student'}
                >
                  {tier === 'student' ? 'Current Plan' : tier === 'school' ? 'Downgrade' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
            
            {/* School Plan */}
            <Card className={`${tier === 'school' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <School className="h-5 w-5 mr-2 text-purple-500" />
                    School Pro
                  </CardTitle>
                  <Badge>Best Value</Badge>
                </div>
                <CardDescription>Complete educational solution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">$19.99</div>
                  <div className="text-sm text-gray-500">per month per teacher</div>
                </div>
                
                <div className="space-y-2">
                  {SUBSCRIPTION_PLANS.school.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  onClick={handleUpgrade}
                  disabled={tier === 'school'}
                >
                  {tier === 'school' ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>All plans include access to our community forums and basic support.</p>
            <p className="mt-1">Need a custom plan for your institution? <a href="#" className="text-blue-600 hover:underline">Contact us</a>.</p>
          </div>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="analytics" className="pt-6">
            <RevenueAnalytics />
          </TabsContent>
        )}
      </Tabs>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}