export interface HealthResponse {
  status: string;
  mongodb?: string;
  fireSync?: { isRunning: boolean; lastSyncTime: string | null; interval?: string } | null;
  gistempSync?: { isRunning: boolean; lastSyncTime: string | null; interval?: string } | null;
  seaLevelSync?: { isRunning: boolean; lastSyncTime: string | null; interval?: string } | null;
  openMeteo?: { mode: string; basePath: string };
  usgsEarthquakes?: { mode: string; basePath: string };
  nasaEonet?: { mode: string; basePath: string; apiVersion?: string };
  openAq?: { enabled: boolean; basePath?: string; hint?: string };
  globalForestWatch?: { hasApiKey?: boolean; queryRequiresKey?: boolean; basePath?: string };
  oceanPollution?: { basePath?: string };
  glaciers?: { mode?: string; basePath?: string; source?: string };
  globe?: Record<string, unknown>;
  extinction?: { enabled?: boolean; mode?: string } | { enabled: false; hint?: string };
}
