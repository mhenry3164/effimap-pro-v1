import React from 'react';
import { Polygon } from '@react-google-maps/api';
import { useMap } from '../../contexts/MapContext';
import { useToast } from '../ui/use-toast';
import type { Territory } from '../../types/territory';
import { getFeatureStyle } from '../../config/googleMaps';

interface TerritoryLayerProps {
  map: google.maps.Map;
  territories: Territory[];
  selectedTerritory: Territory | null;
  onTerritorySelect: (territory: Territory | null) => void;
  isEditing: boolean;
}

export const TerritoryLayer: React.FC<TerritoryLayerProps> = ({
  map,
  territories,
  selectedTerritory,
  onTerritorySelect,
  isEditing
}) => {
  const { toast } = useToast();
  const { 
    branchLayerVisible, 
    representativeLayerVisible,
    territoryTypeVisibility,
    stateLayerVisible,
    countyLayerVisible,
    zipLayerVisible
  } = useMap();

  React.useEffect(() => {
    if (!map) return;

    // Initialize feature layers
    const stateLayer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_1');
    const countyLayer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');
    const zipLayer = map.getFeatureLayer('POSTAL_CODE');

    // Apply styles to layers
    if (stateLayerVisible) {
      stateLayer.style = {
        strokeColor: '#08519c',
        strokeWeight: 1.4,
        fillColor: '#377eb8',
        fillOpacity: 0.1,
        strokeOpacity: 1.0
      };
    } else {
      stateLayer.style = null;
    }

    if (countyLayerVisible) {
      countyLayer.style = {
        strokeColor: '#238b45',
        strokeWeight: 1.2,
        fillColor: '#4daf4a',
        fillOpacity: 0.1,
        strokeOpacity: 1.0
      };
    } else {
      countyLayer.style = null;
    }

    if (zipLayerVisible) {
      zipLayer.style = {
        strokeColor: '#d94801',
        strokeWeight: 0.8,
        fillColor: '#ff7f00',
        fillOpacity: 0.1,
        strokeOpacity: 1.0
      };
    } else {
      zipLayer.style = null;
    }

    return () => {
      stateLayer.style = null;
      countyLayer.style = null;
      zipLayer.style = null;
    };
  }, [map, stateLayerVisible, countyLayerVisible, zipLayerVisible]);

  if (!map) return null;

  // Filter visible territories and exclude the one being edited
  const visibleTerritories = territories.filter(territory => {
    // Skip territory being edited
    if (isEditing && territory.id === selectedTerritory?.id) {
      return false;
    }

    // Handle system types
    if (territory.type === 'branch') return branchLayerVisible;
    if (territory.type === 'representative') return representativeLayerVisible;
    
    // Handle custom types
    return territoryTypeVisibility[territory.type] ?? true;
  });

  return (
    <>
      {visibleTerritories.map((territory) => {
        const isSelected = territory.id === selectedTerritory?.id;
        
        // Default style values
        const defaultStyle = {
          fillColor: '#2563EB',
          strokeColor: '#1E40AF',
          strokeWeight: 2,
          fillOpacity: 0.35,
          strokeOpacity: 1.0
        };

        // Merge default style with territory style
        const style = territory.boundary?.style 
          ? { ...defaultStyle, ...territory.boundary.style }
          : defaultStyle;

        // Enhance style for selected territory
        if (isSelected) {
          style.strokeWeight = 3;
          style.strokeOpacity = 1;
          style.fillOpacity = 0.5;
        }

        return (
          <Polygon
            key={`${territory.id}-${territory.metadata?.updatedAt}`}
            paths={territory.boundary.coordinates.map(coord => ({
              lat: coord.lat,
              lng: coord.lng
            }))}
            options={{
              ...style,
              clickable: true,
              draggable: false,
              editable: false,
              zIndex: isSelected ? 2 : 1
            }}
            onClick={() => {
              if (!isEditing) {
                onTerritorySelect(territory);
              }
            }}
            onMouseOver={(e) => {
              if (!isEditing) {
                map.getDiv().style.cursor = 'pointer';
              }
            }}
            onMouseOut={(e) => {
              if (!isEditing) {
                map.getDiv().style.cursor = '';
              }
            }}
          />
        );
      })}
    </>
  );
};

export default TerritoryLayer;
