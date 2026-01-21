import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { EntitiesResponse, EntityType } from '../types/entity.types';

export const entityKeys = {
  all: ['entities'] as const,
  byEnv: (env: string, entityType: EntityType) =>
    [...entityKeys.all, env, entityType] as const,
};

export function useEntities(
  environment: string | null,
  entityType: EntityType,
) {
  return useQuery({
    queryKey: entityKeys.byEnv(environment || '', entityType),
    queryFn: async (): Promise<EntitiesResponse> => {
      if (!environment) {
        throw new Error('Environment must be selected');
      }
      const response = await api.get(`/entities/${environment}/${entityType}`);
      return response.data;
    },
    enabled: !!environment,
    staleTime: 30 * 1000,
  });
}
