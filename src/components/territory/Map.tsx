import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useStore } from '../../store';
import { useMap } from '../../contexts/MapContext';
import { googleMapsConfig, getMapOptions, getFeatureStyle } from '../../config/googleMaps';
import LoadingScreen from '../shared/LoadingScreen';
import TerritoryLayer from './TerritoryLayer';
import TerritoryEditor from './TerritoryEditor';
import { territoryService } from '../../services/territoryService';
import { activityService } from '../../services/activityService';
import { Pencil, Trash, Palette, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTerritoryDetails } from '../../hooks/useTerritoryDetails';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColorPicker } from '../ui/color-picker';
import { TerritoryForm } from './TerritoryForm';
import { HeatMapLayer } from '../map/HeatMapLayer';  // Add this import
import { 
  Territory, 
  TerritoryPoint, 
  TerritoryStyle, 
  TerritoryUpdate, 
  NewTerritory 
} from '../../types/territory';
import { Timestamp } from 'firebase/firestore';

declare global {
  interface Window {
    google: typeof google;
  }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795
};

interface LayerRefs {
  state: google.maps.FeatureLayer | null;
  county: google.maps.FeatureLayer | null;
  zip: google.maps.FeatureLayer | null;
}

export const Map: React.FC = () => {
  // Initialize hooks first
  const { user } = useAuth();
  const { isLoaded, loadError } = useJsApiLoader(googleMapsConfig);
  const {
    selectedTerritory,
    territories: storeTerritories
  } = useStore();
  const {
    stateLayerVisible,
    countyLayerVisible,
    zipLayerVisible,
    isDrawingMode,
    setIsDrawingMode,
    heatMapLayerVisible,  // Add this
    heatMapData           // Add this
  } = useMap();

  // Initialize state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritoryState, setSelectedTerritoryState] = useState<Territory | null>(selectedTerritory);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drawnShape, setDrawnShape] = useState<google.maps.Polygon | null>(null);
  const [newTerritory, setNewTerritory] = useState<{
    boundary: {
      type: string;
      coordinates: TerritoryPoint[];
      style: TerritoryStyle;
    };
  } | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [territoryStyle, setTerritoryStyle] = useState<TerritoryStyle>({
    fillColor: '#FF0000',
    strokeColor: '#FF0000',
    fillOpacity: 0.35,
    strokeOpacity: 0.8,
    strokeWeight: 2
  });

  // Layer refs
  const layersRef = useRef<LayerRefs>({
    state: null,
    county: null,
    zip: null
  });

  // Initialize dependent hooks
  const { details: territoryDetails, isLoading: detailsLoading } = useTerritoryDetails(selectedTerritoryState);

  // Effect to sync territories with store
  useEffect(() => {
    if (storeTerritories) {
      setTerritories(storeTerritories);
    }
  }, [storeTerritories]);

  // Effect to sync selected territory with store
  useEffect(() => {
    setSelectedTerritoryState(selectedTerritory);
  }, [selectedTerritory]);

  // Effect to manage feature layers
  useEffect(() => {
    if (!map) return;

    // Check map capabilities
    const checkCapabilities = () => {
      const mapCapabilities = map.getMapCapabilities();
      if (!mapCapabilities.isDataDrivenStylingAvailable) {
        console.error('Data-driven styling is not available for this map');
        return false;
      }
      return true;
    };

    // Subscribe to capability changes
    const capabilitiesListener = map.addListener('mapcapabilities_changed', checkCapabilities);

    // Create layers if they don't exist
    if (!layersRef.current.state && stateLayerVisible) {
      try {
        const stateLayer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1' as const as google.maps.FeatureType);
        stateLayer.style = getFeatureStyle('state', stateLayerVisible);
        layersRef.current.state = stateLayer;
      } catch (error) {
        console.error('Error creating state layer:', error);
      }
    }

    if (!layersRef.current.county && countyLayerVisible) {
      try {
        const countyLayer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2' as const as google.maps.FeatureType);
        countyLayer.style = getFeatureStyle('county', countyLayerVisible);
        layersRef.current.county = countyLayer;
      } catch (error) {
        console.error('Error creating county layer:', error);
      }
    }

    if (!layersRef.current.zip && zipLayerVisible) {
      try {
        const zipLayer = map.getFeatureLayer('POSTAL_CODE' as const as google.maps.FeatureType);
        zipLayer.style = getFeatureStyle('zipcode', zipLayerVisible);
        layersRef.current.zip = zipLayer;
      } catch (error) {
        console.error('Error creating zip layer:', error);
      }
    }

    // Update layer visibility
    try {
      if (layersRef.current.state) {
        layersRef.current.state.style = getFeatureStyle('state', stateLayerVisible);
      }
      if (layersRef.current.county) {
        layersRef.current.county.style = getFeatureStyle('county', countyLayerVisible);
      }
      if (layersRef.current.zip) {
        layersRef.current.zip.style = getFeatureStyle('zipcode', zipLayerVisible);
      }
    } catch (error) {
      console.error('Error updating layer visibility:', error);
    }

    // Initial capability check
    checkCapabilities();

    // Cleanup
    return () => {
      try {
        if (layersRef.current.state) {
          layersRef.current.state.style = null;
          layersRef.current.state = null;
        }
        if (layersRef.current.county) {
          layersRef.current.county.style = null;
          layersRef.current.county = null;
        }
        if (layersRef.current.zip) {
          layersRef.current.zip.style = null;
          layersRef.current.zip = null;
        }
        window.google.maps.event.removeListener(capabilitiesListener);
      } catch (error) {
        console.error('Error cleaning up layers:', error);
      }
    };
  }, [map, stateLayerVisible, countyLayerVisible, zipLayerVisible]);

  // Handlers and effects below...

  const refreshTerritories = useCallback(async () => {
    if (user?.tenantId && map) {
      try {
        const fetchedTerritories = await territoryService.getAll(user.tenantId);
        setTerritories(fetchedTerritories);
      } catch (error) {
        console.error('Error fetching territories:', error);
        toast.error('Failed to refresh territories');
      }
    }
  }, [user?.tenantId, map]);

  const handleSaveTerritory = useCallback(
    async (territoryData: NewTerritory) => {
      try {
        if (!user?.tenantId) {
          toast.error('No tenant ID found');
          return;
        }

        if (!newTerritory?.boundary?.coordinates) {
          toast.error('No territory boundary defined');
          return;
        }

        // Prepare territory data
        const territory: Omit<Territory, 'id'> = {
          ...territoryData,
          boundary: {
            type: 'Polygon',
            coordinates: newTerritory.boundary.coordinates,
            style: territoryStyle
          },
          status: 'active',
          metadata: {
            version: 1,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: user.id || 'unknown',
            updatedBy: user.id || 'unknown'
          }
        };

        await territoryService.add(user.tenantId, territory);

        // Clear drawing state
        setNewTerritory(null);
        setIsDrawingMode(false);
        setShowEditor(false);
        if (drawnShape) {
          drawnShape.setMap(null);
          setDrawnShape(null);
        }

        // Refresh territories
        await refreshTerritories();

        toast.success('Territory created successfully');
      } catch (error) {
        console.error('Error creating territory:', error);
        toast.error('Failed to create territory');
      }
    },
    [user, newTerritory, territoryStyle, drawnShape, refreshTerritories, setIsDrawingMode]
  );

  const handleNewTerritoryClose = useCallback(() => {
    setNewTerritory(null);
    setIsDrawingMode(false);
    setShowEditor(false);
    if (drawnShape) {
      drawnShape.setMap(null);
      setDrawnShape(null);
    }
  }, [drawnShape, setIsDrawingMode]);

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const coordinates: TerritoryPoint[] = [];
      path.forEach((point, index) => {
        coordinates.push({ index, lat: point.lat(), lng: point.lng() });
      });

      setNewTerritory({
        boundary: {
          type: 'Polygon',
          coordinates: coordinates,
          style: territoryStyle
        }
      });

      // Keep the polygon visible for visualization
      setDrawnShape(polygon);
      setShowEditor(true);
    },
    [territoryStyle]
  );

  const handleTerritorySelect = useCallback(
    (territory: Territory | null) => {
      setSelectedTerritoryState(territory);
      setShowTooltip(true);

      // Position tooltip near bottom left of map
      if (map) {
        const mapDiv = map.getDiv();
        const bounds = mapDiv.getBoundingClientRect();
        setTooltipPosition({
          x: bounds.left + 20,
          y: bounds.bottom - 100
        });
      }
    },
    [map]
  );

  const handleEditStart = useCallback((territory: Territory) => {
    setSelectedTerritoryState(territory);
    setIsEditing(true);
  }, []);

  const handleEditClose = useCallback(() => {
    // Clean up editing state
    setIsEditing(false);
    setIsDrawingMode(false);
    if (drawnShape) {
      drawnShape.setMap(null);
      setDrawnShape(null);
    }
    
    // Force refresh the territory layer
    setTerritories(prev => [...prev]);
    
    // Reset selection state
    setSelectedTerritoryState(null);
    setShowTooltip(false);
  }, [drawnShape]);

  const handleEditSave = useCallback(
    async (editedTerritory: TerritoryUpdate) => {
      try {
        if (!user?.tenantId) {
          toast.error('No tenant ID found');
          return;
        }

        if (!editedTerritory.id) {
          toast.error('Territory ID is missing');
          return;
        }

        // Save the update
        await territoryService.update(user.tenantId, editedTerritory.id, editedTerritory);
        
        // Log the activity
        await activityService.logActivity({
          type: 'edit',
          entityType: 'territory',
          entityId: editedTerritory.id,
          entityName: editedTerritory.name || 'Unnamed Territory',
          userId: user.id,
          userName: user.displayName || 'Unknown User',
          tenantId: user.tenantId,
          details: {
            boundary: editedTerritory.boundary
          }
        });
        
        // Reset edit state and refresh
        setIsEditing(false);
        await refreshTerritories();
        
        toast.success('Territory updated successfully');
      } catch (error) {
        console.error('Error updating territory:', error);
        toast.error('Failed to update territory');
      }
    },
    [user?.tenantId, refreshTerritories]
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTerritoryState?.id || !user?.tenantId) return;

    try {
      await territoryService.delete(user.tenantId, selectedTerritoryState.id, user.id);

      // Clear UI state
      setShowDeleteConfirm(false);
      setSelectedTerritoryState(null);
      setShowTooltip(false);

      // Update territories list
      setTerritories((prev) => prev.filter((t) => t.id !== selectedTerritoryState.id));

      toast.success('Territory deleted successfully');
    } catch (error) {
      console.error('Error deleting territory:', error);
      toast.error('Failed to delete territory');
    }
  }, [selectedTerritoryState, user]);

  const handleStyleSave = useCallback(async () => {
    if (!selectedTerritoryState?.id || !user?.tenantId) return;

    try {
      const updatedTerritory: Territory = {
        ...selectedTerritoryState,
        boundary: {
          ...selectedTerritoryState.boundary,
          style: {
            ...territoryStyle
          }
        }
      };

      await territoryService.update(user.tenantId, selectedTerritoryState.id, updatedTerritory);
      setTerritories((prev) =>
        prev.map((t) => (t.id === selectedTerritoryState.id ? updatedTerritory : t))
      );
      setShowColorPicker(false);
      toast.success('Territory style updated');
    } catch (error) {
      console.error('Error updating territory style:', error);
      toast.error('Failed to update territory style');
    }
  }, [selectedTerritoryState, territoryStyle, user?.tenantId]);

  // Initialize drawing manager when drawing mode changes
  useEffect(() => {
    if (!map) return;

    // Create drawing manager
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: isDrawingMode ? window.google.maps.drawing.OverlayType.POLYGON : null,
      drawingControl: false,
      polygonOptions: {
        strokeColor: territoryStyle.strokeColor || '#000000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: territoryStyle.fillColor || '#FFFFFF',
        fillOpacity: territoryStyle.fillOpacity ?? 0.35,
        editable: true
      }
    });

    // Set the drawing manager on the map
    drawingManager.setMap(isDrawingMode ? map : null);

    // Add completion listeners
    if (isDrawingMode) {
      const polygonCompleteListener = window.google.maps.event.addListener(
        drawingManager,
        'polygoncomplete',
        (polygon: window.google.maps.Polygon) => {
          handlePolygonComplete(polygon);
          setIsDrawingMode(false);
          drawingManager.setDrawingMode(null);
        }
      );

      // Cleanup
      return () => {
        window.google.maps.event.removeListener(polygonCompleteListener);
        drawingManager.setMap(null);
      };
    }

    return () => {
      drawingManager.setMap(null);
    };
  }, [map, isDrawingMode, handlePolygonComplete, territoryStyle, setIsDrawingMode]);

  // Refresh territories when map is loaded or user changes
  useEffect(() => {
    refreshTerritories();
  }, [refreshTerritories, user?.tenantId]);

  const onLoad = useCallback((mapInstance: window.google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update territory style when selected territory changes
  useEffect(() => {
    if (selectedTerritoryState?.boundary?.style) {
      setTerritoryStyle({
        fillColor: selectedTerritoryState.boundary.style.fillColor || '#3B82F6',
        strokeColor: selectedTerritoryState.boundary.style.strokeColor || '#2563EB',
        fillOpacity: selectedTerritoryState.boundary.style.fillOpacity ?? 0.35,
        strokeOpacity: selectedTerritoryState.boundary.style.strokeOpacity ?? 0.7,
        strokeWeight: selectedTerritoryState.boundary.style.strokeWeight ?? 2
      });
    }
  }, [selectedTerritoryState]);

  if (loadError) {
    return <div className="text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-full w-full">
      {isLoaded && !loadError ? (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={4}
            options={{
              ...getMapOptions(),
              draggableCursor: isDrawingMode ? 'crosshair' : 'grab',
              draggingCursor: isDrawingMode ? 'crosshair' : 'grabbing'
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {map && (
              <>
                <TerritoryLayer
                  key={`territory-layer`}
                  map={map}
                  territories={territories}
                  selectedTerritory={selectedTerritoryState}
                  onTerritorySelect={handleTerritorySelect}
                  isEditing={isEditing}
                />

                {/* Add HeatMapLayer */}
                {heatMapData && heatMapLayerVisible && (
                  <HeatMapLayer map={map} />
                )}

                {/* Territory Editor */}
                {isEditing && selectedTerritoryState && map && (
                  <TerritoryEditor
                    territory={selectedTerritoryState}
                    onClose={handleEditClose}
                    onSave={handleEditSave}
                    map={map}
                  />
                )}
              </>
            )}
          </GoogleMap>

          {/* Territory Form */}
          {showEditor && newTerritory && (
            <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg">
              <TerritoryForm
                coordinates={newTerritory.boundary.coordinates}
                onSave={handleSaveTerritory}
                onClose={handleNewTerritoryClose}
              />
            </div>
          )}

          {/* Territory Info Tooltip */}
          {showTooltip && selectedTerritoryState && (
            <div
              className="fixed z-50 bg-white rounded-lg shadow-lg p-4"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-semibold">
                  {detailsLoading ? 'Loading...' : territoryDetails?.displayName || selectedTerritoryState.name || 'Unnamed Territory'}
                </div>
                <button
                  onClick={() => {
                    setShowTooltip(false);
                    setSelectedTerritoryState(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleEditStart(selectedTerritoryState);
                    setShowTooltip(false); // Hide tooltip when entering edit mode
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowColorPicker(true)}>
                  <Palette className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Delete Territory"
            message="Are you sure you want to delete this territory? This action cannot be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteConfirm(false)}
          />

          {/* Color Picker Modal */}
          {showColorPicker && selectedTerritoryState && (
            <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Territory Style</h3>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Fill Color</label>
                  <ColorPicker
                    color={territoryStyle.fillColor || '#FFFFFF'}
                    onChange={(color) =>
                      setTerritoryStyle((prev) => ({ ...prev, fillColor: color }))
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Border Color</label>
                  <ColorPicker
                    color={territoryStyle.strokeColor || '#000000'}
                    onChange={(color) =>
                      setTerritoryStyle((prev) => ({ ...prev, strokeColor: color }))
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700">Fill Opacity</label>
                    <span className="text-sm text-gray-500">
                      {Math.round((territoryStyle.fillOpacity ?? 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={territoryStyle.fillOpacity ?? 0.35}
                    onChange={(e) =>
                      setTerritoryStyle((prev) => ({
                        ...prev,
                        fillOpacity: parseFloat(e.target.value)
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowColorPicker(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStyleSave}>Save Changes</Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
};

export default Map;
