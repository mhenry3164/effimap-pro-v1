# EffiMap Pro V1 - UI Migration Plan

## Overview
The UI migration strategy has been updated to leverage shadcn/ui, a collection of reusable components built on Radix UI primitives with Tailwind CSS styling. This approach allows us to maintain our current blended system while gradually introducing more standardized, customizable components.

## Current State
- Existing Tailwind configuration with custom design tokens
- Mix of Radix UI components and custom implementations
- MUI components in specific sections

## Migration Strategy

### Phase 1: Setup and Configuration
1. **Environment Setup**
   - Configure path aliases in tsconfig.json and vite.config.ts
   - Update tailwind configuration for shadcn/ui compatibility
   - Initialize shadcn/ui with project-specific settings

2. **Design Token Alignment**
   ```javascript
   // Maintain existing color scheme
   colors: {
     primary: {
       DEFAULT: '#003f88',
       dark: '#002855',
       light: '#0056b3',
     },
     secondary: {
       DEFAULT: '#f68b24',
       dark: '#e67d16',
       light: '#ff9f43',
     }
   }
   ```

### Phase 2: Component Migration
1. **Priority Components**
   - Checkbox
   - Label
   - Switch
   - Select
   - Slider
   - Tooltip

2. **Migration Process**
   ```bash
   # Example component addition
   npx shadcn@latest add [component-name]
   ```

3. **Component Customization**
   - Adapt shadcn/ui components to match existing design system
   - Maintain current functionality while improving consistency

### Phase 3: Implementation Strategy

1. **Map Components**
   - Keep existing map-specific styling
   - Gradually integrate shadcn/ui components for controls
   - Maintain specialized map.css for Google Maps integration

2. **Form Components**
   - Replace current Radix UI implementations with shadcn/ui equivalents
   - Ensure form validation and state management compatibility

3. **Administrative Interfaces**
   - Migrate user management components
   - Update settings panels with new component system

## Component Usage Matrix

| Component    | Current Location           | Migration Path                    |
|-------------|---------------------------|----------------------------------|
| Checkbox    | UserManagement, Map       | shadcn/ui Checkbox              |
| Label       | Forms, Input fields       | shadcn/ui Label                 |
| Switch      | Settings panels           | shadcn/ui Switch                |
| Select      | Forms, Filters            | shadcn/ui Select                |
| Slider      | Map controls              | shadcn/ui Slider                |
| Tooltip     | UI elements               | shadcn/ui Tooltip               |

## Style Management

### Retained Systems
1. **Tailwind CSS**
   - Layout utilities
   - Global styles
   - Custom utilities

2. **Map-Specific Styles**
   - Maintain separate map.css
   - Google Maps custom styling

3. **MUI Components**
   - Gradually phase out as shadcn/ui components are implemented
   - Maintain during transition period

## Technical Implementation

### Directory Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── map/         # Map-specific components
│   └── custom/      # Custom components
├── styles/
│   ├── index.css    # Global styles + Tailwind
│   └── map.css      # Map-specific styles
└── theme/           # Theme configuration
```

### Configuration Files
1. **components.json**
   - shadcn/ui component configuration
   - Style preferences
   - Color scheme settings

2. **tailwind.config.js**
   - Extended theme configuration
   - Custom color palette
   - Typography settings

## Migration Phases

### Phase 1: Foundation (Current)
- [x] Audit existing components
- [x] Document component usage
- [ ] Configure shadcn/ui
- [ ] Update build configuration

### Phase 2: Component Migration
- [ ] Install base shadcn/ui components
- [ ] Customize components to match design system
- [ ] Create migration examples

### Phase 3: Implementation
- [ ] Migrate form components
- [ ] Update administrative interfaces
- [ ] Refactor map controls

### Phase 4: Cleanup
- [ ] Remove unused Radix UI dependencies
- [ ] Clean up legacy styles
- [ ] Update documentation

## Testing Strategy
1. Visual regression testing
2. Component-level unit tests
3. Integration testing
4. Accessibility testing

## Performance Considerations
- Bundle size optimization
- Code splitting
- Style sheet management

## Accessibility
- Maintain ARIA attributes
- Keyboard navigation
- Screen reader compatibility

## Next Steps
1. Initialize shadcn/ui in the project
2. Create component migration templates
3. Begin systematic component replacement
4. Update documentation as components are migrated

## Notes
- Maintain existing functionality during migration
- Ensure backward compatibility
- Document any breaking changes
- Consider performance implications

This plan will be updated as the migration progresses and new requirements are identified.
