import React, { useState, useCallback } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { DataLayer as DataLayerType } from '../../contexts/MapContext';
import { Typography, Box } from '@mui/material';

interface DataLayerProps {
  layer: DataLayerType;
}

export function DataLayer({ layer }: DataLayerProps) {
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);

  const handleMarkerClick = useCallback((point: any) => {
    console.log('Marker clicked:', point);
    setSelectedPoint(point);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  // Early return if layer is not visible or data is not available
  if (!layer?.visible || !Array.isArray(layer?.data)) {
    console.log('Layer not visible or data not available:', layer);
    return null;
  }

  // Early return if config or markerStyle is not available
  if (!layer?.config?.markerStyle?.tooltipFields) {
    console.error('Layer config, markerStyle, or tooltipFields is missing:', layer);
    return null;
  }

  const getMarkerIcon = () => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: layer.config?.markerStyle?.color || '#1890ff',
    fillOpacity: 0.8,
    strokeWeight: 1,
    strokeColor: '#ffffff',
    scale: (layer.config?.markerStyle?.size || 24) / 10,
  });

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      // Handle dates (Excel serial numbers)
      if (value > 30000 && value < 50000) { // Likely a date
        const date = new Date((value - 25569) * 86400 * 1000);
        return date.toLocaleDateString();
      }
      // Handle currency
      if (value > 1000) {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          maximumFractionDigits: 0 
        }).format(value);
      }
    }
    return String(value);
  };

  const renderTooltipContent = (point: any) => {
    if (!layer.config?.markerStyle?.tooltipFields) return null;

    return (
      <Box sx={{ 
        p: 1, 
        maxWidth: 300,
        maxHeight: 400,
        overflow: 'auto'
      }}>
        {layer.config.markerStyle.tooltipFields.map((field) => {
          const value = point[field];
          if (value == null) return null;

          return (
            <Box key={field} sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                color="textSecondary" 
                sx={{ 
                  display: 'block',
                  fontWeight: 'bold',
                  mb: 0.5
                }}
              >
                {field}
              </Typography>
              <Typography variant="body2">
                {formatValue(value)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  console.log('Rendering DataLayer:', {
    visible: layer.visible,
    dataLength: layer.data?.length,
    tooltipFields: layer.config?.markerStyle?.tooltipFields
  });

  return (
    <>
      {layer.data.map((point) => {
        if (!point?.latitude || !point?.longitude || !point?.id) {
          console.warn('Invalid point data:', point);
          return null;
        }

        return (
          <React.Fragment key={point.id}>
            <Marker
              position={{
                lat: point.latitude,
                lng: point.longitude
              }}
              icon={getMarkerIcon()}
              onClick={() => handleMarkerClick(point)}
            />
            
            {selectedPoint?.id === point.id && (
              <InfoWindow
                position={{
                  lat: point.latitude,
                  lng: point.longitude
                }}
                onCloseClick={handleInfoWindowClose}
              >
                {renderTooltipContent(point)}
              </InfoWindow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
