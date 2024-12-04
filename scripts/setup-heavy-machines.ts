import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase/firebase-admin.json');

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

interface HMUser {
  email: string;
  password: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  divisionId?: string;
  branchId?: string;
}

interface HMBranch {
  id: string;
  name: string;
  code: string;
  divisionId: string;
  status: 'active' | 'inactive';
  manager?: string; // Email of branch manager
  contact: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
    fax?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    website?: string;
    businessHours?: string;
    serviceArea?: string;
  };
}

interface HMRepresentative {
  id: string;
  name: string;
  code: string;
  branchId: string;
  type: 'system-user' | 'territory-only';
  status: 'active' | 'inactive';
  email?: string; // Required only for system-user type
  contact?: {
    phone?: string;
    mobile?: string;
    alternateEmail?: string;
    preferredContactMethod?: 'email' | 'phone' | 'mobile';
  };
  personalInfo?: {
    title?: string;
    department?: string;
    employeeId?: string;
    startDate?: string;
    notes?: string;
  };
  territories?: {
    assigned: string[];
    primary?: string;
  };
  metadata?: {
    lastTerritorySyncDate?: string;
    lastActivityDate?: string;
    customFields?: {
      [key: string]: string | number | boolean;
    };
  };
}

// Configuration - Heavy Machines data
const TENANT_ID = 'heavy-machines';
const TENANT_NAME = 'Heavy Machines, Inc.';

const divisions = [
  { id: 'div-al', name: 'Alabama Division', code: 'AL', status: 'active' },
  { id: 'div-ga', name: 'Georgia Division', code: 'GA', status: 'active' },
  { id: 'div-tn', name: 'Tennessee Division', code: 'TN', status: 'active' },
  { id: 'div-la', name: 'Louisiana Division', code: 'LA', status: 'active' },
  { id: 'div-me', name: 'Maine Division', code: 'ME', status: 'active' }
];

