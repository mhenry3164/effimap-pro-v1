# Heatmap Layer Management Improvements

## Current Issues
1. UI Layout and Scrolling
   - Components expand beyond screen bounds
   - No scrolling capability
   - Fixed drag-and-drop box at top of screen

2. Data Management
   - No proper deletion of layers from Firestore
   - Layers require manual activation
   - Inefficient layer loading process

## Implementation Plan

### 1. UI Layout Structure
```tsx
<Box className="flex h-full overflow-hidden">
  {/* Left Panel - Fixed Width */}
  <Box className="w-96 h-full flex flex-col overflow-hidden">
    {/* Layer Management Section */}
    <Box className="p-4 bg-white shadow">
      <AddLayerButton />
    </Box>
    
    {/* Layers List - Scrollable */}
    <Box className="flex-1 overflow-auto p-4">
      <HeatMapLayersList />
    </Box>
  </Box>

  {/* Map Area - Flexible Width */}
  <Box className="flex-1 relative">
    <Map />
  </Box>
</Box>
```

### 2. New Components
1. **AddLayerModal**
   - Dedicated modal for adding new heatmap layers
   - Drag and drop functionality
   - Layer naming and configuration
   - Improved error handling and validation

2. **HeatMapLayersList Improvements**
   - Proper deletion functionality
   - Better state management
   - Enhanced UI feedback

### 3. Data Management
```typescript
// Proper layer deletion
const deleteLayer = async (layerId: string) => {
  if (!user?.tenantId) return;
  try {
    removeHeatMapLayer(layerId);
    await heatMapService.deleteDataset(user.tenantId, layerId);
  } catch (error) {
    addHeatMapLayer(layer);
    console.error('Error deleting dataset:', error);
  }
};

// Auto-load layers
useEffect(() => {
  const loadLayers = async () => {
    if (!user?.tenantId) return;
    const layers = await heatMapService.getLayers(user.tenantId);
    layers.forEach(layer => addHeatMapLayer(layer));
  };
  loadLayers();
}, [user?.tenantId]);
```

## Implementation Steps
1. Create new AddLayerModal component
2. Update AdvancedMapping layout
3. Implement proper layer deletion
4. Add auto-loading of layers
5. Enhance error handling and user feedback

## Notes
- Keep all changes isolated to heatmap functionality
- Maintain existing component interfaces
- Ensure backward compatibility
- Add proper error handling and loading states
