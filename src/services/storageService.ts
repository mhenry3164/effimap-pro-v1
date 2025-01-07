import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Creates an empty placeholder file to ensure the folder structure exists
 */
const ensureFolderStructure = async (tenantId: string, dataLayerId: string) => {
  const placeholderPath = `tenants/${tenantId}/dataLayers/${dataLayerId}/.placeholder`;
  const placeholderRef = ref(storage, placeholderPath);
  
  try {
    await uploadBytes(placeholderRef, new Blob(['']));
  } catch (error) {
    // Ignore error if placeholder already exists
    console.log('Folder structure already exists');
  }
};

export const uploadDataLayerCSV = async (
  tenantId: string,
  dataLayerId: string,
  file: File
): Promise<string> => {
  // Ensure folder structure exists first
  await ensureFolderStructure(tenantId, dataLayerId);

  const filePath = `tenants/${tenantId}/dataLayers/${dataLayerId}/source.csv`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading CSV:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload CSV file: ${error.message}`);
    }
    throw new Error('Failed to upload CSV file');
  }
};
