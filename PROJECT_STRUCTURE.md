# EffiMap Pro V1 Project Structure

## Overview
This document provides a comprehensive overview of the EffiMap Pro V1 project structure, including multi-tenant architecture, file organization, key components, and architectural decisions.

## Project Organization

### Root Structure
```
EffiMap_Pro_V1/
├── config/               # Configuration files
│   ├── env/             # Environment configurations
│   ├── firebase/        # Firebase configurations
│   ├── typescript/      # TypeScript configurations
│   └── build/           # Build tool configurations
├── data/                # Data files
│   ├── geojson/        # Geographic data
│   └── seeds/          # Database seed data
├── scripts/             # Utility scripts
│   ├── build/          # Build scripts
│   ├── deploy/         # Deployment scripts
│   ├── data/           # Data processing
│   └── dev/            # Development utilities
├── src/                # Source code
└── public/             # Static assets
```

### Source Code Organization
```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   │   ├── Form.tsx
│   │   └── Wrapper.tsx
│   ├── map/           # Map-related components
│   │   ├── Map.tsx
│   │   ├── Controls.tsx
│   │   ├── Toolbar.tsx
│   │   └── DrawingTools.tsx
│   ├── territory/     # Territory management
│   │   ├── Drawer.tsx
│   │   ├── Editor.tsx
│   │   └── Form.tsx
│   ├── management/    # Admin components
│   │   ├── Panel.tsx
│   │   ├── BranchForm.tsx
│   │   └── RepresentativeForm.tsx
│   ├── shared/        # Shared components
│   │   ├── LoadingScreen.tsx
│   │   └── ErrorBoundary.tsx
│   └── ui/            # UI components
├── providers/         # Context providers
│   ├── TenantProvider.tsx
│   └── AuthProvider.tsx
├── services/         # Business logic
│   ├── tenantService.ts
│   ├── adminService.ts
│   └── boundaryService.ts
├── types/           # TypeScript types
│   ├── tenantTypes.ts
│   ├── userTypes.ts
│   └── mapTypes.ts
├── utils/           # Utility functions
│   ├── tenantUtils.ts
│   └── mapUtils.ts
└── assets/         # Static assets
```

## Multi-Tenant Architecture

### Tenant Data Structure
```
tenants/
├── [tenantId]/
│   ├── config/
│   │   ├── features
│   │   └── settings
│   ├── divisions/
│   │   └── [divisionId]/
│   │       └── branches/
│   │           └── [branchId]/
│   └── territories/
│       └── [territoryId]/
```

### Role Hierarchy
```
Platform Admin
└── Organization Admin
    └── Division Admin
        └── Branch Admin
            └── Territory Manager
```

## Key Components

### Tenant Management
- TenantProvider: Central tenant context
- TenantService: Data operations
- Role-based access control
- Feature flag system

### Authentication System
- Firebase Authentication
- Custom claims for roles
- Session management
- Permission validation

### Territory Management
- Multi-level organization structure
- Boundary management
- Assignment system
- Access control

## Configuration

### Environment Variables
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

### Feature Flags
```typescript
interface FeatureFlags {
  enableAdvancedMapping: boolean;
  enableAnalytics: boolean;
  enableCustomBoundaries: boolean;
  enableTeamManagement: boolean;
  enableApiAccess: boolean;
}
```

### Tenant Settings
```typescript
interface TenantSettings {
  mapDefaults: {
    center: [number, number];
    zoom: number;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
  api: {
    rateLimit: number;
  };
}
```

## Security Considerations

### Authentication
- Firebase Authentication
- Custom claims for roles
- Session management

### Authorization
- Role-based access control
- Permission validation
- Tenant isolation

### Data Security
- Firestore security rules
- Data validation
- Rate limiting

## Development Guidelines

### Code Organization
- Feature-based component structure
- Shared utilities and hooks
- Type-safe implementations

### State Management
- React Context for global state
- Local state for component-specific data
- Proper error handling

### Testing
- Unit tests for utilities
- Integration tests for components
- End-to-end testing for critical flows
