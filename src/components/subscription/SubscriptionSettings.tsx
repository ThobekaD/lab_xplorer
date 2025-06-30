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
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  Bell, 
  Globe, 
  Wifi, 
  Smartphone, 
  Loader2, 
  ArrowUpRight, 
  Zap 
} from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { PaywallManager } from './PaywallManager';

interface SubscriptionSettingsProps {
  className?: string;
}

export function SubscriptionSettings({
  className = ''
}: SubscriptionSettingsProps) {
  const { 
    subscription, 
    tier, 
    isSubscriptionLoading 
  } = useSubscription();
  
  const { 
    refreshSubscription, 
    restorePurchases 
  } = useSubscriptionStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [settings, setSettings] = useState({
    autoRenew: true,
    receivePromotions: true,
    offlineSync: true,
    preferredLanguage: 'en',
    deviceSync: true,
    pushNotifications: true
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSubscription();
    setIsRefreshing(false);
  };
  
  const handleRestore = async () => {
    setIsRestoring(true);
    await restorePurchases();
    setIsRestoring(false);
  };
  
  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Subscription Settings</CardTitle>
            <CardDescription>
              Manage your subscription and payment settings
            </CardDescription>
          </div>
          
          {!isSubscriptionLoading && (
            <Badge className={getTierColor(tier)}>
              {getTierLabel(tier)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isSubscriptionLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Bell className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="devices">
                <Smartphone className="h-4 w-4 mr-2" />
                Devices
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="space-y-4 pt-4">
              {/* Current Plan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Plan</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">{getTierLabel(tier)}</h4>
                        {subscription?.isTrial && (
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                            Trial
                          </Badge>
                        )}
                      </div>
                      
                      {subscription?.renewalDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Renews on {formatDate(subscription.renewalDate)}
                        </p>
                      )}
                      
                      {subscription?.trialEndDate && subscription.isTrial && (
                        <p className="text-sm text-yellow-600 mt-1">
                          Trial ends on {formatDate(subscription.trialEndDate)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      {tier === 'free' ? (
                        <Button 
                          onClick={() => setShowPaywall(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade
                        </Button>
                      ) : (
                        subscription?.customerInfo?.managementURL && (
                          <Button 
                            variant="outline" 
                            onClick={() => window.open(subscription.customerInfo?.managementURL, '_blank')}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </Button>
                        )
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                        >
                          {isRefreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleRestore}
                          disabled={isRestoring}
                        >
                          {isRestoring ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Restore Purchases'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Billing History */}
              {tier !== 'free' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing History</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{formatDate(subscription?.customerInfo?.originalPurchaseDate)}</span>
                      </div>
                      <div>
                        <Badge variant="outline">Initial Purchase</Badge>
                      </div>
                    </div>
                    
                    <div className="py-4 text-center text-sm text-gray-500">
                      View complete billing history in your account management page
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Renew Subscription</Label>
                    <p className="text-sm text-gray-500">
                      Automatically renew your subscription when it expires
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRenew}
                    onCheckedChange={(checked) => handleSettingChange('autoRenew', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Promotional Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive emails about special offers and promotions
                    </p>
                  </div>
                  <Switch
                    checked={settings.receivePromotions}
                    onCheckedChange={(checked) => handleSettingChange('receivePromotions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Offline Sync</Label>
                    <p className="text-sm text-gray-500">
                      Sync experiments for offline use
                    </p>
                  </div>
                  <Switch
                    checked={settings.offlineSync}
                    onCheckedChange={(checked) => handleSettingChange('offlineSync', checked)}
                    disabled={tier === 'free'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Preferred Language</Label>
                  <Select
                    value={settings.preferredLanguage}
                    onValueChange={(value) => handleSettingChange('preferredLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                  {tier === 'free' && (
                    <p className="text-xs text-gray-500">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Upgrade to access multiple languages
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sync Across Devices</Label>
                    <p className="text-sm text-gray-500">
                      Keep your experiments and progress synced across all your devices
                    </p>
                  </div>
                  <Switch
                    checked={settings.deviceSync}
                    onCheckedChange={(checked) => handleSettingChange('deviceSync', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications about your experiments and achievements
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Device</h4>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Web Browser</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Offline Access</Label>
                    <p className="text-sm text-gray-500">
                      Download experiments for offline use
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">
                      {tier === 'free' 
                        ? 'Not available' 
                        : `${tier === 'student' ? '10' : 'Unlimited'} experiments`}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </Card>
  );
}