import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { toast } from 'react-hot-toast';
import { useStore } from '../../store';
import { useMap } from '../../contexts/MapContext';
import { googleMapsConfig, getMapOptions, getFeatureStyle } from '../../config/googleMaps';
import LoadingScreen from '../shared/LoadingScreen';
import TerritoryLayer from './TerritoryLayer';
import TerritoryEditor from './TerritoryEditor';
import { territoryService } from '../../services/territoryService';
import { territoryTypeService } from '../../services/territoryTypeService';
import { activityService } from '../../services/activityService';
import { Pencil, Trash, Palette, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTerritoryDetails } from '../../hooks/useTerritoryDetails';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColorPickerDialog } from './ColorPickerDialog';
import { TerritoryForm } from './TerritoryForm';
import { HeatMapLayer } from '../map/HeatMapLayer';
import { DataLayer } from '../map/DataLayer';
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
  const { tenant, loading: tenantLoading } = useTenant();
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
    heatMapLayerVisible,
    heatMapData,
    setTerritoryTypes,
    dataLayers 
  } = useMap();

  // Early return if no tenant
  if (!tenantLoading && !tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Tenant Selected</h2>
        <p className="text-gray-600 text-center">
          Please contact your administrator to be assigned to a tenant.
        </p>
      </div>
    );
  }

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

  // Define callbacks first
  const refreshTerritories = useCallback(async () => {
    if (!tenant?.id || !map) return;

    try {
      const fetchedTerritories = await territoryService.getAll(tenant.id);
      setTerritories(fetchedTerritories);
    } catch (error) {
      console.error('Error fetching territories:', error);
      toast.error('Failed to fetch territories');
    }
  }, [tenant?.id, map]);

  // Load territory types
  const loadTerritoryTypes = useCallback(async () => {
    if (!tenant?.id) {
      console.log('No tenant ID available for loading territory types');
      return;
    }

    try {
      console.log('Loading territory types for tenant:', tenant.id);
      const types = await territoryTypeService.getAll(tenant.id);
      console.log('Loaded territory types:', types);
      if (types.length > 0) {
        setTerritoryTypes(types);
      } else {
        // Initialize default types if none exist
        await territoryTypeService.initializeDefaultTypes(tenant.id);
        const newTypes = await territoryTypeService.getAll(tenant.id);
        setTerritoryTypes(newTypes);
      }
    } catch (error) {
      console.error('Error loading territory types:', error);
      toast.error('Failed to load territory types');
    }
  }, [tenant?.id, setTerritoryTypes]);

  // Effects
  useEffect(() => {
    if (storeTerritories) {
      setTerritories(storeTerritories);
    }
  }, [storeTerritories]);

  useEffect(() => {
    setSelectedTerritoryState(selectedTerritory);
  }, [selectedTerritory]);

  useEffect(() => {
    if (tenant?.id) {
      loadTerritoryTypes();
    }
  }, [tenant?.id, loadTerritoryTypes]);

  useEffect(() => {
    if (tenant?.id) {
      refreshTerritories();
    }
  }, [tenant?.id, refreshTerritories]);

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

  const handleSaveTerritory = useCallback(
    async (formData: NewTerritory) => {
      try {
        if (!tenant?.id) {
          toast.error('No tenant ID found');
          return;
        }

        // Get coordinates from drawn shape
        if (!drawnShape) {
          toast.error('Please draw a territory boundary on the map');
          return;
        }

        const path = drawnShape.getPath();
        const coordinates: TerritoryPoint[] = [];
        path.forEach((point, index) => {
          coordinates.push({ index, lat: point.lat(), lng: point.lng() });
        });

        // Create territory with coordinates
        const territory: Omit<Territory, 'id'> = {
          ...formData,
          boundary: {
            type: 'Polygon',
            coordinates: coordinates,
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

        await territoryService.add(tenant.id, territory);

        // Clean up drawing state
        setShowEditor(false);
        setIsDrawingMode(false);
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
    [tenant, drawnShape, refreshTerritories, setIsDrawingMode, territoryStyle]
  );

  const handleNewTerritoryClose = useCallback(() => {
    setShowEditor(false);
    setIsDrawingMode(false);
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

      setShowEditor(true);
      setDrawnShape(polygon);
    },
    []
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
        if (!tenant?.id) {
          toast.error('No tenant ID found');
          return false;
        }

        if (!editedTerritory.id) {
          toast.error('Territory ID is missing');
          return false;
        }

        // Step 1: Save the update
        await territoryService.update(tenant.id, editedTerritory.id, editedTerritory);
        
        // Step 2: Refresh territories data
        await refreshTerritories();
        
        // Step 3: Update UI states
        setIsEditing(false);
        setSelectedTerritoryState(null);
        setShowTooltip(false);

        // Step 4: Log activity (non-blocking)
        activityService.logActivity(tenant.id, {
          type: 'edit',
          entityType: 'territory',
          entityId: editedTerritory.id,
          entityName: editedTerritory.name || 'Unnamed Territory',
          userId: user.id,
          details: {
            boundary: editedTerritory.boundary
          }
        }).catch(console.error); // Handle logging error separately
        
        // Step 5: Show success message
        toast.success('Territory updated successfully');
        return true;
      } catch (error) {
        console.error('Error updating territory:', error);
        return false;
      }
    },
    [tenant?.id, refreshTerritories]
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTerritoryState?.id || !tenant?.id) return;

    try {
      // Step 1: Delete the territory
      await territoryService.delete(tenant.id, selectedTerritoryState.id, user.id);
      
      // Step 2: Refresh territories data to ensure consistency
      await refreshTerritories();
      
      // Step 3: Update UI states
      setShowDeleteConfirm(false);
      setSelectedTerritoryState(null);
      setShowTooltip(false);

      // Step 4: Log activity (non-blocking)
      activityService.logActivity(tenant.id, {
        type: 'delete',
        entityType: 'territory',
        entityId: selectedTerritoryState.id,
        entityName: selectedTerritoryState.name || 'Unnamed Territory',
        userId: user.id,
        details: {
          territoryType: selectedTerritoryState.type
        }
      }).catch(console.error); // Handle logging error separately
      
      // Step 5: Show success message
      toast.success('Territory deleted successfully');
    } catch (error) {
      console.error('Error deleting territory:', error);
      toast.error('Failed to delete territory');
    }
  }, [selectedTerritoryState, tenant, refreshTerritories]);

  const handleStyleSave = useCallback(async () => {
    if (!selectedTerritoryState?.id || !tenant?.id) return;

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

      await territoryService.update(tenant.id, selectedTerritoryState.id, updatedTerritory);
      setTerritories((prev) =>
        prev.map((t) => (t.id === selectedTerritoryState.id ? updatedTerritory : t))
      );
      setShowColorPicker(false);
      toast.success('Territory style updated');
    } catch (error) {
      console.error('Error updating territory style:', error);
      toast.error('Failed to update territory style');
    }
  }, [selectedTerritoryState, territoryStyle, tenant?.id]);

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

  // Refresh territories and territory types when map is loaded or user changes
  useEffect(() => {
    refreshTerritories();
    loadTerritoryTypes();
  }, [refreshTerritories, loadTerritoryTypes, tenant?.id]);

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

  const renderModals = () => {
    return (
      <>
        {showDeleteConfirm && (
          <ConfirmDialog
            open={showDeleteConfirm}
            title="Delete Territory"
            message="Are you sure you want to delete this territory? This action cannot be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
        {showColorPicker && (
          <ColorPickerDialog
            isOpen={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            onConfirm={(fillColor, strokeColor, fillOpacity) => {
              setTerritoryStyle(prev => ({
                ...prev,
                fillColor,
                strokeColor,
                fillOpacity
              }));
              handleStyleSave();
            }}
            initialColors={{
              fillColor: territoryStyle.fillColor,
              strokeColor: territoryStyle.strokeColor,
              fillOpacity: territoryStyle.fillOpacity
            }}
          />
        )}
      </>
    );
  };

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
                {dataLayers
                  .filter(layer => layer.visible)
                  .map(layer => (
                    <DataLayer key={layer.id} layer={layer} />
                  ))}
                <TerritoryLayer
                  key={`territory-layer`}
                  map={map}
                  territories={territories}
                  selectedTerritory={selectedTerritoryState}
                  onTerritorySelect={handleTerritorySelect}
                  isEditing={isEditing}
                />

                <HeatMapLayer map={map} />

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
          {showEditor && (
            <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg">
              <TerritoryForm
                onSave={handleSaveTerritory}
                onClose={handleNewTerritoryClose}
                territoryStyle={territoryStyle}
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

          {renderModals()}
        </>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
};

export default Map;