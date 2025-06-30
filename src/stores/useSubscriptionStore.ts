import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { revenueCatClient, SUBSCRIPTION_PLANS, canAccessFeature } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { SubscriptionTier, SubscriptionStatus, PurchaseResult, RestoreResult, SubscriptionUsage } from '@/types/subscription';

interface SubscriptionState {
  // Subscription state
  isInitialized: boolean;
  isLoading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  
  // Usage tracking
  usageData: SubscriptionUsage;
  
  // A/B testing variants
  paywallVariant: 'standard' | 'benefits' | 'testimonials';
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  purchaseSubscription: (planId: string) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<RestoreResult>;
  
  // Feature access helpers
  canAccessFeature: (feature: string) => boolean;
  canPerformExperiment: () => boolean;
  getRemainingExperiments: () => number;
  
  // Usage tracking
  trackExperimentUsage: () => Promise<void>;
  trackOfflineExperimentUsage: (experimentId: string) => Promise<void>;
  resetUsage: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isLoading: false,
      subscriptionStatus: null,
      
      usageData: {
        experimentsUsed: 0,
        experimentsLimit: 3, // Default free tier limit
        offlineExperimentsUsed: 0,
        offlineExperimentsLimit: 0, // Default free tier limit
      },
      
      paywallVariant: 'standard',
      
