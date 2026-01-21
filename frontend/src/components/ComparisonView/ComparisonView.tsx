import { useState, useMemo } from 'react';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useComparison } from '../../hooks/useComparison';
import { useIssues } from '../../hooks/useIssues';
import { ComparisonRow } from './ComparisonRow';
import { ComparisonSummary } from './ComparisonSummary';
import './ComparisonView.css';

export function ComparisonView() {
  const { env1, env2, entityType } = useEnvironment();
  const { data, isLoading, error } = useComparison(env1, env2, entityType);
  const [searchFilter, setSearchFilter] = useState('');

  // Extract data safely for hooks that need it
  const comparison = data?.comparison;
  const matched = comparison?.matched ?? [];
  const different = comparison?.different ?? [];
  const onlyInEnv1 = comparison?.onlyInEnv1 ?? [];
  const onlyInEnv2 = comparison?.onlyInEnv2 ?? [];
  const summary = comparison?.summary;
  const issues = comparison?.issues;

  // All hooks must be called unconditionally before any early returns
  const allIssues = useMemo(
    () => [...(issues?.env1 || []), ...(issues?.env2 || [])],
    [issues]
  );
  const { getIssuesForEntity } = useIssues(allIssues);

  const filteredDifferent = useMemo(() => {
    if (!searchFilter) return different;
    const lowerFilter = searchFilter.toLowerCase();
    return different.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [different, searchFilter]);

  const filteredOnlyInEnv1 = useMemo(() => {
    if (!searchFilter) return onlyInEnv1;
    const lowerFilter = searchFilter.toLowerCase();
    return onlyInEnv1.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [onlyInEnv1, searchFilter]);

  const filteredOnlyInEnv2 = useMemo(() => {
    if (!searchFilter) return onlyInEnv2;
    const lowerFilter = searchFilter.toLowerCase();
    return onlyInEnv2.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [onlyInEnv2, searchFilter]);

  const filteredMatched = useMemo(() => {
    if (!searchFilter) return matched;
    const lowerFilter = searchFilter.toLowerCase();
    return matched.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [matched, searchFilter]);

  // Early returns after all hooks
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

  if (!data || !summary) {
    return null;
  }

  const hasResults = matched.length > 0 || different.length > 0 || onlyInEnv1.length > 0 || onlyInEnv2.length > 0;
  const hasFilteredResults = filteredMatched.length > 0 || filteredDifferent.length > 0 || filteredOnlyInEnv1.length > 0 || filteredOnlyInEnv2.length > 0;

  return (
    <div className="comparison-view">
      <ComparisonSummary
        summary={summary}
        env1Label={env1}
        env2Label={env2}
        issues={issues}
      />

      {hasResults && (
        <div className="comparison-view__filter">
          <input
            type="text"
            placeholder="Filter entities by name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="comparison-view__filter-input"
          />
          {searchFilter && (
            <button
              className="comparison-view__filter-clear"
              onClick={() => setSearchFilter('')}
              title="Clear filter"
            >
              &times;
            </button>
          )}
        </div>
      )}

      {!hasResults && (
        <div className="comparison-view__empty">
          <p>No entities found in either environment</p>
        </div>
      )}

      {hasResults && !hasFilteredResults && searchFilter && (
        <div className="comparison-view__empty">
          <p>No entities match "{searchFilter}"</p>
        </div>
      )}

      {filteredDifferent.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Different ({filteredDifferent.length}{searchFilter && different.length !== filteredDifferent.length ? ` of ${different.length}` : ''})
          </h3>
          <div className="comparison-view__rows">
            {filteredDifferent.map((entity) => (
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
                issues={getIssuesForEntity(entity.name)}
              />
            ))}
          </div>
        </section>
      )}

      {filteredOnlyInEnv1.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Only in {env1} ({filteredOnlyInEnv1.length}{searchFilter && onlyInEnv1.length !== filteredOnlyInEnv1.length ? ` of ${onlyInEnv1.length}` : ''})
          </h3>
          <div className="comparison-view__rows">
            {filteredOnlyInEnv1.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="only-in-env1"
                env1Data={entity.data}
                entityType={entityType}
                env1Identifier={env1}
                issues={getIssuesForEntity(entity.name)}
              />
            ))}
          </div>
        </section>
      )}

      {filteredOnlyInEnv2.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Only in {env2} ({filteredOnlyInEnv2.length}{searchFilter && onlyInEnv2.length !== filteredOnlyInEnv2.length ? ` of ${onlyInEnv2.length}` : ''})
          </h3>
          <div className="comparison-view__rows">
            {filteredOnlyInEnv2.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="only-in-env2"
                env2Data={entity.data}
                entityType={entityType}
                env2Identifier={env2}
                issues={getIssuesForEntity(entity.name)}
              />
            ))}
          </div>
        </section>
      )}

      {filteredMatched.length > 0 && (
        <section className="comparison-view__section">
          <h3 className="comparison-view__section-title">
            Matched ({filteredMatched.length}{searchFilter && matched.length !== filteredMatched.length ? ` of ${matched.length}` : ''})
          </h3>
          <div className="comparison-view__rows">
            {filteredMatched.map((entity) => (
              <ComparisonRow
                key={entity.name}
                name={entity.name}
                status="matched"
                env1Data={entity.env1Data}
                env2Data={entity.env2Data}
                entityType={entityType}
                env1Identifier={env1}
                env2Identifier={env2}
                issues={getIssuesForEntity(entity.name)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
