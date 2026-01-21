import { useState } from 'react';
import { StatusIndicator } from '../common/StatusIcons';
import { IssueBadge } from '../common/IssueBadge';
import { EntityDetails } from '../EntityDetails/EntityDetails';
import type { ComparisonStatus, Difference } from '../../types/comparison.types';
import type { Entity, EntityType, Issue } from '../../types/entity.types';
import { formatDifferencePath, formatDifferenceValue } from '../../utils/comparison.utils';
import './ComparisonRow.css';

interface ComparisonRowProps {
  name: string;
  status: ComparisonStatus;
  env1Data?: Entity;
  env2Data?: Entity;
  differences?: Difference[];
  entityType?: EntityType;
  env1Identifier?: string;
  env2Identifier?: string;
  issues?: Issue[];
}

export function ComparisonRow({
  name,
  status,
  env1Data,
  env2Data,
  differences = [],
  entityType,
  env1Identifier,
  env2Identifier,
  issues = [],
}: ComparisonRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasDetails = differences.length > 0 || env1Data || env2Data;

  return (
    <div className={`comparison-row comparison-row--${status}`}>
      <div
        className="comparison-row__header"
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="comparison-row__status">
          <StatusIndicator status={status} />
        </div>
        <div className="comparison-row__name">{name}</div>
        {issues.length > 0 && (
          <div className="comparison-row__issues">
            {issues.map((issue, idx) => (
              <IssueBadge key={idx} issue={issue} />
            ))}
          </div>
        )}
        {hasDetails && (
          <div className="comparison-row__expand">
            <span className={`comparison-row__chevron ${isExpanded ? 'comparison-row__chevron--expanded' : ''}`}>
              &#9654;
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="comparison-row__details">
          {differences.length > 0 && (
            <div className="comparison-row__differences">
              <h4 className="comparison-row__section-title">Differences ({differences.length})</h4>
              <table className="comparison-row__diff-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Env 1 Value</th>
                    <th>Env 2 Value</th>
                  </tr>
                </thead>
                <tbody>
                  {differences.map((diff, index) => (
                    <tr key={index}>
                      <td className="comparison-row__diff-path">
                        {formatDifferencePath(diff.path)}
                      </td>
                      <td className="comparison-row__diff-value comparison-row__diff-value--env1">
                        <pre>{formatDifferenceValue(diff.env1Value)}</pre>
                      </td>
                      <td className="comparison-row__diff-value comparison-row__diff-value--env2">
                        <pre>{formatDifferenceValue(diff.env2Value)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {entityType && (
            <EntityDetails
              entityType={entityType}
              name={name}
              env1Data={env1Data}
              env2Data={env2Data}
              env1Identifier={env1Identifier}
              env2Identifier={env2Identifier}
            />
          )}

          {!entityType && status === 'only-in-env1' && env1Data && (
            <div className="comparison-row__single-data">
              <h4 className="comparison-row__section-title">Entity Data (Env 1 only)</h4>
              <pre className="comparison-row__json">
                {JSON.stringify(env1Data, null, 2)}
              </pre>
            </div>
          )}

          {!entityType && status === 'only-in-env2' && env2Data && (
            <div className="comparison-row__single-data">
              <h4 className="comparison-row__section-title">Entity Data (Env 2 only)</h4>
              <pre className="comparison-row__json">
                {JSON.stringify(env2Data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
