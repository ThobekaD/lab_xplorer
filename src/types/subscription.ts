export type SubscriptionTier = 'free' | 'student' | 'school';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  interval: 'month' | 'year';
  limits: {
    experimentsPerMonth: number;
    gamesAccess: 'limited' | 'full';
    offlineExperiments: number;
    languages: string[];
    support: 'standard' | 'priority' | 'premium';
    analytics: boolean;
    customExperiments: boolean;
    lmsIntegration: boolean;
  };
  revenueCatId: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expirationDate?: Date;
  renewalDate?: Date;
  isTrial: boolean;
  trialEndDate?: Date;
  entitlements: string[];
  customerInfo?: {
    originalAppUserId: string;
    managementURL?: string;
    originalPurchaseDate?: Date;
  };
}

export interface OfferDetails {
  id: string;
  name: string;
  description: string;
  discount: string;
  duration: string;
  expirationDate?: Date;
}

export interface PurchaseResult {
  success: boolean;
  transaction?: {
    id: string;
    productId: string;
    purchaseDate: Date;
    expirationDate?: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface RestoreResult {
  success: boolean;
  restoredEntitlements: string[];
  error?: {
    code: string;
    message: string;
  };
}

export interface SubscriptionUsage {
  experimentsUsed: number;
  experimentsLimit: number;
  experimentsResetDate?: Date;
  offlineExperimentsUsed: number;
  offlineExperimentsLimit: number;
}

export interface SubscriptionAnalytics {
  mrr: number;
  activeSubscribers: number;
  conversionRate: number;
  churnRate: number;
  trialConversionRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}