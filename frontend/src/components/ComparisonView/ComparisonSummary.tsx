import type { ComparisonSummary as ComparisonSummaryType } from '../../types/comparison.types';
import { calculateMatchPercentage } from '../../utils/comparison.utils';
import { MatchedIcon, DifferentIcon, MissingIcon } from '../common/StatusIcons';
import './ComparisonSummary.css';

interface ComparisonSummaryProps {
  summary: ComparisonSummaryType;
  env1Label: string;
  env2Label: string;
}

export function ComparisonSummary({ summary, env1Label, env2Label }: ComparisonSummaryProps) {
  const matchPercentage = calculateMatchPercentage(
    summary.matched,
    summary.different,
    summary.onlyInEnv1,
    summary.onlyInEnv2,
  );

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
    </div>
  );
}
