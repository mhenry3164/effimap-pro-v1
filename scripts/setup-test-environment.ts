import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase/firebase-admin.json');

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  divisionId?: string;
  branchId?: string;
}

// Enterprise feature flags
const enterpriseFeatures = {
  // Professional plan features
  enableAdvancedMapping: true,      // Professional+
  enableAnalytics: true,            // Professional+
  enableTeamManagement: true,       // Professional+
  
  // Enterprise-only features (disabled)
  enableCustomBoundaries: false,    // Enterprise only
  enableApiAccess: false,           // Enterprise only
  
  // Basic features
  enableBulkOperations: true,
  enableCustomFields: true,
  enableIntegrations: true,
  enableWhiteLabeling: false,       // Enterprise only
  enableAuditLog: true,
  enableSSOIntegration: false,      // Enterprise only
  enableCustomWorkflows: true,
  enableAdvancedReporting: true,
  enableDataExport: true,
  enableRealTimeTracking: true,
  enableGeofencing: true,
  enableMobileApp: true,
  enableOfflineMode: true
};

async function createTestTenant() {
  console.log('Creating test tenant...');
  const tenantId = 'test-tenant';
  
  // Create tenant document
  const tenantRef = db.collection('tenants').doc(tenantId);
  await tenantRef.set({
    id: tenantId,
    name: 'Test Enterprise Organization',
    billing: {
      type: 'legacy',
      legacyAccess: {
        reason: 'test_environment',
        plan: 'professional'
      }
    },
    subscription: {
      plan: 'professional',
      status: 'active',
      currentPeriodEnd: '2099-12-31T23:59:59.999Z',
      trialEnding: false,
      trialEndDate: null,
      trialStartDate: null
    },
    features: enterpriseFeatures,
    settings: {
      rateLimit: 100,
      autoAssignTerritories: false,
      enableNotifications: true
    },
    branding: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e'
    },
    metadata: {
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    }
  });

  console.log(`Created test tenant: ${tenantId}`);
  return tenantId;
}

async function createTestUsers(tenantId: string) {
  console.log('Creating test users...');
  const users: TestUser[] = [
    {
      email: 'platform.admin@effimap.test',
      password: 'password123',
      displayName: 'Platform Admin',
      roles: ['platformAdmin'],
      permissions: ['*'],
      tenantId
    },
    {
      email: 'org.admin@effimap.test',
      password: 'password123',
      displayName: 'Organization Admin',
      roles: ['orgAdmin'],
      permissions: ['organization.*'],
      tenantId
    },
    {
      email: 'division.admin@effimap.test',
      password: 'password123',
      displayName: 'Division Admin',
      roles: ['divisionAdmin'],
      permissions: ['division.*'],
      tenantId,
      divisionId: 'div-test-001'
    },
    {
      email: 'branch.admin@effimap.test',
      password: 'password123',
      displayName: 'Branch Admin',
      roles: ['branchAdmin'],
      permissions: ['branch.*'],
      tenantId,
      divisionId: 'div-test-001',
      branchId: 'br-test-001'
    },
    {
      email: 'territory.manager@effimap.test',
      password: 'password123',
      displayName: 'Territory Manager',
      roles: ['territoryManager'],
      permissions: ['territory.*'],
      tenantId,
      divisionId: 'div-test-001',
      branchId: 'br-test-001'
    }
  ];

  for (const user of users) {
    try {
      // Create or update Firebase Auth user
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        await auth.updateUser(userRecord.uid, {
          email: user.email,
          displayName: user.displayName,
          password: user.password,
        });
      } catch (error) {
        userRecord = await auth.createUser({
          email: user.email,
          displayName: user.displayName,
          password: user.password,
        });
      }

      // Prepare base user data
      const userData: any = {
        email: user.email,
        displayName: user.displayName,
        tenantId: user.tenantId,
        organizationRoles: user.roles.filter(role => role !== 'platformAdmin'),
        permissions: user.permissions,
        metadata: {
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
          createdBy: 'system',
          updatedBy: 'system'
        }
      };

      // Only add platformRole if user is a platform admin
      if (user.roles.includes('platformAdmin')) {
        userData.platformRole = 'platformAdmin';
      }

      // Only add optional fields if they exist
      if (user.divisionId) {
        userData.divisionId = user.divisionId;
      }
      if (user.branchId) {
        userData.branchId = user.branchId;
      }

      // Create user document in Firestore
      const userRef = db.collection('users').doc(userRecord.uid);
      await userRef.set(userData);

      // Add to tenant-users collection
      const tenantUserRef = db.collection('tenants').doc(tenantId)
        .collection('users').doc(userRecord.uid);
      await tenantUserRef.set(userData);

      console.log(`Created/Updated user: ${user.email}`);
    } catch (error) {
      console.error(`Error creating/updating user ${user.email}:`, error);
    }
  }
}

async function createOrganizationStructure(tenantId: string) {
  console.log('Creating organization structure...');
  
  // Create test division
  const divisionRef = db.collection('tenants').doc(tenantId)
    .collection('divisions').doc('div-test-001');
  await divisionRef.set({
    id: 'div-test-001',
    name: 'Test Division',
    code: 'TEST-DIV',
    status: 'active',
    metadata: {
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    }
  });

  // Create test branch
  const branchRef = db.collection('tenants').doc(tenantId)
    .collection('branches').doc('br-test-001');
  await branchRef.set({
    id: 'br-test-001',
    name: 'Test Branch',
    code: 'TEST-BR',
    divisionId: 'div-test-001',
    status: 'active',
    contact: {
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      phone: '555-0123',
      email: 'test.branch@effimap.test'
    },
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    metadata: {
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    }
  });

  console.log('Created organization structure');
}

async function setupTestEnvironment() {
  console.log('Starting test environment setup...');
  
  const tenantId = await createTestTenant();
  await createTestUsers(tenantId);
  await createOrganizationStructure(tenantId);
  
  console.log('Test environment setup complete!');
}

// Run the setup
setupTestEnvironment();
