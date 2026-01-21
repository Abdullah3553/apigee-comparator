import { useState } from 'react';
import { useRefreshAll } from '../../hooks/useRefresh';
import { RefreshSummary } from '../common/RefreshSummary';
import type { RefreshResult } from '../../hooks/useRefresh';
import './RefreshButton.css';

export function RefreshButton() {
  const [showSummary, setShowSummary] = useState(false);
  const [lastResult, setLastResult] = useState<RefreshResult | null>(null);
  const { mutate: refreshAll, isPending } = useRefreshAll();

  const handleRefresh = () => {
    refreshAll(undefined, {
      onSuccess: (result) => {
        setLastResult(result);
        setShowSummary(true);
      },
      onError: (error) => {
        setLastResult({
          success: false,
          refreshedAt: new Date().toISOString(),
          summary: {
            environmentsRefreshed: 0,
            environmentsFailed: 0,
            entitiesFetched: {
              apps: 0,
              products: 0,
              proxies: 0,
              caches: 0,
              kvms: 0,
              targetServers: 0,
              references: 0,
              keystores: 0,
              virtualHosts: 0,
            },
          },
          failures: [{ environment: 'All', error: error.message }],
        });
        setShowSummary(true);
      },
    });
  };

  return (
    <>
      <button
        className={`refresh-button ${isPending ? 'refresh-button--loading' : ''}`}
        onClick={handleRefresh}
        disabled={isPending}
        title="Refresh all environments from Apigee"
      >
        <svg
          className={`refresh-button__icon ${isPending ? 'refresh-button__icon--spinning' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <span className="refresh-button__text">
          {isPending ? 'Refreshing...' : 'Refresh All'}
        </span>
      </button>

      {showSummary && lastResult && (
        <RefreshSummary
          result={lastResult}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
}
