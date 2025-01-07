import { db } from '../config/firebase';
import { collection, doc, setDoc, Timestamp, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { uploadDataLayerCSV } from './storageService';
import { googleGeocodingService } from './googleGeocodingService';
import Papa from 'papaparse';

export type DataLayerStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface MarkerStyle {
  color: string;
  icon: string;
  size: number;
  tooltipFields: string[];
}

export interface DataLayerConfig {
  addressField: string;
  markerStyle: MarkerStyle;
}

export interface DataLayer {
  id: string;
  name: string;
  data: DataPoint[];
  config: DataLayerConfig;
  visible: boolean;
  status: DataLayerStatus;
  processingDetails?: {
    total: number;
    completed: number;
    failed: number;
    errors: Array<{ address: string; error: string; timestamp: number }>;
    logs: Array<{ message: string; type: 'info' | 'error' | 'success'; timestamp: number }>;
  };
  sourceFile?: {
    url: string;
    name: string;
  };
  metadata: {
    createdAt: Timestamp;
    createdBy: string;
    updatedAt: Timestamp;
    updatedBy: string;
  };
  columns?: string[];
}

export interface DataPoint {
  id: string;
  [key: string]: any;
  latitude?: number;
  longitude?: number;
  geocodingError?: string;
}

export async function createDataLayer(
  tenantId: string,
  name: string,
  csvFile: File,
  config: DataLayerConfig
): Promise<void> {
  const dataLayerId = uuidv4();
  const dataLayerRef = doc(db, 'tenants', tenantId, 'dataLayers', dataLayerId);

  // Initialize data layer document
  await setDoc(dataLayerRef, {
    id: dataLayerId,
    name,
    config,
    visible: true,
    status: 'processing',
    data: [],
    processingDetails: {
      total: 0,
      completed: 0,
      failed: 0,
      errors: [],
      logs: []
    },
    metadata: {
      createdAt: Timestamp.now(),
      createdBy: 'system', // TODO: Add user ID
      updatedAt: Timestamp.now(),
      updatedBy: 'system'
    }
  });

  try {
    // Parse CSV file
    const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject
      });
    });

    const { data: csvData, meta } = parseResult;

    if (!csvData || csvData.length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    if (!csvData[0].hasOwnProperty(config.addressField)) {
      throw new Error(`Address field "${config.addressField}" not found in CSV`);
    }

    // Add unique IDs to each data point
    const dataPoints = csvData.map(row => ({
      id: uuidv4(),
      ...row
    }));

    const total = dataPoints.length;
    await addLog(dataLayerRef, `Found ${total} addresses to process`);

    // Update total count and columns
    await updateDoc(dataLayerRef, {
      'processingDetails.total': total,
      columns: meta.fields || []
    });

    // Process addresses in batches
    await addLog(dataLayerRef, 'Starting geocoding process');
    let completed = 0;
    let failed = 0;
    const errors: { address: string; error: string; timestamp: number }[] = [];
    const processedData: DataPoint[] = [];

    // Process in smaller batches
    const batchSize = 5;
    for (let i = 0; i < dataPoints.length; i += batchSize) {
      const batch = dataPoints.slice(i, Math.min(i + batchSize, dataPoints.length));
      
      try {
        const results = await googleGeocodingService.batchGeocodeAddresses(
          batch.map(row => row[config.addressField]),
          async (currentCompleted, total, error) => {
            if (error) {
              failed++;
              const errorLog = {
                address: batch[currentCompleted - 1][config.addressField],
                error,
                timestamp: Date.now()
              };
              errors.push(errorLog);
              await addLog(dataLayerRef, `Failed to geocode: ${errorLog.address} - ${error}`, 'error');
            } else {
              await addLog(dataLayerRef, `Successfully geocoded address ${completed + currentCompleted} of ${total}`, 'success');
            }
            
            // Update progress
            await updateDoc(dataLayerRef, {
              'processingDetails.completed': completed + currentCompleted,
              'processingDetails.failed': failed,
              'processingDetails.errors': errors
            });
          }
        );

        // Process results
        results.forEach((result, index) => {
          const dataPoint = { ...batch[index] };
          if (result.error) {
            dataPoint.geocodingError = result.error;
          } else {
            dataPoint.latitude = result.latitude;
            dataPoint.longitude = result.longitude;
          }
          processedData.push(dataPoint);
        });

        completed += batch.length;
      } catch (error) {
        // If we get an API key error, stop processing
        if (error instanceof Error && error.message.includes('API key')) {
          await addLog(dataLayerRef, `Critical error: ${error.message}`, 'error');
          await updateDoc(dataLayerRef, { status: 'error' });
          throw error;
        }

        // For other errors, log and continue
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await addLog(dataLayerRef, `Batch processing error: ${errorMessage}`, 'error');
        failed += batch.length;
      }

      // Add delay between batches
      if (i + batchSize < dataPoints.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Upload CSV file
    const csvUrl = await uploadDataLayerCSV(tenantId, dataLayerId, csvFile);

    // Update final status
    await updateDoc(dataLayerRef, {
      status: 'completed',
      data: processedData,
      'sourceFile': {
        url: csvUrl,
        name: csvFile.name
      },
      'processingDetails.completed': completed,
      'processingDetails.failed': failed,
      'processingDetails.errors': errors
    });

    await addLog(dataLayerRef, `Processing completed. ${completed - failed} addresses geocoded successfully, ${failed} failed.`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await addLog(dataLayerRef, `Critical error: ${errorMessage}`, 'error');
    
    // Update status to error
    await updateDoc(dataLayerRef, {
      status: 'error',
      'processingDetails.errors': [{
        address: 'System Error',
        error: errorMessage,
        timestamp: Date.now()
      }]
    });
    
    throw error;
  }
}

async function addLog(
  dataLayerRef: any,
  message: string,
  type: 'info' | 'error' | 'success' = 'info'
) {
  const log = {
    message,
    type,
    timestamp: Date.now()
  };

  await updateDoc(dataLayerRef, {
    'processingDetails.logs': [...(await getExistingLogs(dataLayerRef)), log]
  });
}

async function getExistingLogs(dataLayerRef: any) {
  try {
    const doc = await dataLayerRef.get();
    return doc.data()?.processingDetails?.logs || [];
  } catch {
    return [];
  }
}

export async function updateDataLayerConfig(
  tenantId: string,
  dataLayerId: string,
  config: Partial<DataLayerConfig>
): Promise<void> {
  const dataLayerRef = doc(db, 'tenants', tenantId, 'dataLayers', dataLayerId);
  await updateDoc(dataLayerRef, { config });
}

export async function getDataLayers(tenantId: string): Promise<DataLayer[]> {
  const dataLayersRef = collection(db, 'tenants', tenantId, 'dataLayers');
  const snapshot = await getDocs(dataLayersRef);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as DataLayer[];
}

export async function getDataLayer(tenantId: string, dataLayerId: string): Promise<DataLayer | null> {
  const dataLayerRef = doc(db, 'tenants', tenantId, 'dataLayers', dataLayerId);
  const snapshot = await getDoc(dataLayerRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as DataLayer;
}
