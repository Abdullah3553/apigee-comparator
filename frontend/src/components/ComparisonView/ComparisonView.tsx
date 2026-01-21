import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useComparison } from '../../hooks/useComparison';
import { ComparisonRow } from './ComparisonRow';
import { ComparisonSummary } from './ComparisonSummary';
import './ComparisonView.css';

export function ComparisonView() {
  const { env1, env2, entityType } = useEnvironment();
  const { data, isLoading, error } = useComparison(env1, env2, entityType);

  if (!env1 || !env2) {
    return (
      <div className="comparison-view__placeholder">
        <p>Select two environments to compare</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="comparison-view__loading">
        <div className="comparison-view__spinner" />
        <p>Loading comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-view__error">
        <p>Error loading comparison: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { comparison } = data;
  const { matched, different, onlyInEnv1, onlyInEnv2, summary } = comparison;

  const hasResults = matched.length > 0 || different.length > 0 || onlyInEnv1.length > 0 || onlyInEnv2.length > 0;

  return (
    <div className="comparison-view">
      <ComparisonSummary
        summary={summary}
        env1Label={env1}
        env2Label={env2}
      />

      {!hasResults && (
        <div className="comparison-view__empty">
          <p>No entities found in either environment</p>
        </div>
      )}

      {different.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Different ({different.length})
          </h3>
          <div className="comparison-view__rows">
            {different.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="different"
                env1Data={entity.env1Data}
                env2Data={entity.env2Data}
                differences={entity.differences}
                entityType={entityType}
                env1Identifier={env1}
                env2Identifier={env2}
              />
            ))}
          </div>
        </section>
      )}

      {onlyInEnv1.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Only in {env1} ({onlyInEnv1.length})
          </h3>
          <div className="comparison-view__rows">
            {onlyInEnv1.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="only-in-env1"
                env1Data={entity.data}
                entityType={entityType}
                env1Identifier={env1}
              />
            ))}
          </div>
        </section>
      )}

      {onlyInEnv2.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Only in {env2} ({onlyInEnv2.length})
          </h3>
          <div className="comparison-view__rows">
            {onlyInEnv2.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="only-in-env2"
                env2Data={entity.data}
                entityType={entityType}
                env2Identifier={env2}
              />
            ))}
          </div>
        </section>
      )}

      {matched.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Matched ({matched.length})
          </h3>
          <div className="comparison-view__rows">
            {matched.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="matched"
                env1Data={entity.env1Data}
                env2Data={entity.env2Data}
                entityType={entityType}
                env1Identifier={env1}
                env2Identifier={env2}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
