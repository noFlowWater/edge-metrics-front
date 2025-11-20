import type {
  DeviceConfig,
  DevicesResponse,
  ConfigsResponse,
  MetricsSummary,
  HealthResponse,
  DeviceState,
  BulkReloadResponse,
} from '~/types/device';

// 환경변수에서 API URL 가져오기 (Kubernetes 배포 시 설정)
// 개발 환경: vite.config.ts의 proxy 사용 (/api -> localhost:8081)
// 프로덕션: 환경변수 API_URL 또는 기본값 /api 사용
const API_BASE = typeof process !== 'undefined' && process.env.API_URL
  ? process.env.API_URL
  : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health
  health: () => request<HealthResponse>('/health'),

  // Configs
  getConfigs: () => request<ConfigsResponse>('/config'),
  getConfig: (deviceId: string) => request<DeviceConfig>(`/config/${deviceId}`),
  createConfig: (deviceId: string, config: Omit<DeviceConfig, 'device_id'>) =>
    request<{ status: string; device_id: string }>(`/config/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  updateConfig: (deviceId: string, config: Omit<DeviceConfig, 'device_id'>) =>
    request<{ status: string; device_id: string; reload_triggered: boolean }>(
      `/config/${deviceId}`,
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    ),
  patchConfig: (deviceId: string, config: Partial<DeviceConfig>) =>
    request<{ status: string; device_id: string; reload_triggered: boolean }>(
      `/config/${deviceId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(config),
      }
    ),
  deleteConfig: (deviceId: string) =>
    request<{ status: string; device_id: string }>(`/config/${deviceId}`, {
      method: 'DELETE',
    }),

  // Devices
  getDevices: () => request<DevicesResponse>('/devices'),
  getDeviceStatus: (deviceId: string) =>
    request<DeviceState>(`/devices/${deviceId}/status`),
  reloadDevice: (deviceId: string) =>
    request<{ status: string; device_id: string; error?: string }>(
      `/devices/${deviceId}/reload`,
      { method: 'POST' }
    ),
  reloadAllDevices: () =>
    request<BulkReloadResponse>('/devices/reload', { method: 'POST' }),

  // Metrics
  getMetricsSummary: () => request<MetricsSummary>('/metrics/summary'),
};
