import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TerritoryTypeDefinition } from '../services/territoryTypeService';
import { HeatMapDataset } from '../types/heatMap';
import { heatMapService } from '../services/heatMapService';
import { useTenant } from '../hooks/useTenant';
import { gradientOptions } from '../constants/heatmapConstants';
import { DEFAULT_HEATMAP_CONTROLS } from '../constants/heatmapEnhanced';
import { DataLayer, DataLayerConfig, DataLayerStatus } from '../services/dataLayerService';
import { getDataLayers } from '../services/dataLayerService';

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
  dataLayers: DataLayer[];
  activeDataLayerId: string | null;
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
  setDataLayers: (layers: DataLayer[]) => void;
  addDataLayer: (layer: DataLayer) => void;
  updateDataLayer: (id: string, updates: Partial<DataLayer>) => void;
  removeDataLayer: (id: string) => void;
  setActiveDataLayer: (id: string | null) => void;
  toggleDataLayerVisibility: (id: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [stateLayerVisible, setStateLayerVisible] = useState(false);
  const [countyLayerVisible, setCountyLayerVisible] = useState(false);
  const [zipLayerVisible, setZipLayerVisible] = useState(false);
  const [branchLayerVisible, setBranchLayerVisible] = useState(true);
  const [representativeLayerVisible, setRepresentativeLayerVisible] = useState(true);
  const [heatMapLayerVisible, setHeatMapLayerVisible] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryTypeDefinition[]>([]);
  const [territoryTypeVisibility, setTerritoryTypeVisibilityState] = useState<{ [key: string]: boolean }>({});
  const [heatMapDatasets, setHeatMapDatasets] = useState<HeatMapDataset[]>([]);
  const [activeHeatMapLayers, setActiveHeatMapLayers] = useState<ActiveHeatMapLayer[]>([]);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([]);
  const [activeDataLayerId, setActiveDataLayerId] = useState<string | null>(null);

  const { tenant } = useTenant();

  // Fetch data layers when tenant changes
  useEffect(() => {
    async function fetchDataLayers() {
      if (!tenant?.id) {
        setDataLayers([]); // Clear data layers if no tenant
        return;
      }

      try {
        const layers = await getDataLayers(tenant.id);
        // Only set visible layers to state
        setDataLayers(layers.filter(layer => layer.visible).map(layer => ({
          ...layer,
          visible: false // Force all layers to start as invisible
        })));
      } catch (error) {
        console.error('Error fetching data layers:', error);
        setDataLayers([]); // Reset on error
      }
    }

    fetchDataLayers();
  }, [tenant?.id]);

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

  const addDataLayer = useCallback((layer: DataLayer) => {
    setDataLayers(prev => [...prev, layer]);
  }, []);

  const updateDataLayer = useCallback((id: string, updates: Partial<DataLayer>) => {
    setDataLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  }, []);

  const removeDataLayer = useCallback((id: string) => {
    setDataLayers(prev => prev.filter(layer => layer.id !== id));
  }, []);

  const toggleDataLayerVisibility = useCallback((id: string) => {
    setDataLayers(prev => prev.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

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

  const value = {
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
    dataLayers,
    activeDataLayerId,
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
    setDataLayers,
    addDataLayer,
    updateDataLayer,
    removeDataLayer,
    setActiveDataLayer: setActiveDataLayerId,
    toggleDataLayerVisibility,
  };

  return (
    <MapContext.Provider value={value}>
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
