import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { getAuthToken } from '@/sdk/core/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_PATH || '';

// Helper function to make authenticated API calls
async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// Sync Push Hook
// ============================================================================

export interface SyncPushInput {
  device_id: string;
  entity_type: string;
  changes: Array<unknown>;
  last_sync: number;
}

export interface SyncConflict {
  entity_id: string;
  entity_type: string;
  local_version: number;
  server_version: number;
  conflict_data: unknown;
}

export interface SyncPushResponse {
  conflicts: SyncConflict[];
  server_timestamp: number;
}

/**
 * Hook to push local changes to the server
 *
 * @example
 * ```tsx
 * const syncPush = useSyncPush();
 *
 * const handleSyncChanges = async () => {
 *   try {
 *     const result = await syncPush.mutateAsync({
 *       device_id: 'device-123',
 *       entity_type: 'transaction',
 *       changes: [{ id: '1', data: {...}, version: 2 }],
 *       last_sync: Date.now() - 3600000,
 *     });
 *
 *     if (result.conflicts.length > 0) {
 *       console.log('Conflicts detected:', result.conflicts);
 *     }
 *   } catch (error) {
 *     console.error('Sync failed:', error);
 *   }
 * };
 * ```
 */
export function useSyncPush(): UseMutationResult<
  SyncPushResponse,
  Error,
  SyncPushInput
> {
  return useMutation({
    mutationFn: async (input: SyncPushInput): Promise<SyncPushResponse> => {
      if (!input.device_id) {
        throw new Error('Device ID is required');
      }
      if (!input.entity_type) {
        throw new Error('Entity type is required');
      }
      if (!Array.isArray(input.changes)) {
        throw new Error('Changes must be an array');
      }
      if (typeof input.last_sync !== 'number') {
        throw new Error('Last sync timestamp is required');
      }

      const response = await fetchWithAuth<SyncPushResponse>('/api/sync/push', {
        method: 'POST',
        body: JSON.stringify({
          device_id: input.device_id,
          entity_type: input.entity_type,
          changes: input.changes,
          last_sync: input.last_sync,
        }),
      });

      return {
        conflicts: response.conflicts || [],
        server_timestamp: response.server_timestamp,
      };
    },
    retry: 2,
  });
}

// ============================================================================
// Sync Pull Hook
// ============================================================================

export interface SyncChange {
  entity_type: string;
  data: unknown;
  version: number;
}

export interface SyncPullInput {
  device_id: string;
  last_sync: number;
}

export interface SyncPullResponse {
  changes: SyncChange[];
  server_timestamp: number;
}

/**
 * Hook to pull server changes since last sync
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useSyncPull({
 *   device_id: 'device-123',
 *   last_sync: lastSyncTimestamp,
 * });
 *
 * if (data) {
 *   data.changes.forEach(change => {
 *     console.log(`Entity: ${change.entity_type}, Version: ${change.version}`);
 *     // Apply change to local state
 *   });
 *
 *   // Update last sync timestamp
 *   localStorage.setItem('last_sync', data.server_timestamp.toString());
 * }
 * ```
 */
export function useSyncPull(
  input: SyncPullInput
): UseQueryResult<SyncPullResponse, Error> {
  return useQuery({
    queryKey: ['sync', 'pull', input.device_id, input.last_sync],
    queryFn: async (): Promise<SyncPullResponse> => {
      if (!input.device_id) {
        throw new Error('Device ID is required');
      }
      if (typeof input.last_sync !== 'number') {
        throw new Error('Last sync timestamp is required');
      }

      const params = new URLSearchParams({
        device_id: input.device_id,
        last_sync: input.last_sync.toString(),
      });

      const response = await fetchWithAuth<SyncPullResponse>(
        `/api/sync/pull?${params.toString()}`
      );

      return {
        changes: response.changes || [],
        server_timestamp: response.server_timestamp,
      };
    },
    enabled: Boolean(input.device_id && typeof input.last_sync === 'number'),
    staleTime: 0, // Always fetch fresh data
    retry: 3,
    refetchOnWindowFocus: true, // Sync when user returns to the app
  });
}

// ============================================================================
// Device Registration Hook
// ============================================================================

export interface DeviceRegisterInput {
  device_name: string;
  device_type: string;
  push_token?: string;
}

export interface DeviceRegisterResponse {
  device_id: string;
  encryption_key: string;
}

/**
 * Hook to register a device for sync
 *
 * @example
 * ```tsx
 * const registerDevice = useDeviceRegister();
 *
 * const handleRegisterDevice = async () => {
 *   try {
 *     const result = await registerDevice.mutateAsync({
 *       device_name: 'My iPhone',
 *       device_type: 'ios',
 *       push_token: 'apns-token-here',
 *     });
 *
 *     // Store device_id and encryption_key securely
 *     localStorage.setItem('device_id', result.device_id);
 *     localStorage.setItem('encryption_key', result.encryption_key);
 *   } catch (error) {
 *     console.error('Device registration failed:', error);
 *   }
 * };
 * ```
 */
export function useDeviceRegister(): UseMutationResult<
  DeviceRegisterResponse,
  Error,
  DeviceRegisterInput
> {
  return useMutation({
    mutationFn: async (input: DeviceRegisterInput): Promise<DeviceRegisterResponse> => {
      if (!input.device_name || input.device_name.trim() === '') {
        throw new Error('Device name is required');
      }
      if (!input.device_type || input.device_type.trim() === '') {
        throw new Error('Device type is required');
      }

      const response = await fetchWithAuth<DeviceRegisterResponse>('/api/sync/register-device', {
        method: 'POST',
        body: JSON.stringify({
          device_name: input.device_name,
          device_type: input.device_type,
          ...(input.push_token && { push_token: input.push_token }),
        }),
      });

      if (!response.device_id || !response.encryption_key) {
        throw new Error('Invalid response from device registration');
      }

      return response;
    },
    retry: 1,
  });
}
