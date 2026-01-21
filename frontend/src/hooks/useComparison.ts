import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { ComparisonResponse } from '../types/comparison.types';
import type { EntityType } from '../types/entity.types';

export const comparisonKeys = {
  all: ['comparison'] as const,
  compare: (env1: string, env2: string, entityType: EntityType) =>
    [...comparisonKeys.all, env1, env2, entityType] as const,
};

export function useComparison(
  env1: string | null,
  env2: string | null,
  entityType: EntityType,
) {
  return useQuery({
    queryKey: comparisonKeys.compare(env1 || '', env2 || '', entityType),
    queryFn: async (): Promise<ComparisonResponse> => {
      if (!env1 || !env2) {
        throw new Error('Both environments must be selected');
      }
      const response = await api.get('/compare', {
        params: { env1, env2, entityType },
      });
      return response.data;
    },
    enabled: !!env1 && !!env2,
    staleTime: 30 * 1000, // 30 seconds
  });
}
