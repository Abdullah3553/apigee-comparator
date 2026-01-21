import { useState } from 'react';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useEntities } from '../../hooks/useEntities';
import { useIssues } from '../../hooks/useIssues';
import { EntityDetails } from '../EntityDetails/EntityDetails';
import { IssueBadge, IssueSummary } from '../common/IssueBadge';
import type { Entity, Issue } from '../../types/entity.types';
import './SingleEnvView.css';

interface EntityRowProps {
  entity: Entity;
  entityType: string;
  envIdentifier: string;
  issues: Issue[];
}

function EntityRow({ entity, entityType, envIdentifier, issues }: EntityRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="entity-row">
      <div
        className="entity-row__header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="entity-row__name">{entity.name}</div>
        {issues.length > 0 && (
          <div className="entity-row__issues">
            {issues.map((issue, idx) => (
              <IssueBadge key={idx} issue={issue} />
            ))}
          </div>
        )}
        {entity.status && (
          <span className={`entity-row__status entity-row__status--${entity.status}`}>
            {entity.status}
          </span>
        )}
        <div className="entity-row__expand">
          <span className={`entity-row__chevron ${isExpanded ? 'entity-row__chevron--expanded' : ''}`}>
            &#9654;
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="entity-row__details">
          <EntityDetails
            entityType={entityType as any}
            name={entity.name}
            env1Data={entity}
            env1Identifier={envIdentifier}
          />
          <div className="entity-row__raw">
            <h4 className="entity-row__section-title">Raw Data</h4>
            <pre className="entity-row__json">
              {JSON.stringify(entity, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function SingleEnvView() {
  const { env1, entityType } = useEnvironment();
  const { data, isLoading, error } = useEntities(env1, entityType);
  const [searchFilter, setSearchFilter] = useState('');

  if (!env1) {
    return (
      <div className="single-env-view__placeholder">
        <p>Select an environment to view entities</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="single-env-view__loading">
        <div className="single-env-view__spinner" />
        <p>Loading entities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="single-env-view__error">
        <p>Error loading entities: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { data: entities, lastRefreshed, issues = [] } = data;
  const { getIssuesForEntity, summary: issueSummary } = useIssues(issues);

  const filteredEntities = searchFilter
    ? entities.filter((entity) =>
        entity.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : entities;

  return (
    <div className="single-env-view">
      <div className="single-env-view__header">
        <div className="single-env-view__info">
          <h2 className="single-env-view__title">{env1}</h2>
          <span className="single-env-view__count">
            {filteredEntities.length} {entityType}
            {filteredEntities.length !== entities.length && ` (of ${entities.length})`}
          </span>
          {lastRefreshed && (
            <span className="single-env-view__refreshed">
              Last refreshed: {new Date(lastRefreshed).toLocaleString()}
            </span>
          )}
          {issueSummary.total > 0 && (
            <IssueSummary issues={issues} />
          )}
        </div>
        <div className="single-env-view__search">
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="single-env-view__search-input"
          />
          {searchFilter && (
            <button
              className="single-env-view__search-clear"
              onClick={() => setSearchFilter('')}
              title="Clear filter"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {filteredEntities.length === 0 && (
        <div className="single-env-view__empty">
          {searchFilter ? (
            <p>No entities match "{searchFilter}"</p>
          ) : (
            <p>No {entityType} found in this environment</p>
          )}
        </div>
      )}

      <div className="single-env-view__list">
        {filteredEntities.map((entity) => (
          <EntityRow
            key={entity.name}
            entity={entity}
            entityType={entityType}
            envIdentifier={env1}
            issues={getIssuesForEntity(entity.name)}
          />
        ))}
      </div>
    </div>
  );
}

export default SingleEnvView;