const branches: HMBranch[] = [
  {
    id: 'br-bir',
    name: 'Birmingham Branch',
    code: 'BIR',
    divisionId: 'div-al',
    status: 'active',
    manager: 'jjernigan@heavy-llc.com',
    contact: {
      address: {
        street: '825 31st St',
        city: 'Birmingham',
        state: 'AL',
        zipCode: '35203'
      },
      phone: '205-323-6108',
      email: 'birmingham@heavy-llc.com'
    },
    location: {
      latitude: 33.5186,
      longitude: -86.8104
    },
    metadata: {
      businessHours: 'Mon-Fri: 7:00 AM - 5:00 PM',
      serviceArea: 'Greater Birmingham Area'
    }
  },
  {
    id: 'br-cov',
    name: 'Covington Branch',
    code: 'COV',
    divisionId: 'div-ga',
    status: 'active',
    manager: 'jtaylor@heavy-llc.com',
    contact: {
      address: {
        street: '10110 Rob',
        city: 'Covington',
        state: 'GA',
        zipCode: '30014'
      },
      phone: '770-788-0888',
      email: 'covington@heavy-llc.com'
    },
    location: {
      latitude: 33.5967,
      longitude: -83.8601
    }
  },
  {
    id: 'br-dec',
    name: 'Decatur Branch',
    code: 'DEC',
    divisionId: 'div-al',
    status: 'active',
    manager: 'kfollmann@heavy-llc.com',
    contact: {
      address: {
        street: '314 Beltline',
        city: 'Decatur',
        state: 'AL',
        zipCode: '35061'
      },
      phone: '256-898-0550',
      email: 'decatur@heavy-llc.com'
    },
    location: {
      latitude: 34.6059,
      longitude: -86.9833
    }
  },
  {
    id: 'br-gray',
    name: 'Gray Branch',
    code: 'GRY',
    divisionId: 'div-tn',
    status: 'active',
    manager: 'mroberts@heavy-llc.com',
    contact: {
      address: {
        street: '364 Bob Jo',
        city: 'Gray',
        state: 'TN',
        zipCode: '37615'
      },
      phone: '423-282-5462',
      email: 'gray@heavy-llc.com'
    },
    location: {
      latitude: 36.4095,
      longitude: -82.4635
    }
  },
  {
    id: 'br-mem',
    name: 'Memphis Branch',
    code: 'MEM',
    divisionId: 'div-tn',
    status: 'active',
    manager: 'cash@heavy-llc.com',
    contact: {
      address: {
        street: '120 Mann Drive',
        city: 'Piperton',
        state: 'TN',
        zipCode: '38017'
      },
      phone: '901-260-2200',
      email: 'memphis@heavy-llc.com'
    },
    location: {
      latitude: 35.0374,
      longitude: -89.6451
    }
  },
  {
    id: 'br-mob',
    name: 'Mobile Branch',
    code: 'MOB',
    divisionId: 'div-al',
    status: 'active',
    manager: 'jbarber@heavy-llc.com',
    contact: {
      address: {
        street: '7651 Theodore',
        city: 'Theodore',
        state: 'AL',
        zipCode: '36582'
      },
      phone: '251-653-5955',
      email: 'mobile@heavy-llc.com'
    },
    location: {
      latitude: 30.5427,
      longitude: -88.1726
    }
  },
  {
    id: 'br-mur',
    name: 'Murfreesboro Branch',
    code: 'MUR',
    divisionId: 'div-tn',
    status: 'active',
    manager: 'rthielen@heavy-llc.com',
    contact: {
      address: {
        street: '2115 N. Thompson',
        city: 'Murfreesboro',
        state: 'TN',
        zipCode: '37129'
      },
      phone: '629-335-3077',
      email: 'murfreesboro@heavy-llc.com'
    },
    location: {
      latitude: 35.8631,
      longitude: -86.3917
    }
  },
  {
    id: 'br-pen',
    name: 'Pensacola Branch',
    code: 'PEN',
    divisionId: 'div-al',
    status: 'active',
    manager: 'jbarber@heavy-llc.com',
    contact: {
      address: {
        street: '564 W. Burgess',
        city: 'Pensacola',
        state: 'FL',
        zipCode: '32503'
      },
      phone: '850-206-1291',
      email: 'pensacola@heavy-llc.com'
    },
    location: {
      latitude: 30.4213,
      longitude: -87.2169
    }
  },
  {
    id: 'br-shr',
    name: 'Shreveport Branch',
    code: 'SHR',
    divisionId: 'div-la',
    status: 'active',
    manager: 'mmurphy@heavy-llc.com',
    contact: {
      address: {
        street: '5200 Hollywood',
        city: 'Shreveport',
        state: 'LA',
        zipCode: '71109'
      },
      phone: '318-621-0854',
      email: 'shreveport@heavy-llc.com'
    },
    location: {
      latitude: 32.4539,
      longitude: -93.7901
    }
  }
];

