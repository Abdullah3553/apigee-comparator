import { Entity, EntityType, Issue } from './entity.types';

export type ComparisonStatus = 'matched' | 'different' | 'only-in-env1' | 'only-in-env2';

export interface Difference {
  path: string;
  env1Value: any;
  env2Value: any;
}

export interface MatchedEntity {
  name: string;
  env1Data: Entity;
  env2Data: Entity;
}

export interface DifferentEntity {
  name: string;
  env1Data: Entity;
  env2Data: Entity;
  differences: Difference[];
}

export interface SingleEnvEntity {
  name: string;
  data: Entity;
}

export interface ComparisonSummary {
  totalEnv1: number;
  totalEnv2: number;
  matched: number;
  different: number;
  onlyInEnv1: number;
  onlyInEnv2: number;
}

export interface ComparisonResult {
  matched: MatchedEntity[];
  different: DifferentEntity[];
  onlyInEnv1: SingleEnvEntity[];
  onlyInEnv2: SingleEnvEntity[];
  summary: ComparisonSummary;
  issues: {
    env1: Issue[];
    env2: Issue[];
  };
}

export interface ComparisonResponse {
  env1: string;
  env2: string;
  entityType: EntityType;
  comparison: ComparisonResult;
}
