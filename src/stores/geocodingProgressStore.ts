import { create } from 'zustand';

interface GeocodingProgress {
  total: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
  currentBatch: number;
  totalBatches: number;
  errors: Array<{ address: string; error: string }>;
  status: 'idle' | 'processing' | 'completed' | 'error';
  lastError?: string;
}

interface GeocodingProgressStore extends GeocodingProgress {
  reset: () => void;
  startProcessing: (total: number, batchSize: number) => void;
  setCompleted: (completed: number) => void;
  addError: (address: string, error: string) => void;
  incrementBatch: () => void;
  setStatus: (status: GeocodingProgress['status'], error?: string) => void;
}

export const useGeocodingProgress = create<GeocodingProgressStore>((set) => ({
  total: 0,
  completed: 0,
  failed: 0,
  isProcessing: false,
  currentBatch: 0,
  totalBatches: 0,
  errors: [],
  status: 'idle',
  lastError: undefined,

  reset: () =>
    set({
      total: 0,
      completed: 0,
      failed: 0,
      isProcessing: false,
      currentBatch: 0,
      totalBatches: 0,
      errors: [],
      status: 'idle',
      lastError: undefined,
    }),

  startProcessing: (total: number, batchSize: number) =>
    set({
      total,
      completed: 0,
      failed: 0,
      isProcessing: true,
      currentBatch: 0,
      totalBatches: Math.ceil(total / batchSize),
      errors: [],
      status: 'processing',
      lastError: undefined,
    }),

  setCompleted: (completed: number) =>
    set((state) => ({
      completed,
      status: completed === state.total ? 'completed' : state.status,
      isProcessing: completed < state.total,
    })),

  addError: (address: string, error: string) =>
    set((state) => ({
      failed: state.failed + 1,
      errors: [...state.errors, { address, error }],
      lastError: error,
      status: 'error',
    })),

  incrementBatch: () =>
    set((state) => ({
      currentBatch: state.currentBatch + 1,
    })),

  setStatus: (status: GeocodingProgress['status'], error?: string) =>
    set((state) => ({
      status,
      lastError: error || state.lastError,
      isProcessing: status === 'processing',
    })),
}));
