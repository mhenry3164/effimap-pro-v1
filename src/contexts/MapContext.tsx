import React, { createContext, useContext, useState } from 'react';
import { TerritoryTypeDefinition } from '../services/territoryTypeService';
import { HeatMapPoint } from '../types/heatMap';

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
  heatMapData: {
    points: HeatMapPoint[];
    maxWeight: number;
    minWeight: number;
  } | null;
  setStateLayerVisible: (visible: boolean) => void;
  setCountyLayerVisible: (visible: boolean) => void;
  setZipLayerVisible: (visible: boolean) => void;
  setBranchLayerVisible: (visible: boolean) => void;
  setRepresentativeLayerVisible: (visible: boolean) => void;
  setHeatMapLayerVisible: (visible: boolean) => void;
  setIsDrawingMode: (drawing: boolean) => void;
  setTerritoryTypes: (types: TerritoryTypeDefinition[]) => void;
  setTerritoryTypeVisibility: (typeCode: string, visible: boolean) => void;
  setHeatMapData: (data: { points: HeatMapPoint[]; maxWeight: number; minWeight: number; } | null) => void;
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
  const [heatMapData, setHeatMapData] = useState<{
    points: HeatMapPoint[];
    maxWeight: number;
    minWeight: number;
  } | null>(null);

  const setTerritoryTypeVisibility = (typeCode: string, visible: boolean) => {
    setTerritoryTypeVisibilityState(prev => ({
      ...prev,
      [typeCode]: visible
    }));
  };

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
        heatMapData,
        setStateLayerVisible,
        setCountyLayerVisible,
        setZipLayerVisible,
        setBranchLayerVisible,
        setRepresentativeLayerVisible,
        setHeatMapLayerVisible,
        setIsDrawingMode,
        setTerritoryTypes,
        setTerritoryTypeVisibility,
        setHeatMapData,
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
