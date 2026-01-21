import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DiffHighlight, SingleValue } from '../common/DiffHighlight';
import './EntityDetails.css';

interface Certificate {
  alias: string;
  subject: string;
  issuer: string;
  expiresAt: string;
  serialNumber?: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  daysUntilExpiry?: number;
}

interface CertificatesResponse {
  keystoreName: string;
  environment: string;
  certificates: Certificate[];
}

interface KeystoreDetailsProps {
  keystoreName: string;
  env1Identifier: string;
  env2Identifier?: string;
  singleMode?: boolean;
}

export function KeystoreDetails({ keystoreName, env1Identifier, env2Identifier, singleMode }: KeystoreDetailsProps) {
  const { data: env1Data, isLoading: loading1 } = useQuery({
    queryKey: ['keystore-certs', env1Identifier, keystoreName],
    queryFn: async (): Promise<CertificatesResponse> => {
      const response = await api.get(`/entities/${env1Identifier}/keystores/${keystoreName}/certificates`);
      return response.data;
    },
    enabled: !!env1Identifier,
  });

  const { data: env2Data, isLoading: loading2 } = useQuery({
    queryKey: ['keystore-certs', env2Identifier, keystoreName],
    queryFn: async (): Promise<CertificatesResponse> => {
      const response = await api.get(`/entities/${env2Identifier}/keystores/${keystoreName}/certificates`);
      return response.data;
    },
    enabled: !!env2Identifier && !singleMode,
  });

  if (loading1 || loading2) {
    return <div className="entity-details__loading">Loading certificates...</div>;
  }

  if (singleMode && env1Data) {
    return (
      <div className="entity-details">
        <div className="entity-details__section">
          <h4 className="entity-details__section-title">
            Certificates ({env1Data.certificates.length})
          </h4>
          {env1Data.certificates.map((cert) => (
            <SingleValue
              key={cert.alias}
              label={cert.alias}
              value={{
                subject: cert.subject,
                issuer: cert.issuer,
                expiresAt: cert.expiresAt,
                isExpired: cert.isExpired,
                daysUntilExpiry: cert.daysUntilExpiry,
              }}
              isEnv1
            />
          ))}
        </div>
      </div>
    );
  }

  const allAliases = new Set([
    ...(env1Data?.certificates.map((c) => c.alias) || []),
    ...(env2Data?.certificates.map((c) => c.alias) || []),
  ]);

  const getCert = (certs: Certificate[] | undefined, alias: string): Certificate | undefined => {
    return certs?.find((c) => c.alias === alias);
  };

  return (
    <div className="entity-details">
      <div className="entity-details__section">
        <h4 className="entity-details__section-title">
          Certificates ({allAliases.size})
        </h4>
        {Array.from(allAliases).map((alias) => {
          const cert1 = getCert(env1Data?.certificates, alias);
          const cert2 = getCert(env2Data?.certificates, alias);
          return (
            <DiffHighlight
              key={alias}
              label={alias}
              env1Value={cert1 ? {
                subject: cert1.subject,
                issuer: cert1.issuer,
                expiresAt: cert1.expiresAt,
              } : undefined}
              env2Value={cert2 ? {
                subject: cert2.subject,
                issuer: cert2.issuer,
                expiresAt: cert2.expiresAt,
              } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
