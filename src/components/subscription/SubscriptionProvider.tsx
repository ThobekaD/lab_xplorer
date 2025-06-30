import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { SubscriptionStatus, SubscriptionTier } from '@/types/subscription';

interface SubscriptionContextType {
  isSubscriptionLoading: boolean;
  subscription: SubscriptionStatus | null;
  tier: SubscriptionTier;
  canAccessFeature: (feature: string) => boolean;
  canPerformExperiment: () => boolean;
  remainingExperiments: number;
  isUnlimited: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscriptionLoading: true,
  subscription: null,
  tier: 'free',
  canAccessFeature: () => false,
  canPerformExperiment: () => false,
  remainingExperiments: 0,
  isUnlimited: false,
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    isInitialized,
    isLoading,
    subscriptionStatus,
    initialize,
    canAccessFeature,
    canPerformExperiment,
    getRemainingExperiments
  } = useSubscriptionStore();

  // Initialize subscription when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      initialize(user.id);
    }
  }, [isAuthenticated, user, isInitialized, initialize]);

  const contextValue: SubscriptionContextType = {
    isSubscriptionLoading: isLoading || !isInitialized,
    subscription: subscriptionStatus,
    tier: subscriptionStatus?.tier || 'free',
    canAccessFeature,
    canPerformExperiment,
    remainingExperiments: getRemainingExperiments(),
    isUnlimited: subscriptionStatus?.tier === 'student' || subscriptionStatus?.tier === 'school',
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}