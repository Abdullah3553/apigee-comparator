import { useMemo } from 'react';
import type { Issue } from '../types/entity.types';

interface UseIssuesOptions {
  entityName?: string;
}

export function useIssues(issues: Issue[] = [], options: UseIssuesOptions = {}) {
  const { entityName } = options;

  const filteredIssues = useMemo(() => {
    if (!entityName) {
      return issues;
    }
    return issues.filter((issue) => issue.entityName === entityName);
  }, [issues, entityName]);

  const issuesByEntity = useMemo(() => {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.entityName]) {
        acc[issue.entityName] = [];
      }
      acc[issue.entityName].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);
  }, [issues]);

  const summary = useMemo(() => {
    return {
      total: filteredIssues.length,
      critical: filteredIssues.filter((i) => i.severity === 'critical').length,
      warning: filteredIssues.filter((i) => i.severity === 'warning').length,
      info: filteredIssues.filter((i) => i.severity === 'info').length,
    };
  }, [filteredIssues]);

  const hasIssues = filteredIssues.length > 0;
  const hasCritical = summary.critical > 0;
  const hasWarning = summary.warning > 0;

  return {
    issues: filteredIssues,
    issuesByEntity,
    summary,
    hasIssues,
    hasCritical,
    hasWarning,
    getIssuesForEntity: (name: string) => issuesByEntity[name] || [],
  };
}
