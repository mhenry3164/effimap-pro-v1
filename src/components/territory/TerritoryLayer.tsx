import React from 'react';
import { Polygon } from '@react-google-maps/api';
import { useMap } from '../../contexts/MapContext';
import { useToast } from '../ui/use-toast';
import type { Territory } from '../../types/territory';
import { 
  TrashIcon, 
  PencilIcon,
  SwatchIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColorPickerDialog } from './ColorPickerDialog';
import TerritoryEditor from './TerritoryEditor';

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
    territoryTypeVisibility 
  } = useMap();

  if (!map) return null;

  const visibleTerritories = territories.filter(territory => {
    // Handle system types
    if (territory.type === 'branch') return branchLayerVisible;
    if (territory.type === 'representative') return representativeLayerVisible;
    
    // Handle custom types
    return territoryTypeVisibility[territory.type] ?? true;
  });

  return (
    <div>
      {visibleTerritories.map((territory) => {
        const isSelected = territory.id === selectedTerritory?.id;
        const isBeingEdited = isEditing && isSelected;
        
        // Don't render territory that's being edited - let TerritoryEditor handle it
        if (isBeingEdited) {
          return null;
        }
        
        // Default style values
        const defaultStyle = {
          fillColor: '#2563EB',
          strokeColor: '#1E40AF',
          strokeWeight: 2,
          fillOpacity: 0.35
        };

        // Merge default style with territory style
        const style = territory.boundary?.style 
          ? { ...defaultStyle, ...territory.boundary.style }
          : defaultStyle;

        return (
          <Polygon
            key={`${territory.id}-${territory.metadata?.updatedAt}`}
            paths={territory.boundary.coordinates}
            options={{
              fillColor: style.fillColor,
              strokeColor: style.strokeColor,
              strokeWeight: style.strokeWeight,
              fillOpacity: style.fillOpacity,
              clickable: true,
              draggable: false,
              editable: false,
              zIndex: isSelected ? 2 : 1
            }}
            onClick={() => onTerritorySelect(territory)}
          />
        );
      })}
      {isEditing && selectedTerritory && (
        <TerritoryEditor
          territory={selectedTerritory}
          map={map}
          onSave={() => {}}
          onCancel={() => {}}
        />
      )}
      <ConfirmDialog
        isOpen={false}
        title="Delete Territory"
        message="Are you sure you want to delete this territory? This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
      <ColorPickerDialog
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        initialColors={{
          fillColor: '#2563EB',
          strokeColor: '#1E40AF',
          fillOpacity: 0.35
        }}
      />
    </div>
  );
};

export default TerritoryLayer;
