export interface DeviceConfig {
  device_id: string;
  device_type: DeviceType;
  port: number;
  reload_port: number;
  [key: string]: any; // Allow dynamic fields
}

export type DeviceType =
  | 'jetson_orin'
  | 'jetson_xavier'
  | 'jetson'
  | 'raspberry_pi'
  | 'orange_pi'
  | 'lattepanda'
  | 'shelly';

export type DeviceStatus = 'healthy' | 'unhealthy' | 'unreachable' | 'unknown';

export interface DeviceState {
  device_id: string;
  device_type: DeviceType;
  ip_address: string;
  port: number;
  reload_port: number;
  status: DeviceStatus;
  last_seen?: string;
  error?: string;
}

export interface DevicesResponse {
  devices: DeviceState[];
  total: number;
  healthy: number;
  unhealthy: number;
}

export interface ConfigsResponse {
  configs: DeviceConfig[];
  total: number;
}

export interface MetricsSummary {
  total: number;
  healthy: number;
  unhealthy: number;
  by_device_type: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface ReloadResult {
  device_id: string;
  status: string;
  error?: string;
}

export interface BulkReloadResponse {
  results: ReloadResult[];
  total: number;
  success: number;
  failed: number;
}
