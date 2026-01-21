import type { ComparisonStatus, Difference } from '../types/comparison.types';

export function getComparisonStatusLabel(status: ComparisonStatus): string {
  switch (status) {
    case 'matched':
      return 'Matched';
    case 'different':
      return 'Different';
    case 'only-in-env1':
      return 'Only in Env 1';
    case 'only-in-env2':
      return 'Only in Env 2';
    default:
      return 'Unknown';
  }
}

export function getComparisonStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case 'matched':
      return '#10b981'; // green
    case 'different':
      return '#f59e0b'; // amber
    case 'only-in-env1':
    case 'only-in-env2':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

export function formatDifferencePath(path: string): string {
  return path.split('.').join(' > ');
}

export function formatDifferenceValue(value: any): string {
  if (value === undefined) {
    return '(not set)';
  }
  if (value === null) {
    return '(null)';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function groupDifferencesByCategory(differences: Difference[]): Record<string, Difference[]> {
  const groups: Record<string, Difference[]> = {};

  for (const diff of differences) {
    const category = diff.path.split('.')[0] || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(diff);
  }

  return groups;
}

export function calculateMatchPercentage(
  matched: number,
  different: number,
  onlyInEnv1: number,
  onlyInEnv2: number,
): number {
  const total = matched + different + onlyInEnv1 + onlyInEnv2;
  if (total === 0) {
    return 100;
  }
  return Math.round((matched / total) * 100);
}
