import React, { createContext, useContext, useState, useEffect } from 'react';
import { TerritoryTypeDefinition } from '../services/territoryTypeService';
import { HeatMapDataset } from '../types/heatMap';
import { heatMapService } from '../services/heatMapService';
import { useTenant } from '../hooks/useTenant';
import { gradientOptions } from '../constants/heatmapConstants';
import { DEFAULT_HEATMAP_CONTROLS } from '../constants/heatmapEnhanced';

interface HeatMapLayerSettings {
  visible: boolean;
  minWeight: number;
  maxWeight: number;
  gradient?: string[];
  controls?: any;
}

interface ActiveHeatMapLayer {
  dataset: HeatMapDataset;
  settings: HeatMapLayerSettings;
}

interface MapContextType {
  stateLayerVisible: boolean;
  countyLayerVisible: boolean;
  zipLayerVisible: boolean;
  branchLayerVisible: boolean;
  representativeLayerVisible: boolean;
  heatMapLayerVisible: boolean;
  isDrawingMode: boolean;
  territoryTypes: TerritoryTypeDefinition[];
  territoryTypeVisibility: { [key: string]: boolean };
  heatMapDatasets: HeatMapDataset[];
  activeHeatMapLayers: ActiveHeatMapLayer[];
  setStateLayerVisible: (visible: boolean) => void;
  setCountyLayerVisible: (visible: boolean) => void;
  setZipLayerVisible: (visible: boolean) => void;
  setBranchLayerVisible: (visible: boolean) => void;
  setRepresentativeLayerVisible: (visible: boolean) => void;
  setHeatMapLayerVisible: (visible: boolean) => void;
  setIsDrawingMode: (drawing: boolean) => void;
  setTerritoryTypes: (types: TerritoryTypeDefinition[]) => void;
  setTerritoryTypeVisibility: (typeCode: string, visible: boolean) => void;
  setHeatMapDatasets: (datasets: HeatMapDataset[]) => void;
  toggleHeatMapLayer: (datasetId: string, visible: boolean) => void;
  updateHeatMapLayerSettings: (datasetId: string, settings: Partial<HeatMapLayerSettings>) => void;
  addHeatMapLayer: (dataset: HeatMapDataset) => void;
  removeHeatMapLayer: (datasetId: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [stateLayerVisible, setStateLayerVisible] = useState(false);
  const [countyLayerVisible, setCountyLayerVisible] = useState(false);
  const [zipLayerVisible, setZipLayerVisible] = useState(false);
  const [branchLayerVisible, setBranchLayerVisible] = useState(true);
  const [representativeLayerVisible, setRepresentativeLayerVisible] = useState(true);
  const [heatMapLayerVisible, setHeatMapLayerVisible] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryTypeDefinition[]>([]);
  const [territoryTypeVisibility, setTerritoryTypeVisibilityState] = useState<{ [key: string]: boolean }>({});
  const [heatMapDatasets, setHeatMapDatasets] = useState<HeatMapDataset[]>([]);
  const [activeHeatMapLayers, setActiveHeatMapLayers] = useState<ActiveHeatMapLayer[]>([]);

  const { tenant } = useTenant();

  const setTerritoryTypeVisibility = (typeCode: string, visible: boolean) => {
    setTerritoryTypeVisibilityState(prev => ({
      ...prev,
      [typeCode]: visible
    }));
  };

  const toggleHeatMapLayer = (datasetId: string, visible: boolean) => {
    setActiveHeatMapLayers(prev => 
      prev.map(layer => 
        layer.dataset.id === datasetId 
          ? { ...layer, settings: { ...layer.settings, visible } }
          : layer
      )
    );
  };

  const updateHeatMapLayerSettings = (datasetId: string, settings: Partial<ActiveHeatMapLayer['settings']>) => {
    setActiveHeatMapLayers(prev =>
      prev.map(layer =>
        layer.dataset.id === datasetId
          ? {
              ...layer,
              settings: {
                ...layer.settings,
                ...settings,
                controls: {
                  ...layer.settings.controls,
                  ...(settings.controls || {})
                }
              }
            }
          : layer
      )
    );
  };

  const addHeatMapLayer = (dataset: HeatMapDataset) => {
    setActiveHeatMapLayers(prev => [
      ...prev,
      {
        dataset,
        settings: {
          visible: true,
          minWeight: dataset.metadata.minWeight,
          maxWeight: dataset.metadata.maxWeight,
          gradient: gradientOptions[0].gradient,
          controls: DEFAULT_HEATMAP_CONTROLS
        }
      }
    ]);
  };

  const removeHeatMapLayer = (datasetId: string) => {
    setActiveHeatMapLayers(prev => prev.filter(layer => layer.dataset.id !== datasetId));
  };

  useEffect(() => {
    async function fetchHeatMapData() {
      if (!tenant?.id) return;

      try {
        const datasets = await heatMapService.getDatasets(tenant.id);
        const activeDatasets = datasets.filter(d => d.status === 'active');
        setHeatMapDatasets(activeDatasets);
        
        // Initialize active layers with default settings
        setActiveHeatMapLayers(
          activeDatasets.map(dataset => ({
            dataset,
            settings: {
              visible: true,
              minWeight: dataset.metadata.minWeight,
              maxWeight: dataset.metadata.maxWeight
            }
          }))
        );
      } catch (error) {
        console.error('Error fetching heatmap datasets:', error);
      }
    }

    fetchHeatMapData();
  }, [tenant]);

  return (
    <MapContext.Provider
      value={{
        stateLayerVisible,
        countyLayerVisible,
        zipLayerVisible,
        branchLayerVisible,
        representativeLayerVisible,
        heatMapLayerVisible,
        isDrawingMode,
        territoryTypes,
        territoryTypeVisibility,
        heatMapDatasets,
        activeHeatMapLayers,
        setStateLayerVisible,
        setCountyLayerVisible,
        setZipLayerVisible,
        setBranchLayerVisible,
        setRepresentativeLayerVisible,
        setHeatMapLayerVisible,
        setIsDrawingMode,
        setTerritoryTypes,
        setTerritoryTypeVisibility,
        setHeatMapDatasets,
        toggleHeatMapLayer,
        updateHeatMapLayerSettings,
        addHeatMapLayer,
        removeHeatMapLayer,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
