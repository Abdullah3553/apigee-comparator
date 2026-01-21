import type { Entity } from '../../types/entity.types';
import { DiffHighlight, SingleValue } from '../common/DiffHighlight';
import './EntityDetails.css';

interface AppDetailsProps {
  env1Data?: Entity;
  env2Data?: Entity;
}

export function AppDetails({ env1Data, env2Data }: AppDetailsProps) {
  const isBothEnvs = !!env1Data && !!env2Data;

  if (!isBothEnvs) {
    const data = env1Data || env2Data;
    if (!data) return null;

    return (
      <div className="entity-details">
        <div className="entity-details__section">
          <h4 className="entity-details__section-title">App Details</h4>
          <SingleValue label="Status" value={data.status} isEnv1={!!env1Data} />
          <SingleValue label="Developer ID" value={data.developerId} isEnv1={!!env1Data} />
          <SingleValue label="App ID" value={data.appId} isEnv1={!!env1Data} />
        </div>

        {data.credentials && (
          <div className="entity-details__section">
            <h4 className="entity-details__section-title">
              Credentials ({data.credentials.length})
            </h4>
            {data.credentials.map((cred: any, index: number) => (
              <SingleValue
                key={index}
                label={`Credential ${index + 1}`}
                value={{
                  consumerKey: cred.consumerKey?.substring(0, 8) + '...',
                  status: cred.status,
                  expiresAt: cred.expiresAt,
                  apiProducts: cred.apiProducts?.map((p: any) => p.apiproduct),
                }}
                isEnv1={!!env1Data}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="entity-details">
      <div className="entity-details__section">
        <h4 className="entity-details__section-title">App Details</h4>
        <DiffHighlight label="Status" env1Value={env1Data.status} env2Value={env2Data.status} />
        <DiffHighlight label="Developer ID" env1Value={env1Data.developerId} env2Value={env2Data.developerId} />
        <DiffHighlight label="App ID" env1Value={env1Data.appId} env2Value={env2Data.appId} />
      </div>

      <div className="entity-details__section">
        <h4 className="entity-details__section-title">Credentials</h4>
        <CredentialsComparison
          env1Credentials={env1Data.credentials}
          env2Credentials={env2Data.credentials}
        />
      </div>
    </div>
  );
}

interface CredentialsComparisonProps {
  env1Credentials?: any[];
  env2Credentials?: any[];
}

function CredentialsComparison({ env1Credentials, env2Credentials }: CredentialsComparisonProps) {
  const maxLen = Math.max(env1Credentials?.length || 0, env2Credentials?.length || 0);

  if (maxLen === 0) {
    return <div className="entity-details__loading">No credentials found</div>;
  }

  return (
    <>
      {Array.from({ length: maxLen }).map((_, index) => {
        const cred1 = env1Credentials?.[index];
        const cred2 = env2Credentials?.[index];
        return (
          <DiffHighlight
            key={index}
            label={`Credential ${index + 1}`}
            env1Value={cred1 ? {
              consumerKey: cred1.consumerKey?.substring(0, 8) + '...',
              status: cred1.status,
              apiProducts: cred1.apiProducts?.map((p: any) => p.apiproduct),
            } : undefined}
            env2Value={cred2 ? {
              consumerKey: cred2.consumerKey?.substring(0, 8) + '...',
              status: cred2.status,
              apiProducts: cred2.apiProducts?.map((p: any) => p.apiproduct),
            } : undefined}
          />
        );
      })}
    </>
  );
}
