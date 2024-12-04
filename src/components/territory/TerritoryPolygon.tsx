import React, { useEffect, useState } from 'react';
import { Territory, TerritoryPoint } from '../../types/territory';
import { DEFAULT_TERRITORY_STYLE } from '../../config/constants';
import { Polygon } from '@react-google-maps/api';

interface TerritoryPolygonProps {
  territory: Territory;
  map: google.maps.Map;
  isSelected?: boolean;
  onClick?: () => void;
  onRightClick?: () => void;
  onPolygonLoad?: (polygon: google.maps.Polygon) => void;
}

const TerritoryPolygon: React.FC<TerritoryPolygonProps> = ({
  territory,
  map,
  isSelected = false,
  onClick,
  onRightClick,
  onPolygonLoad
}) => {
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!territory.boundary?.coordinates?.length) return;

    const polygonOptions: google.maps.PolygonOptions = {
      paths: territory.boundary.coordinates.map((point: TerritoryPoint) => ({
        lat: point.lat,
        lng: point.lng
      })),
      strokeColor: territory.style?.strokeColor || DEFAULT_TERRITORY_STYLE.strokeColor,
      strokeOpacity: territory.style?.strokeOpacity || DEFAULT_TERRITORY_STYLE.strokeOpacity,
      strokeWeight: isSelected ? 3 : (territory.style?.strokeWeight || DEFAULT_TERRITORY_STYLE.strokeWeight),
      fillColor: territory.style?.fillColor || DEFAULT_TERRITORY_STYLE.fillColor,
      fillOpacity: territory.style?.fillOpacity || DEFAULT_TERRITORY_STYLE.fillOpacity,
      zIndex: isSelected ? 2 : 1,
      clickable: true
    };

    const newPolygon = new google.maps.Polygon(polygonOptions);
    newPolygon.setMap(map);

    if (onClick) {
      newPolygon.addListener('click', onClick);
    }

    if (onRightClick) {
      newPolygon.addListener('rightclick', onRightClick);
    }

    setPolygon(newPolygon);

    return () => {
      if (polygon) {
        polygon.setMap(null);
        google.maps.event.clearInstanceListeners(polygon);
      }
    };
  }, [territory, isSelected, onClick, onRightClick, map]);

  useEffect(() => {
    if (!polygon || !territory.boundary?.coordinates?.length) return;

    const path = territory.boundary.coordinates.map((point: TerritoryPoint) => ({
      lat: point.lat,
      lng: point.lng
    }));

    polygon.setOptions({
      paths: path,
      strokeColor: territory.style?.strokeColor || DEFAULT_TERRITORY_STYLE.strokeColor,
      strokeOpacity: territory.style?.strokeOpacity || DEFAULT_TERRITORY_STYLE.strokeOpacity,
      strokeWeight: isSelected ? 3 : (territory.style?.strokeWeight || DEFAULT_TERRITORY_STYLE.strokeWeight),
      fillColor: territory.style?.fillColor || DEFAULT_TERRITORY_STYLE.fillColor,
      fillOpacity: territory.style?.fillOpacity || DEFAULT_TERRITORY_STYLE.fillOpacity,
      zIndex: isSelected ? 2 : 1
    });
  }, [territory, isSelected, polygon]);

  const handlePolygonLoad = (polygon: google.maps.Polygon) => {
    setPolygon(polygon);
    if (onPolygonLoad) {
      onPolygonLoad(polygon);
    }
  };

  if (!territory.boundary?.coordinates?.length) return null;

  const path = territory.boundary.coordinates.map((point: TerritoryPoint) => ({
    lat: point.lat,
    lng: point.lng
  }));

  return (
    <Polygon
      path={path}
      options={{
        strokeColor: territory.style?.strokeColor || DEFAULT_TERRITORY_STYLE.strokeColor,
        strokeOpacity: territory.style?.strokeOpacity || DEFAULT_TERRITORY_STYLE.strokeOpacity,
        strokeWeight: isSelected ? 3 : (territory.style?.strokeWeight || DEFAULT_TERRITORY_STYLE.strokeWeight),
        fillColor: territory.style?.fillColor || DEFAULT_TERRITORY_STYLE.fillColor,
        fillOpacity: territory.style?.fillOpacity || DEFAULT_TERRITORY_STYLE.fillOpacity,
        zIndex: isSelected ? 2 : 1,
        clickable: true
      }}
      onLoad={handlePolygonLoad}
      onClick={onClick}
      onRightClick={onRightClick}
    />
  );
};

export default TerritoryPolygon;