      // Initialize RevenueCat client and fetch subscription status
      initialize: async (userId: string) => {
        try {
          set({ isLoading: true });
          
          // Initialize RevenueCat client
          await revenueCatClient.initialize(userId);
          
          // Fetch subscription status
          const status = await revenueCatClient.fetchSubscriptionStatus();
          
          // Fetch usage data from database - use maybeSingle() to handle no rows gracefully
          const { data: usageData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          // Set subscription state
          set({
            isInitialized: true,
            subscriptionStatus: status,
            usageData: {
              experimentsUsed: usageData?.experiments_used || 0,
              experimentsLimit: SUBSCRIPTION_PLANS[status.tier].limits.experimentsPerMonth,
              experimentsResetDate: usageData?.reset_date ? new Date(usageData.reset_date) : undefined,
              offlineExperimentsUsed: usageData?.offline_experiments_used || 0,
              offlineExperimentsLimit: SUBSCRIPTION_PLANS[status.tier].limits.offlineExperiments,
            },
            // Randomly assign A/B test variant
            paywallVariant: ['standard', 'benefits', 'testimonials'][Math.floor(Math.random() * 3)] as any,
          });
        } catch (error) {
          console.error('Failed to initialize subscription:', error);
          
          // Set default free tier if initialization fails
          set({
            isInitialized: true,
            subscriptionStatus: {
              isActive: true,
              tier: 'free',
              isTrial: false,
              entitlements: ['free_access'],
            },
            usageData: {
              experimentsUsed: 0,
              experimentsLimit: 3,
              offlineExperimentsUsed: 0,
              offlineExperimentsLimit: 0,
            },
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Refresh subscription status
      refreshSubscription: async () => {
        try {
          set({ isLoading: true });
          
          // Fetch subscription status
          const status = await revenueCatClient.fetchSubscriptionStatus();
          
          // Update subscription state
          set({
            subscriptionStatus: status,
            usageData: {
              ...get().usageData,
              experimentsLimit: SUBSCRIPTION_PLANS[status.tier].limits.experimentsPerMonth,
              offlineExperimentsLimit: SUBSCRIPTION_PLANS[status.tier].limits.offlineExperiments,
            },
          });
        } catch (error) {
          console.error('Failed to refresh subscription:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Purchase subscription
      purchaseSubscription: async (planId: string) => {
        try {
          set({ isLoading: true });
          
          // Purchase package
          const result = await revenueCatClient.purchasePackage(planId);
          
          if (result.success) {
            // Refresh subscription status
            await get().refreshSubscription();
            
            // Show success toast
            toast.success('Subscription purchased!', {
              description: 'Thank you for subscribing to LabXplorer.',
            });
          } else {
            // Show error toast
            toast.error('Purchase failed', {
              description: result.error?.message || 'Failed to complete purchase.',
            });
          }
          
          return result;
        } catch (error) {
          console.error('Failed to purchase subscription:', error);
          
          // Show error toast
          toast.error('Purchase failed', {
            description: 'An unexpected error occurred. Please try again.',
          });
          
          return {
            success: false,
            error: {
              code: 'unknown_error',
              message: 'An unexpected error occurred',
            },
          };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Restore purchases
      restorePurchases: async () => {
        try {
          set({ isLoading: true });
          
          // Restore purchases
          const result = await revenueCatClient.restorePurchases();
          
          if (result.success) {
            // Refresh subscription status
            await get().refreshSubscription();
            
            // Show success toast
            toast.success('Purchases restored!', {
              description: `Restored ${result.restoredEntitlements.length} entitlements.`,
            });
          } else {
            // Show error toast
            toast.error('Restore failed', {
              description: result.error?.message || 'Failed to restore purchases.',
            });
          }
          
          return result;
        } catch (error) {
          console.error('Failed to restore purchases:', error);
          
          // Show error toast
          toast.error('Restore failed', {
            description: 'An unexpected error occurred. Please try again.',
          });
          
          return {
            success: false,
            restoredEntitlements: [],
            error: {
              code: 'unknown_error',
              message: 'An unexpected error occurred',
            },
          };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Feature access helpers
      canAccessFeature: (feature: string) => {
        const { subscriptionStatus } = get();
        
        if (!subscriptionStatus) {
          return false;
        }
        
        return canAccessFeature(feature, subscriptionStatus.tier);
      },
      
      canPerformExperiment: () => {
        const { subscriptionStatus, usageData } = get();
        
        if (!subscriptionStatus) {
          return false;
        }
        
        // Unlimited experiments for paid tiers
        if (subscriptionStatus.tier === 'student' || subscriptionStatus.tier === 'school') {
          return true;
        }
        
        // Check experiment limit for free tier
        return usageData.experimentsUsed < usageData.experimentsLimit;
      },
      
      getRemainingExperiments: () => {
        const { usageData } = get();
        
        if (usageData.experimentsLimit === Infinity) {
          return Infinity;
        }
        
        return Math.max(0, usageData.experimentsLimit - usageData.experimentsUsed);
      },
      
      // Usage tracking
      trackExperimentUsage: async () => {
        const { subscriptionStatus, usageData } = get();
        
        if (!subscriptionStatus) {
          return;
        }
        
        // Don't track usage for unlimited tiers
        if (subscriptionStatus.tier === 'student' || subscriptionStatus.tier === 'school') {
          return;
        }
        
        try {
          // Update local usage data
          set({
            usageData: {
              ...usageData,
              experimentsUsed: usageData.experimentsUsed + 1,
            },
          });
          
          // Update usage in database
          await supabase.rpc('increment_experiment_usage');
        } catch (error) {
          console.error('Failed to track experiment usage:', error);
        }
      },
      
      trackOfflineExperimentUsage: async (experimentId: string) => {
        const { subscriptionStatus, usageData } = get();
        
        if (!subscriptionStatus) {
          return;
        }
        
        // Check if user has offline access
        if (usageData.offlineExperimentsLimit <= 0) {
          return;
        }
        
        try {
          // Update local usage data
          set({
            usageData: {
              ...usageData,
              offlineExperimentsUsed: usageData.offlineExperimentsUsed + 1,
            },
          });
          
          // Update usage in database
          await supabase.rpc('increment_offline_experiment_usage', {
            experiment_id: experimentId,
          });
        } catch (error) {
          console.error('Failed to track offline experiment usage:', error);
        }
      },
      
      resetUsage: async () => {
        try {
          // Reset usage data
          set({
            usageData: {
              ...get().usageData,
              experimentsUsed: 0,
              experimentsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          });
          
          // Reset usage in database
          await supabase.rpc('reset_experiment_usage');
          
          return;
        } catch (error) {
          console.error('Failed to reset usage:', error);
        }
      },
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        subscriptionStatus: state.subscriptionStatus,
        usageData: state.usageData,
        paywallVariant: state.paywallVariant,
      }),
    }
  )
);