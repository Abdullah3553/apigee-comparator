import type { RefreshResult } from '../../hooks/useRefresh';
import './RefreshSummary.css';

interface RefreshSummaryProps {
  result: RefreshResult;
  onClose: () => void;
}

export function RefreshSummary({ result, onClose }: RefreshSummaryProps) {
  const { summary, failures } = result;
  const totalEntities = Object.values(summary.entitiesFetched).reduce((a, b) => a + b, 0);

  return (
    <div className="refresh-summary-overlay" onClick={onClose}>
      <div className="refresh-summary" onClick={(e) => e.stopPropagation()}>
        <div className="refresh-summary__header">
          <h3 className="refresh-summary__title">
            {result.success ? 'Refresh Complete' : 'Refresh Completed with Errors'}
          </h3>
          <button className="refresh-summary__close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="refresh-summary__content">
          <div className="refresh-summary__stats">
            <div className="refresh-summary__stat">
              <span className="refresh-summary__stat-value refresh-summary__stat-value--success">
                {summary.environmentsRefreshed}
              </span>
              <span className="refresh-summary__stat-label">Environments Refreshed</span>
            </div>
            {summary.environmentsFailed > 0 && (
              <div className="refresh-summary__stat">
                <span className="refresh-summary__stat-value refresh-summary__stat-value--error">
                  {summary.environmentsFailed}
                </span>
                <span className="refresh-summary__stat-label">Environments Failed</span>
              </div>
            )}
            <div className="refresh-summary__stat">
              <span className="refresh-summary__stat-value">
                {totalEntities}
              </span>
              <span className="refresh-summary__stat-label">Total Entities Fetched</span>
            </div>
          </div>

          <div className="refresh-summary__entities">
            <h4 className="refresh-summary__section-title">Entities Fetched</h4>
            <div className="refresh-summary__entity-grid">
              <EntityCount label="Apps" count={summary.entitiesFetched.apps} />
              <EntityCount label="Products" count={summary.entitiesFetched.products} />
              <EntityCount label="Proxies" count={summary.entitiesFetched.proxies} />
              <EntityCount label="Caches" count={summary.entitiesFetched.caches} />
              <EntityCount label="KVMs" count={summary.entitiesFetched.kvms} />
              <EntityCount label="Target Servers" count={summary.entitiesFetched.targetServers} />
              <EntityCount label="References" count={summary.entitiesFetched.references} />
              <EntityCount label="Keystores" count={summary.entitiesFetched.keystores} />
              <EntityCount label="Virtual Hosts" count={summary.entitiesFetched.virtualHosts} />
            </div>
          </div>

          {failures.length > 0 && (
            <div className="refresh-summary__failures">
              <h4 className="refresh-summary__section-title refresh-summary__section-title--error">
                Failures
              </h4>
              <ul className="refresh-summary__failure-list">
                {failures.map((failure, index) => (
                  <li key={index} className="refresh-summary__failure-item">
                    <strong>{failure.environment}:</strong> {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="refresh-summary__footer">
          <span className="refresh-summary__timestamp">
            Refreshed at: {new Date(result.refreshedAt).toLocaleString()}
          </span>
          <button className="refresh-summary__ok-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function EntityCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="refresh-summary__entity-count">
      <span className="refresh-summary__entity-count-value">{count}</span>
      <span className="refresh-summary__entity-count-label">{label}</span>
    </div>
  );
}
