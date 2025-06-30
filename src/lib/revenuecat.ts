import { SubscriptionPlan, SubscriptionTier, SubscriptionStatus, PurchaseResult, RestoreResult } from '@/types/subscription';

// RevenueCat API key
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'rcb_BXbFNLkgBmnPyBUtaVjTUNiDHcMZ';

// Subscription plans
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic access to LabXplorer',
    features: [
      '3 experiments per month',
      'Basic physics, chemistry, and biology experiments',
      '1 game per subject',
      'Community forums access',
      'Basic digital notebook',
      'Standard voice assistant (English only)'
    ],
    price: 'Free',
    interval: 'month',
    limits: {
      experimentsPerMonth: 3,
      gamesAccess: 'limited',
      offlineExperiments: 0,
      languages: ['en'],
      support: 'standard',
      analytics: false,
      customExperiments: false,
      lmsIntegration: false
    },
    revenueCatId: 'free_tier'
  },
  student: {
    id: 'student',
    name: 'Student Premium',
    description: 'Enhanced learning experience for individual students',
    features: [
      'Unlimited experiment access',
      'All educational games',
      'Advanced simulations',
      'Multi-language support',
      'Priority customer support',
      'Offline sync for 10 experiments',
      'Basic analytics dashboard'
    ],
    price: '$2.99',
    interval: 'month',
    limits: {
      experimentsPerMonth: Infinity,
      gamesAccess: 'full',
      offlineExperiments: 10,
      languages: ['en', 'es', 'fr', 'de', 'zh'],
      support: 'priority',
      analytics: true,
      customExperiments: false,
      lmsIntegration: false
    },
    revenueCatId: 'prod498cfeb85a'
  },
  school: {
    id: 'school',
    name: 'School Pro',
    description: 'Complete solution for educational institutions',
    features: [
      'Classroom management tools',
      'Advanced analytics and reporting',
      'Custom experiment creation',
      'Bulk user management',
      'Integration with LMS systems',
      'White-label branding options',
      'Premium support and training'
    ],
    price: '$19.99',
    interval: 'month',
    limits: {
      experimentsPerMonth: Infinity,
      gamesAccess: 'full',
      offlineExperiments: Infinity,
      languages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ru', 'ar'],
      support: 'premium',
      analytics: true,
      customExperiments: true,
      lmsIntegration: true
    },
    revenueCatId: 'prod9d18fcc8cd'
  }
};

// Mock implementation of RevenueCat client
class RevenueCatClient {
  private apiKey: string;
  private userId: string | null = null;
  private currentSubscription: SubscriptionStatus | null = null;
  private isInitialized = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(userId: string): Promise<boolean> {
    try {
      this.userId = userId;
      
      // In a real implementation, this would configure the RevenueCat SDK
      // For now, we'll simulate a successful initialization
      this.isInitialized = true;
      
      // Fetch current subscription status
      await this.fetchSubscriptionStatus();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      return false;
    }
  }

  async fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat client not initialized');
    }
    
    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll return a mock subscription status
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we'll return a free tier subscription
      this.currentSubscription = {
        isActive: true,
        tier: 'free',
        isTrial: false,
        entitlements: ['free_access'],
        customerInfo: {
          originalAppUserId: this.userId || '',
        }
      };
      
      return this.currentSubscription;
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      throw error;
    }
  }

  async purchasePackage(packageId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat client not initialized');
    }
    
    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll simulate a successful purchase
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine which plan was purchased
      let tier: SubscriptionTier = 'free';
      
      if (packageId === SUBSCRIPTION_PLANS.student.revenueCatId) {
        tier = 'student';
      } else if (packageId === SUBSCRIPTION_PLANS.school.revenueCatId) {
        tier = 'school';
      }
      
      // Update current subscription
      this.currentSubscription = {
        isActive: true,
        tier,
        isTrial: false,
        entitlements: [tier === 'student' ? 'premium_access' : 'school_access'],
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        customerInfo: {
          originalAppUserId: this.userId || '',
          originalPurchaseDate: new Date(),
        }
      };
      
      return {
        success: true,
        transaction: {
          id: `transaction_${Date.now()}`,
          productId: packageId,
          purchaseDate: new Date(),
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      };
    } catch (error) {
      console.error('Failed to purchase package:', error);
      return {
        success: false,
        error: {
          code: 'purchase_failed',
          message: 'Failed to complete purchase'
        }
      };
    }
  }

  async restorePurchases(): Promise<RestoreResult> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat client not initialized');
    }
    
    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll simulate a successful restore
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll restore to a student subscription
      this.currentSubscription = {
        isActive: true,
        tier: 'student',
        isTrial: false,
        entitlements: ['premium_access'],
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        customerInfo: {
          originalAppUserId: this.userId || '',
          originalPurchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        }
      };
      
      return {
        success: true,
        restoredEntitlements: ['premium_access']
      };
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return {
        success: false,
        restoredEntitlements: [],
        error: {
          code: 'restore_failed',
          message: 'Failed to restore purchases'
        }
      };
    }
  }

  async checkEntitlement(entitlementId: string): Promise<boolean> {
    if (!this.isInitialized || !this.currentSubscription) {
      return false;
    }
    
    return this.currentSubscription.entitlements.includes(entitlementId);
  }

  getCurrentSubscription(): SubscriptionStatus | null {
    return this.currentSubscription;
  }

  async getOfferings(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('RevenueCat client not initialized');
    }
    
    // In a real implementation, this would call the RevenueCat API
    // For now, we'll return mock offerings
    return {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: SUBSCRIPTION_PLANS.student.revenueCatId,
            packageType: 'monthly',
            product: {
              identifier: SUBSCRIPTION_PLANS.student.revenueCatId,
              title: SUBSCRIPTION_PLANS.student.name,
              description: SUBSCRIPTION_PLANS.student.description,
              price: 2.99,
              priceString: '$2.99',
            }
          },
          {
            identifier: SUBSCRIPTION_PLANS.school.revenueCatId,
            packageType: 'monthly',
            product: {
              identifier: SUBSCRIPTION_PLANS.school.revenueCatId,
              title: SUBSCRIPTION_PLANS.school.name,
              description: SUBSCRIPTION_PLANS.school.description,
              price: 19.99,
              priceString: '$19.99',
            }
          }
        ]
      }
    };
  }
}

// Create singleton instance
export const revenueCatClient = new RevenueCatClient(REVENUECAT_API_KEY);

// Feature access helpers
export function canAccessFeature(feature: string, tier: SubscriptionTier): boolean {
  switch (feature) {
    case 'unlimited_experiments':
      return tier === 'student' || tier === 'school';
    case 'all_games':
      return tier === 'student' || tier === 'school';
    case 'advanced_simulations':
      return tier === 'student' || tier === 'school';
    case 'multi_language':
      return tier === 'student' || tier === 'school';
    case 'offline_sync':
      return tier === 'student' || tier === 'school';
    case 'analytics':
      return tier === 'student' || tier === 'school';
    case 'classroom_management':
      return tier === 'school';
    case 'custom_experiments':
      return tier === 'school';
    case 'bulk_user_management':
      return tier === 'school';
    case 'lms_integration':
      return tier === 'school';
    case 'white_label':
      return tier === 'school';
    default:
      return false;
  }
}

export function getExperimentLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_PLANS[tier].limits.experimentsPerMonth;
}

export function getOfflineExperimentLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_PLANS[tier].limits.offlineExperiments;
}