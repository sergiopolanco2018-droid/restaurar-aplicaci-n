export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface RestorationRequest {
  imageBase64: string;
  mimeType: string;
  prompt: string;
}

export interface RestorationResult {
  originalImage: string; // base64
  restoredImage: string; // base64
}