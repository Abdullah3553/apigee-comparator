import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { ConfigResponse, EnvironmentDetails } from '../types/environment.types';

export const environmentKeys = {
  all: ['environments'] as const,
  config: () => [...environmentKeys.all, 'config'] as const,
  list: () => [...environmentKeys.all, 'list'] as const,
  detail: (identifier: string) => [...environmentKeys.all, 'detail', identifier] as const,
};

export function useConfig() {
  return useQuery({
    queryKey: environmentKeys.config(),
    queryFn: async (): Promise<ConfigResponse> => {
      const response = await api.get('/config');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Config rarely changes, cache for 5 minutes
  });
}

export function useEnvironments() {
  return useQuery({
    queryKey: environmentKeys.list(),
    queryFn: async (): Promise<string[]> => {
      const response = await api.get('/config/environments');
      return response.data.environments;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnvironmentDetails(identifier: string | null) {
  return useQuery({
    queryKey: environmentKeys.detail(identifier || ''),
    queryFn: async (): Promise<EnvironmentDetails> => {
      if (!identifier) throw new Error('No identifier provided');
      const response = await api.get(`/config/environments/${identifier}`);
      return response.data;
    },
    enabled: !!identifier,
  });
}