const users: HMUser[] = [
  // Organization Admins
  {
    email: 'cash@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Carl Ash',
    roles: ['orgAdmin'],
    permissions: ['organization.*']
  },
  {
    email: 'ssmith@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Steve Smith',
    roles: ['orgAdmin'],
    permissions: ['organization.*']
  },
  {
    email: 'ehinshaw@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Eric Hinshaw',
    roles: ['orgAdmin'],
    permissions: ['organization.*']
  },
  {
    email: 'cfrazier@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Chris Frazier',
    roles: ['orgAdmin'],
    permissions: ['organization.*']
  },
  {
    email: 'mhenry@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Matthew Henry',
    roles: ['orgAdmin'],
    permissions: ['organization.*']
  },

  // Division Managers
  {
    email: 'askuropat@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Alex Skuropat',
    roles: ['divisionAdmin'],
    permissions: ['division.*'],
    divisionId: 'div-al'
  },
  {
    email: 'asobolak@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Andy Sobolak',
    roles: ['divisionAdmin'],
    permissions: ['division.*'],
    divisionId: 'div-ga'
  },
  {
    email: 'klancaster@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Kevin Lancaster',
    roles: ['divisionAdmin'],
    permissions: ['division.*'],
    divisionId: 'div-tn'
  },
  {
    email: 'smoody@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Scott Moody',
    roles: ['divisionAdmin'],
    permissions: ['division.*'],
    divisionId: 'div-la'
  },

  // Branch Admins
  {
    email: 'jjernigan@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Jeff Jernigan',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-al',
    branchId: 'br-bir'
  },
  {
    email: 'jtaylor@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Jason Taylor',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-ga',
    branchId: 'br-cov'
  },
  {
    email: 'kfollmann@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Karen Follmann',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-al',
    branchId: 'br-dec'
  },
  {
    email: 'mroberts@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Mark Roberts',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-tn',
    branchId: 'br-gray'
  },
  {
    email: 'jbarber@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Joe Barber',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-al',
    branchId: 'br-mob'
  },
  {
    email: 'rthielen@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Russ Thielen',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-tn',
    branchId: 'br-mur'
  },
  {
    email: 'mmurphy@heavy-llc.com',
    password: 'ChangeMe123!',
    displayName: 'Matt Murphy',
    roles: ['branchAdmin'],
    permissions: ['branch.*'],
    divisionId: 'div-la',
    branchId: 'br-shr'
  }
];

