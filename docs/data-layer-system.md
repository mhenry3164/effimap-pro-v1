# Data Layer System

The Data Layer system in EffiMap Pro allows users to import, visualize, and interact with custom datasets on the map.

## Overview

The Data Layer system consists of several components working together to provide a seamless experience for data visualization:

1. Data Import
2. Geocoding
3. Marker Visualization
4. Interactive Tooltips

## Components

### DataLayer Component

The main component responsible for rendering markers and tooltips on the map.

```typescript
interface DataLayerProps {
  layer: DataLayerType;
}
```

Key features:
- Renders markers based on latitude/longitude data
- Displays interactive tooltips on marker click
- Supports customizable marker styles
- Handles data formatting for different value types

### Data Layer Configuration

```typescript
interface DataLayerConfig {
  addressField: string;
  markerStyle: MarkerStyle;
}

interface MarkerStyle {
  color: string;
  icon: string;
  size: number;
  tooltipFields: string[];
}
```

### Data Points

```typescript
interface DataPoint {
  id: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}
```

## Services

### Data Layer Service

Handles all data layer operations:
- Creating new data layers
- Updating configurations
- Managing data processing status
- Retrieving data layers

### Geocoding Service

Converts addresses to latitude/longitude coordinates:
- Batch processing of CSV data
- Error handling and reporting
- Rate limiting and quota management

## State Management

Data layers are managed through the MapContext, which provides:
- Layer visibility toggling
- Active layer selection
- Layer updates and modifications

## Data Flow

1. **Import**:
   - User uploads CSV file
   - System validates file format and content

2. **Processing**:
   - Data is parsed and validated
   - Addresses are geocoded
   - Progress is tracked and reported

3. **Visualization**:
   - Markers are rendered on the map
   - Tooltips display configured fields
   - Styles are applied based on configuration

4. **Interaction**:
   - Users can toggle layer visibility
   - Click markers to view details
   - Modify layer configuration

## Best Practices

1. **Performance**:
   - Use appropriate marker clustering for large datasets
   - Implement lazy loading for tooltip content
   - Cache geocoding results

2. **Error Handling**:
   - Validate data before processing
   - Provide clear error messages
   - Handle missing or invalid coordinates

3. **User Experience**:
   - Show processing progress
   - Provide immediate feedback on interactions
   - Allow easy configuration of tooltip fields

## Example Usage

```typescript
// Creating a new data layer
await createDataLayer(
  tenantId,
  'Sales Data 2024',
  csvFile,
  {
    addressField: 'location',
    markerStyle: {
      color: '#1890ff',
      icon: 'circle',
      size: 24,
      tooltipFields: ['name', 'sales', 'date']
    }
  }
);

// Rendering the data layer
<DataLayer
  layer={dataLayer}
/>
```
