import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { environmentKeys } from './useEnvironments';
import { comparisonKeys } from './useComparison';

export interface RefreshSummary {
  environmentsRefreshed: number;
  environmentsFailed: number;
  entitiesFetched: {
    apps: number;
    products: number;
    proxies: number;
    caches: number;
    kvms: number;
    targetServers: number;
    references: number;
    keystores: number;
    virtualHosts: number;
  };
}

export interface RefreshFailure {
  environment: string;
  error: string;
}

export interface RefreshResult {
  success: boolean;
  refreshedAt: string;
  summary: RefreshSummary;
  failures: RefreshFailure[];
}

export interface EnvironmentRefreshResult {
  environment: string;
  success: boolean;
  refreshedAt: string;
  entitiesFetched: Record<string, number>;
  error?: string;
}

export function useRefreshAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RefreshResult> => {
      const response = await api.post('/refresh');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.all });
      queryClient.invalidateQueries({ queryKey: comparisonKeys.all });
    },
  });
}

export function useRefreshEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identifier: string): Promise<EnvironmentRefreshResult> => {
      const response = await api.post(`/refresh/${identifier}`);
      return response.data;
    },
    onSuccess: (_, identifier) => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.detail(identifier) });
      queryClient.invalidateQueries({ queryKey: comparisonKeys.all });
    },
  });
}