const representatives: HMRepresentative[] = [
  // Birmingham Representatives
  {
    id: 'rep-bir-001',
    name: 'Brandon Stiffler',
    code: 'BS001',
    branchId: 'br-bir',
    type: 'system-user',
    status: 'active',
    email: 'bstiffler@heavy-llc.com',
    contact: {
      phone: '1(844) 344-8658',
      mobile: '205-847-8530',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Rental Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-bir-002',
    name: 'Chase Bryant',
    code: 'CB001',
    branchId: 'br-bir',
    type: 'system-user',
    status: 'active',
    email: 'cbryant@heavy-llc.com',
    contact: {
      phone: '1(844) 344-8658',
      mobile: '205-864-2623',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  },

  // Covington Representatives
  {
    id: 'rep-cov-001',
    name: 'Trent Cagle',
    code: 'TC001',
    branchId: 'br-cov',
    type: 'system-user',
    status: 'active',
    email: 'tcagle@heavy-llc.com',
    contact: {
      phone: '1(844) 532-1110',
      mobile: '770-324-0340',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-cov-002',
    name: 'Douglas Matthews',
    code: 'DM001',
    branchId: 'br-cov',
    type: 'system-user',
    status: 'active',
    email: 'jmatthews@heavy-llc.com',
    contact: {
      phone: '1(844) 532-1110',
      mobile: '770-328-3548',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Sales Representative',
      department: 'Sales'
    }
  },

  // Decatur Representatives
  {
    id: 'rep-dec-001',
    name: 'Nathan George',
    code: 'NG001',
    branchId: 'br-dec',
    type: 'system-user',
    status: 'active',
    email: 'ngeorge@heavy-llc.com',
    contact: {
      phone: '1(844) 309-1143',
      mobile: '256-914-3865',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Sales Rental Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-dec-002',
    name: 'Vaden Mills',
    code: 'VM001',
    branchId: 'br-dec',
    type: 'system-user',
    status: 'active',
    email: 'vmills@heavy-llc.com',
    contact: {
      phone: '1(844) 309-1143',
      mobile: '901-427-4248',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  },

  // Gray Representatives
  {
    id: 'rep-gray-001',
    name: 'Danny Meador',
    code: 'DM002',
    branchId: 'br-gray',
    type: 'system-user',
    status: 'active',
    email: 'dmeador@heavy-llc.com',
    contact: {
      phone: '1(855) 201-7453',
      mobile: '423-914-7274',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Customer Support Manager',
      department: 'Customer Support'
    }
  },
  {
    id: 'rep-gray-002',
    name: 'Jake Roberts',
    code: 'JR001',
    branchId: 'br-gray',
    type: 'system-user',
    status: 'active',
    email: 'jroberts@heavy-llc.com',
    contact: {
      phone: '1(855) 201-7453',
      mobile: '423-576-2747',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Sales / Rental Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-gray-003',
    name: 'Warren Legg',
    code: 'WL001',
    branchId: 'br-gray',
    type: 'system-user',
    status: 'active',
    email: 'wlegg@heavy-llc.com',
    contact: {
      phone: '1(855) 201-7453',
      mobile: '865-206-5618',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  },

  // Memphis Representatives
  {
    id: 'rep-mem-001',
    name: 'Adam York',
    code: 'AY001',
    branchId: 'br-mem',
    type: 'system-user',
    status: 'active',
    email: 'ayork@heavy-llc.com',
    contact: {
      phone: '1-888-366-9028',
      mobile: '901-302-0325',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Rental / Sales Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-mem-002',
    name: 'Jared Ross',
    code: 'JR002',
    branchId: 'br-mem',
    type: 'system-user',
    status: 'active',
    email: 'jross@heavy-llc.com',
    contact: {
      phone: '1-888-366-9028',
      mobile: '662-357-8224',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Sales Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-mem-003',
    name: 'Dylan Skelton',
    code: 'DS001',
    branchId: 'br-mem',
    type: 'system-user',
    status: 'active',
    email: 'dskelton@heavy-llc.com',
    contact: {
      phone: '1-888-366-9028',
      mobile: '901-568-3372',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'West Tennessee Sales Representative',
      department: 'Sales'
    }
  },

  // Mobile Representatives
  {
    id: 'rep-mob-001',
    name: 'Zach Waltman',
    code: 'ZW001',
    branchId: 'br-mob',
    type: 'system-user',
    status: 'active',
    email: 'zwaltman@heavy-llc.com',
    contact: {
      phone: '1(844) 891-6480',
      mobile: '251-753-9293',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Sales / Rental Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-mob-002',
    name: 'Alex Skuropat',
    code: 'AS001',
    branchId: 'br-mob',
    type: 'system-user',
    status: 'active',
    email: 'askuropat@heavy-llc.com',
    contact: {
      phone: '1(844) 891-6480',
      mobile: '251-272-0255',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Manager',
      department: 'Sales'
    }
  },

  // Murfreesboro Representatives
  {
    id: 'rep-mur-001',
    name: 'Miguel Bustos',
    code: 'MB001',
    branchId: 'br-mur',
    type: 'system-user',
    status: 'active',
    email: 'mbustos@heavy-llc.com',
    contact: {
      phone: '1(877) 200-5654',
      preferredContactMethod: 'phone'
    },
    personalInfo: {
      title: 'Compact Equipment Sales Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-mur-002',
    name: 'Gary Williams',
    code: 'GW001',
    branchId: 'br-mur',
    type: 'system-user',
    status: 'active',
    email: 'gwilliams@heavy-llc.com',
    contact: {
      phone: '1(877) 200-5654',
      mobile: '615-767-0900',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  },

  // Pensacola Representatives
  {
    id: 'rep-pen-001',
    name: 'Mitchell Moore',
    code: 'MM001',
    branchId: 'br-pen',
    type: 'system-user',
    status: 'active',
    email: 'mmoore@heavy-llc.com',
    contact: {
      phone: '1(833) 778-0810',
      mobile: '(850) 206-0723',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Rental Representative',
      department: 'Sales'
    }
  },

  // Shreveport Representatives
  {
    id: 'rep-shr-001',
    name: 'Brett Havener',
    code: 'BH001',
    branchId: 'br-shr',
    type: 'system-user',
    status: 'active',
    email: 'bhavener@heavy-llc.com',
    contact: {
      phone: '1(800) 548-3458',
      mobile: '318-402-9548',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Utility Sales Representative',
      department: 'Sales'
    }
  },
  {
    id: 'rep-shr-002',
    name: 'Scott Moody',
    code: 'SM001',
    branchId: 'br-shr',
    type: 'system-user',
    status: 'active',
    email: 'smoody@heavy-llc.com',
    contact: {
      phone: '1(800) 548-3458',
      mobile: '318-455-1527',
      preferredContactMethod: 'mobile'
    },
    personalInfo: {
      title: 'Regional Sales Representative',
      department: 'Sales'
    }
  }
];

// Setup Functions
async function createHeavyMachinesTenant() {
  console.log('Creating Heavy Machines tenant...');

  const tenantRef = db.collection('tenants').doc(TENANT_ID);
  await tenantRef.set({
    id: TENANT_ID,
    name: TENANT_NAME,
    billing: {
      type: 'legacy',
      legacyAccess: {
        reason: 'enterprise_customer',
        plan: 'enterprise'
      }
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      currentPeriodEnd: '2099-12-31T23:59:59.999Z',
      trialEnding: false,
      trialEndDate: null,
      trialStartDate: null
    },
    features: {
      // Enterprise plan has access to all features
      enableAdvancedMapping: true,      // Professional+
      enableAnalytics: true,            // Professional+
      enableCustomBoundaries: true,     // Enterprise only
      enableTeamManagement: true,       // Professional+
      enableApiAccess: true,            // Enterprise only
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
      enableOfflineMode: true
    },
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

  console.log(`Created tenant: ${TENANT_ID}`);
}

async function createDivisions() {
  for (const division of divisions) {
    await db.collection('tenants').doc(TENANT_ID)
      .collection('divisions').doc(division.id).set({
        ...division,
        metadata: {
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
          createdBy: 'system',
          updatedBy: 'system'
        }
      });
  }
}

async function createBranches() {
  for (const branch of branches) {
    await db.collection('tenants').doc(TENANT_ID)
      .collection('branches').doc(branch.id).set({
        ...branch,
        metadata: {
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
          createdBy: 'system',
          updatedBy: 'system'
        }
      });
  }
}

async function createUsers() {
  console.log('Creating users...');

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
        tenantId: TENANT_ID,
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
      if (user.roles.includes('orgAdmin')) {
        userData.platformRole = 'orgAdmin';
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
      const tenantUserRef = db.collection('tenants').doc(TENANT_ID)
        .collection('users').doc(userRecord.uid);
      await tenantUserRef.set(userData);

      console.log(`Created/Updated user: ${user.email}`);
    } catch (error) {
      console.error(`Error creating/updating user ${user.email}:`, error);
    }
  }
}

async function createRepresentatives() {
  for (const rep of representatives) {
    await db.collection('tenants').doc(TENANT_ID)
      .collection('representatives').doc(rep.id).set({
        ...rep,
        metadata: {
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
          createdBy: 'system',
          updatedBy: 'system'
        }
      });
  }
}

async function setupHeavyMachines() {
  try {
    console.log('Starting Heavy Machines setup...');

    // Create tenant
    await createHeavyMachinesTenant();
    console.log('Created tenant');

    // Create divisions
    await createDivisions();
    console.log('Created divisions');

    // Create branches
    await createBranches();
    console.log('Created branches');

    // Create users
    await createUsers();
    console.log('Created users');

    // Create representatives
    await createRepresentatives();
    console.log('Created representatives');

    console.log('Heavy Machines setup complete!');
  } catch (error) {
    console.error('Error setting up Heavy Machines:', error);
  }
}

// Run the setup
setupHeavyMachines();

export {
  TENANT_ID,
  TENANT_NAME,
  divisions,
  branches,
  users,
  representatives
};