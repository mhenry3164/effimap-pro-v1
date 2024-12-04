# Component Migration and Consolidation Plan

## File Moves

### Contact Components
- **Source**: 
  - `/src/components/ContactForm.tsx`
  - `/src/components/ContactModal.tsx`
- **Destination**: `/src/shared/components/`
- **Impact**:
  - Import paths in any components using these will need updating
  - Check for any direct references to these components in routing
  - Review any associated styles or context dependencies

### Territory Management
- **Source**: `/src/territories/*`
- **Destination**: `/src/territory/`
- **Impact**:
  - Update all import paths referencing territory components
  - Review and update any territory-specific routing
  - Check for territory-specific services that may need path updates
  - Verify territory-related state management still functions

### Common Directory Consolidation
- **Source**: `/src/common/*`
- **Destination**: `/src/shared/`
- **Impact**:
  - Update all common utility imports throughout the application
  - Review any shared types or interfaces that might need path updates
  - Check for any circular dependencies that might arise

## Next Steps After Moves
1. Review and update all import statements
2. Test all affected routes
3. Verify component rendering
4. Update any relevant test files
5. Check build process for any path-related issues

## Post-Migration Verification Checklist
- [ ] All imports are correctly updated
- [ ] No broken routes
- [ ] Components render correctly
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] Application functions as expected

## Rollback Plan
In case of issues:
1. Revert file moves
2. Restore original import paths
3. Clear any cached builds
4. Rebuild application
