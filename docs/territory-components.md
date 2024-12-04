# Territory Components Structure

## Component Organization
All territory components are correctly located in `/src/components/territory/`:

1. **Core Components**:
   - `TerritoryDrawer.tsx`: Main territory creation/editing interface
   - `TerritoryEditor.tsx`: Territory boundary editing component
   - `TerritoryForm.tsx`: Form for territory metadata
   - `TerritoryLayer.tsx`: Map visualization layer
   - `TerritoryList.tsx`: Territory listing and management
   - `TerritoryPolygon.tsx`: Individual territory polygon component
   - `index.ts`: Component exports

## Routing Structure

### 1. Organization Admin Routes
```typescript
/map                  -> <Map />
```

### 2. Division Manager Routes
```typescript
/territories         -> <Map />
```

### 3. Branch Manager Routes
```typescript
/territories         -> <Map />
```

### 4. Representative Routes
```typescript
/my-territory       -> <Map />
```

## Component Dependencies

### TerritoryDrawer
- Dependencies:
  - TerritoryForm
  - Google Maps API
  - Territory Service
  - Store (useStore)

### TerritoryEditor
- Dependencies:
  - Google Maps API
  - Territory Types
  - Material UI Components

### TerritoryForm
- Dependencies:
  - Branch Service
  - Representative Service
  - UI Components (Input, Label, Select)
  - Toast Notifications

### TerritoryLayer
- Dependencies:
  - Google Maps API
  - Territory Service
  - Branch Service
  - Representative Service
  - Map Context

### TerritoryList
- Dependencies:
  - Territory Service
  - Navigation
  - UI Components
  - Feature Gates

## Access Control

### Role-Based Access
1. **Platform Admin**:
   - Full access to all territory operations

2. **Organization Admin**:
   - Can manage all territories within the organization
   - Access via `/map`

3. **Division Admin**:
   - Can manage territories within their division
   - Access via `/territories`

4. **Branch Admin**:
   - Can manage territories within their branch
   - Access via `/territories`

5. **Representative**:
   - Can view and interact with assigned territory
   - Access via `/my-territory`

## Service Integration

### Territory Service Methods
- `getAll`: Fetch all territories for tenant
- `getById`: Get specific territory
- `create`: Create new territory
- `update`: Update existing territory
- `delete`: Remove territory

### Data Flow
1. Territory creation/editing:
   ```
   TerritoryForm -> TerritoryService -> Firestore -> TerritoryLayer
   ```

2. Territory visualization:
   ```
   TerritoryLayer -> MapContext -> Google Maps -> TerritoryPolygon
   ```

## Suggested Improvements

1. **Route Consolidation**:
   - Consider unifying `/map`, `/territories`, and `/my-territory` under a single route with role-based filtering
   - Add sub-routes for specific operations (e.g., `/territories/:id/edit`)

2. **Component Optimization**:
   - Move map-related logic to a dedicated hook
   - Create a territory context for better state management
   - Add loading states and error boundaries

3. **Access Control**:
   - Implement territory-specific permissions
   - Add validation for cross-branch operations
   - Enhance audit logging for territory changes
