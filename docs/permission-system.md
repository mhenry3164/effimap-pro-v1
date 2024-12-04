# EffiMap Pro Permission System

## Current Implementation

The application currently employs a dual-layer permission system:

### 1. Role-Based Access Control (RBAC)
The core RBAC system handles fundamental data access and security at the database level.

#### Key Components:
- **Location**: `src/services/rbac.ts`
- **Purpose**: Controls database-level access and core operations
- **Storage**: Roles and permissions stored in Firestore
- **Actions**: Basic CRUD operations (create, read, update, delete)

#### Default Roles:
- **Platform Administrator**: Full platform access
- **Support Administrator**: Read-only platform access
- **Organization Administrator**: Full organization access
- **Division Administrator**: Division-level access
- **Territory Manager**: Territory management access
- **Sales Representative**: Basic sales access

### 2. Feature-Based Permissions
A higher-level system for controlling access to specific UI features and business logic.

#### Key Components:
- **Location**: `src/hooks/useRBAC.ts`
- **Current Implementation**: Simple role-based check
  ```typescript
  // Current logic:
  - Platform admins have all permissions
  - Organization admins have all tenant permissions
  - Legacy enterprise org admins have all permissions
  - Other users have no permissions by default
  ```

#### Usage Example:
```typescript
const { hasPermission } = useRBAC();
if (hasPermission({ resource: 'users', action: 'invite' })) {
  // Show invite user button
}
```

## Proposed Enhancements

### 1. Granular Feature Permission System

#### Firestore Schema
```
/tenants/{tenantId}/permissions/{permissionId}
```

#### Permission Document Structure
```typescript
interface FeaturePermission {
  resource: string;        // Feature category
  action: string;         // Specific action
  roles: string[];        // Allowed roles
  description: string;    // Human-readable description
  enabled: boolean;       // Toggle for org admins
}
```

### 2. Enhanced Permission Management

#### For Organization Administrators
- UI to manage feature permissions
- Ability to toggle features per role
- Permission audit capabilities
- Role-feature matrix view

#### Technical Implementation
- Cache permissions for performance
- Real-time updates using Firestore listeners
- Hierarchical permission inheritance
- Audit logging for permission changes

### 3. Future Considerations

#### Security
- Maintain RBAC as the foundation for data security
- Feature permissions as an additional layer
- Prevent permission escalation
- Regular security audits

#### Scalability
- Permission caching strategy
- Batch permission updates
- Performance monitoring
- Rate limiting for permission checks

#### User Experience
- Clear permission error messages
- Permission-aware UI components
- Role-based navigation
- Permission request workflow

## Migration Path

1. **Phase 1**: Document current permissions
2. **Phase 2**: Implement Firestore schema
3. **Phase 3**: Enhance useRBAC hook
4. **Phase 4**: Create admin UI
5. **Phase 5**: Migrate existing features

## Best Practices

1. Always use RBAC for data security
2. Use feature permissions for UI/UX control
3. Document all permissions
4. Regular permission audits
5. Monitor permission performance
