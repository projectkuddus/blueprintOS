import { Asset, Project, AssetType } from '../types';

/**
 * STORAGE ARCHITECTURE EXPLANATION:
 * 
 * In a real production environment, this service would interact with an Object Storage provider
 * like AWS S3, Google Cloud Storage, or Azure Blob Storage.
 * 
 * The flow would be:
 * 1. Frontend calls Backend API to request a "Presigned Upload URL".
 * 2. Backend checks Database to see if Studio has enough storage space (Quota Check).
 * 3. If space exists, Backend generates a secure URL from S3 and returns it.
 * 4. Frontend uploads the file directly to that URL (bypassing the app server for speed).
 * 5. On success, Frontend tells Backend to save the file metadata (name, size, type) in the database.
 */

// Mock Storage Quota (500 GB in Bytes)
const STUDIO_STORAGE_LIMIT = 500 * 1024 * 1024 * 1024; 

export const checkStorageQuota = (currentProjects: Project[], newFileSize: number): boolean => {
  let totalUsed = 0;
  
  currentProjects.forEach(project => {
    project.stages.forEach(stage => {
      stage.assets.forEach(asset => {
        totalUsed += asset.size || 0;
      });
    });
  });

  return (totalUsed + newFileSize) <= STUDIO_STORAGE_LIMIT;
};

export const simulateCloudUpload = async (file: File): Promise<string> => {
  // Simulate network latency for large architectural files
  return new Promise((resolve) => {
    const delay = Math.min(Math.max(file.size / 100000, 1000), 3000); // Dynamic delay based on size
    
    setTimeout(() => {
      // In prod, this would be the S3 URL: https://blueprint-os-bucket.s3.amazonaws.com/${file.name}
      resolve(URL.createObjectURL(file)); 
    }, delay);
  });
};

export const determineAssetType = (fileName: string): AssetType => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'png', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['dwg', 'dxf', 'rvt', 'pln'].includes(ext)) return 'cad';
  if (['obj', 'fbx', 'glb', 'max', 'skp', 'blend'].includes(ext)) return '3d';
  return 'document';
};