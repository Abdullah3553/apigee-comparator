import type { ComparisonSummary as ComparisonSummaryType } from '../../types/comparison.types';
import type { Issue } from '../../types/entity.types';
import { calculateMatchPercentage } from '../../utils/comparison.utils';
import { MatchedIcon, DifferentIcon, MissingIcon } from '../common/StatusIcons';
import './ComparisonSummary.css';

interface ComparisonSummaryProps {
  summary: ComparisonSummaryType;
  env1Label: string;
  env2Label: string;
  issues?: {
    env1: Issue[];
    env2: Issue[];
  };
}

export function ComparisonSummary({ summary, env1Label, env2Label, issues }: ComparisonSummaryProps) {
  const matchPercentage = calculateMatchPercentage(
    summary.matched,
    summary.different,
    summary.onlyInEnv1,
    summary.onlyInEnv2,
  );

  const env1Issues = issues?.env1 || [];
  const env2Issues = issues?.env2 || [];
  const totalIssues = env1Issues.length + env2Issues.length;
  const criticalCount = [...env1Issues, ...env2Issues].filter((i) => i.severity === 'critical').length;
  const warningCount = [...env1Issues, ...env2Issues].filter((i) => i.severity === 'warning').length;

  return (
    <div className="comparison-summary">
      <div className="comparison-summary__header">
        <h3 className="comparison-summary__title">Comparison Summary</h3>
        <div className="comparison-summary__percentage">
          <span className="comparison-summary__percentage-value">{matchPercentage}%</span>
          <span className="comparison-summary__percentage-label">match rate</span>
        </div>
      </div>

      <div className="comparison-summary__stats">
        <div className="comparison-summary__stat comparison-summary__stat--matched">
          <div className="comparison-summary__stat-icon">
            <MatchedIcon size={20} />
          </div>
          <div className="comparison-summary__stat-content">
            <span className="comparison-summary__stat-value">{summary.matched}</span>
            <span className="comparison-summary__stat-label">Matched</span>
          </div>
        </div>

        <div className="comparison-summary__stat comparison-summary__stat--different">
          <div className="comparison-summary__stat-icon">
            <DifferentIcon size={20} />
          </div>
          <div className="comparison-summary__stat-content">
            <span className="comparison-summary__stat-value">{summary.different}</span>
            <span className="comparison-summary__stat-label">Different</span>
          </div>
        </div>

        <div className="comparison-summary__stat comparison-summary__stat--missing">
          <div className="comparison-summary__stat-icon">
            <MissingIcon size={20} />
          </div>
          <div className="comparison-summary__stat-content">
            <span className="comparison-summary__stat-value">{summary.onlyInEnv1}</span>
            <span className="comparison-summary__stat-label">Only in {env1Label}</span>
          </div>
        </div>

        <div className="comparison-summary__stat comparison-summary__stat--missing">
          <div className="comparison-summary__stat-icon">
            <MissingIcon size={20} />
          </div>
          <div className="comparison-summary__stat-content">
            <span className="comparison-summary__stat-value">{summary.onlyInEnv2}</span>
            <span className="comparison-summary__stat-label">Only in {env2Label}</span>
          </div>
        </div>
      </div>

      <div className="comparison-summary__totals">
        <span>Total in {env1Label}: {summary.totalEnv1}</span>
        <span>Total in {env2Label}: {summary.totalEnv2}</span>
      </div>

      {totalIssues > 0 && (
        <div className="comparison-summary__issues">
          <div className="comparison-summary__issues-header">
            <span className="comparison-summary__issues-title">Issues Detected</span>
            <span className="comparison-summary__issues-total">{totalIssues} total</span>
          </div>
          <div className="comparison-summary__issues-breakdown">
            {criticalCount > 0 && (
              <span className="comparison-summary__issue-count comparison-summary__issue-count--critical">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="comparison-summary__issue-count comparison-summary__issue-count--warning">
                {warningCount} warning
              </span>
            )}
            {env1Issues.length > 0 && (
              <span className="comparison-summary__issue-env">
                {env1Issues.length} in {env1Label}
              </span>
            )}
            {env2Issues.length > 0 && (
              <span className="comparison-summary__issue-env">
                {env2Issues.length} in {env2Label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
