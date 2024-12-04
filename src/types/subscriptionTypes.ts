export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

export interface SubscriptionFeatures {
  // Core Features
  enableAdvancedMapping: boolean;
  enableAnalytics: boolean;
  enableCustomBoundaries: boolean;
  enableTeamManagement: boolean;
  enableApiAccess: boolean;
  enableBulkOperations: boolean;
  enableCustomFields: boolean;
  enableIntegrations: boolean;
  enableWhiteLabeling: boolean;
  enableAuditLog: boolean;
  enableSSOIntegration: boolean;
  enableCustomWorkflows: boolean;
  enableAdvancedReporting: boolean;
  enableDataExport: boolean;
  enableRealTimeTracking: boolean;
  enableGeofencing: boolean;
  enableMobileApp: boolean;
  enableOfflineMode: boolean;

  // Limits
  maxBranches: number;
  maxDivisions: number;
  maxTerritories: number;
  maxUsers: number;
  maxApiCalls: number;
  maxStorageGB: number;
  maxCustomFields: number;
  maxIntegrations: number;
}

export interface SubscriptionBilling {
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  plan: SubscriptionPlan;
  interval: 'monthly' | 'yearly';
  price: number;
  currency: string;
  lastBillingDate: Date;
  nextBillingDate: Date;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  startDate: Date;
  endDate: Date;
  features: SubscriptionFeatures;
  limits: {
    maxUsers: number;
    maxBranches: number;
    maxDivisions: number;
    maxTerritories: number;
    maxApiCalls: number;
    maxStorageGB: number;
    maxCustomFields: number;
    maxIntegrations: number;
  };
  billing: SubscriptionBilling;
}

export const DEFAULT_PLAN_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    enableAdvancedMapping: false,
    enableAnalytics: false,
    enableCustomBoundaries: false,
    enableTeamManagement: false,
    enableApiAccess: false,
    enableBulkOperations: false,
    enableCustomFields: false,
    enableIntegrations: false,
    enableWhiteLabeling: false,
    enableAuditLog: false,
    enableSSOIntegration: false,
    enableCustomWorkflows: false,
    enableAdvancedReporting: false,
    enableDataExport: false,
    enableRealTimeTracking: false,
    enableGeofencing: false,
    enableMobileApp: false,
    enableOfflineMode: false,
    maxBranches: 1,
    maxDivisions: 1,
    maxTerritories: 5,
    maxUsers: 2,
    maxApiCalls: 100,
    maxStorageGB: 1,
    maxCustomFields: 0,
    maxIntegrations: 0,
  },
  basic: {
    enableAdvancedMapping: true,
    enableAnalytics: true,
    enableCustomBoundaries: true,
    enableTeamManagement: false,
    enableApiAccess: false,
    enableBulkOperations: false,
    enableCustomFields: false,
    enableIntegrations: false,
    enableWhiteLabeling: false,
    enableAuditLog: false,
    enableSSOIntegration: false,
    enableCustomWorkflows: false,
    enableAdvancedReporting: false,
    enableDataExport: true,
    enableRealTimeTracking: false,
    enableGeofencing: false,
    enableMobileApp: true,
    enableOfflineMode: false,
    maxBranches: 2,
    maxDivisions: 1,
    maxTerritories: 20,
    maxUsers: 5,
    maxApiCalls: 1000,
    maxStorageGB: 5,
    maxCustomFields: 5,
    maxIntegrations: 1,
  },
  professional: {
    enableAdvancedMapping: true,
    enableAnalytics: true,
    enableCustomBoundaries: true,
    enableTeamManagement: true,
    enableApiAccess: true,
    enableBulkOperations: true,
    enableCustomFields: true,
    enableIntegrations: true,
    enableWhiteLabeling: false,
    enableAuditLog: true,
    enableSSOIntegration: false,
    enableCustomWorkflows: true,
    enableAdvancedReporting: true,
    enableDataExport: true,
    enableRealTimeTracking: true,
    enableGeofencing: true,
    enableMobileApp: true,
    enableOfflineMode: true,
    maxBranches: 10,
    maxDivisions: 5,
    maxTerritories: 100,
    maxUsers: 20,
    maxApiCalls: 10000,
    maxStorageGB: 20,
    maxCustomFields: 20,
    maxIntegrations: 5,
  },
  enterprise: {
    enableAdvancedMapping: true,
    enableAnalytics: true,
    enableCustomBoundaries: true,
    enableTeamManagement: true,
    enableApiAccess: true,
    enableBulkOperations: true,
    enableCustomFields: true,
    enableIntegrations: true,
    enableWhiteLabeling: true,
    enableAuditLog: true,
    enableSSOIntegration: true,
    enableCustomWorkflows: true,
    enableAdvancedReporting: true,
    enableDataExport: true,
    enableRealTimeTracking: true,
    enableGeofencing: true,
    enableMobileApp: true,
    enableOfflineMode: true,
    maxBranches: Number.MAX_SAFE_INTEGER,
    maxDivisions: Number.MAX_SAFE_INTEGER,
    maxTerritories: Number.MAX_SAFE_INTEGER,
    maxUsers: Number.MAX_SAFE_INTEGER,
    maxApiCalls: Number.MAX_SAFE_INTEGER,
    maxStorageGB: Number.MAX_SAFE_INTEGER,
    maxCustomFields: Number.MAX_SAFE_INTEGER,
    maxIntegrations: Number.MAX_SAFE_INTEGER,
  },
};
