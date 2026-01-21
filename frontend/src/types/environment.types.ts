export interface InstanceConfig {
  name: string;
  org: string;
  environments: string[];
}

export interface EnvironmentDetails {
  identifier: string;
  instance: string;
  org: string;
  environment: string;
  lastRefreshedAt: string | null;
  status: 'pending' | 'refreshing' | 'success' | 'failed';
  error: string | null;
}

export interface ConfigResponse {
  instances: InstanceConfig[];
}

export interface EnvironmentsResponse {
  environments: string[];
}
