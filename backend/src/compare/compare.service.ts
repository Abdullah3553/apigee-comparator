import { Injectable, BadRequestException } from '@nestjs/common';
import { EntitiesService, EntityType } from '../entities/entities.service';
import { IssueDetectionService, Issue } from '../entities/issue-detection.service';

export interface Difference {
  path: string;
  env1Value: any;
  env2Value: any;
}

export interface MatchedEntity {
  name: string;
  env1Data: Record<string, any>;
  env2Data: Record<string, any>;
}

export interface DifferentEntity {
  name: string;
  env1Data: Record<string, any>;
  env2Data: Record<string, any>;
  differences: Difference[];
}

export interface SingleEnvEntity {
  name: string;
  data: Record<string, any>;
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

@Injectable()
export class CompareService {
  constructor(
    private readonly entitiesService: EntitiesService,
    private readonly issueDetectionService: IssueDetectionService,
  ) {}

  async compareEnvironments(
    env1: string,
    env2: string,
    entityType: EntityType,
  ): Promise<ComparisonResult> {
    if (env1 === env2) {
      throw new BadRequestException('Cannot compare an environment with itself');
    }

    const [env1Entities, env2Entities] = await Promise.all([
      this.entitiesService.getEntitiesByType(env1, entityType),
      this.entitiesService.getEntitiesByType(env2, entityType),
    ]);

    const env1Map = new Map(env1Entities.map((e) => [e.name, e]));
    const env2Map = new Map(env2Entities.map((e) => [e.name, e]));

    const matched: MatchedEntity[] = [];
    const different: DifferentEntity[] = [];
    const onlyInEnv1: SingleEnvEntity[] = [];
    const onlyInEnv2: SingleEnvEntity[] = [];

    for (const [name, entity1] of env1Map) {
      const entity2 = env2Map.get(name);

      if (!entity2) {
        onlyInEnv1.push({
          name,
          data: this.sanitizeEntity(entity1),
        });
      } else {
        const sanitized1 = this.sanitizeEntity(entity1);
        const sanitized2 = this.sanitizeEntity(entity2);
        const differences = this.findDifferences(sanitized1, sanitized2);

        if (differences.length === 0) {
          matched.push({
            name,
            env1Data: sanitized1,
            env2Data: sanitized2,
          });
        } else {
          different.push({
            name,
            env1Data: sanitized1,
            env2Data: sanitized2,
            differences,
          });
        }
      }
    }

    for (const [name, entity2] of env2Map) {
      if (!env1Map.has(name)) {
        onlyInEnv2.push({
          name,
          data: this.sanitizeEntity(entity2),
        });
      }
    }

    const env1Issues = this.issueDetectionService.detectIssues(entityType, env1Entities);
    const env2Issues = this.issueDetectionService.detectIssues(entityType, env2Entities);

    return {
      matched,
      different,
      onlyInEnv1,
      onlyInEnv2,
      summary: {
        totalEnv1: env1Entities.length,
        totalEnv2: env2Entities.length,
        matched: matched.length,
        different: different.length,
        onlyInEnv1: onlyInEnv1.length,
        onlyInEnv2: onlyInEnv2.length,
      },
      issues: {
        env1: env1Issues,
        env2: env2Issues,
      },
    };
  }

  private sanitizeEntity(entity: any): Record<string, any> {
    const { id, environment_id, environment, fetched_at, ...rest } = entity;
    return rest;
  }

  private findDifferences(
    obj1: Record<string, any>,
    obj2: Record<string, any>,
    basePath = '',
  ): Difference[] {
    const differences: Difference[] = [];
    const fieldsToIgnore = ['id', 'environment_id', 'fetched_at', 'created_at', 'updated_at'];

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      if (fieldsToIgnore.includes(key)) {
        continue;
      }

      const path = basePath ? `${basePath}.${key}` : key;
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (val1 === undefined && val2 === undefined) {
        continue;
      }

      if (val1 === undefined) {
        differences.push({ path, env1Value: undefined, env2Value: val2 });
        continue;
      }

      if (val2 === undefined) {
        differences.push({ path, env1Value: val1, env2Value: undefined });
        continue;
      }

      if (this.isObject(val1) && this.isObject(val2)) {
        if (Array.isArray(val1) && Array.isArray(val2)) {
          if (!this.arraysEqual(val1, val2)) {
            differences.push({ path, env1Value: val1, env2Value: val2 });
          }
        } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
          differences.push(...this.findDifferences(val1, val2, path));
        } else {
          differences.push({ path, env1Value: val1, env2Value: val2 });
        }
      } else if (val1 !== val2) {
        differences.push({ path, env1Value: val1, env2Value: val2 });
      }
    }

    return differences;
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    const sorted1 = this.sortForComparison(arr1);
    const sorted2 = this.sortForComparison(arr2);

    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  }

  private sortForComparison(arr: any[]): any[] {
    return [...arr].sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }
      if (typeof a === 'object' && typeof b === 'object') {
        const aKey = a.name || a.key || JSON.stringify(a);
        const bKey = b.name || b.key || JSON.stringify(b);
        return String(aKey).localeCompare(String(bKey));
      }
      return String(a).localeCompare(String(b));
    });
  }
}
