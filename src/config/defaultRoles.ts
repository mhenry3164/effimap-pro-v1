import { Role } from '../types/rbac';

export const defaultRoles: Role[] = [
  {
    id: 'platformAdmin',
    name: 'Platform Administrator',
    description: 'Full platform access with all permissions',
    type: 'platform',
    permissions: [{
      resource: '*',
      action: '*'
    }]
  },
  {
    id: 'supportAdmin',
    name: 'Support Administrator',
    description: 'Platform support access',
    type: 'platform',
    permissions: [
      {
        resource: 'organization',
        action: 'read'
      },
      {
        resource: 'user',
        action: 'read'
      },
      {
        resource: 'report',
        action: 'read'
      }
    ]
  },
  {
    id: 'orgAdmin',
    name: 'Organization Administrator',
    description: 'Full organization access',
    type: 'organization',
    permissions: [
      {
        resource: 'organization',
        action: 'manage'
      },
      {
        resource: 'division',
        action: 'manage'
      },
      {
        resource: 'branch',
        action: 'manage'
      },
      {
        resource: 'territory',
        action: 'manage'
      },
      {
        resource: 'user',
        action: 'manage'
      },
      {
        resource: 'report',
        action: 'manage'
      }
    ]
  },
  {
    id: 'divisionAdmin',
    name: 'Division Administrator',
    description: 'Division-level access',
    type: 'organization',
    inherits: ['branchAdmin'],
    permissions: [
      {
        resource: 'division',
        action: 'manage',
        conditions: {
          divisionId: '{divisionId}'  // Will be replaced with actual divisionId
        }
      },
      {
        resource: 'branch',
        action: 'manage',
        conditions: {
          divisionId: '{divisionId}'
        }
      },
      {
        resource: 'territory',
        action: 'manage',
        conditions: {
          divisionId: '{divisionId}'
        }
      },
      {
        resource: 'user',
        action: 'read'
      },
      {
        resource: 'report',
        action: 'read'
      }
    ]
  },
  {
    id: 'branchAdmin',
    name: 'Branch Administrator',
    description: 'Branch-level access',
    type: 'organization',
    inherits: ['territoryManager'],
    permissions: [
      {
        resource: 'branch',
        action: 'manage',
        conditions: {
          branchId: '{branchId}'
        }
      },
      {
        resource: 'territory',
        action: 'manage',
        conditions: {
          branchId: '{branchId}'
        }
      },
      {
        resource: 'user',
        action: 'read'
      },
      {
        resource: 'report',
        action: 'read'
      }
    ]
  },
  {
    id: 'territoryManager',
    name: 'Territory Manager',
    description: 'Territory management access',
    type: 'organization',
    permissions: [
      {
        resource: 'territory',
        action: 'manage',
        conditions: {
          ownOnly: true
        }
      },
      {
        resource: 'report',
        action: 'read',
        conditions: {
          ownOnly: true
        }
      }
    ]
  },
  {
    id: 'salesRepresentative',
    name: 'Sales Representative',
    description: 'Basic sales access',
    type: 'organization',
    permissions: [
      {
        resource: 'territory',
        action: 'read',
        conditions: {
          ownOnly: true
        }
      },
      {
        resource: 'report',
        action: 'read',
        conditions: {
          ownOnly: true
        }
      }
    ]
  }
];
