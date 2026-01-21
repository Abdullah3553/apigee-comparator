import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DiffHighlight, SingleValue } from '../common/DiffHighlight';
import './EntityDetails.css';

interface KvmEntry {
  name: string;
  value: string;
}

interface KvmEntriesResponse {
  kvmName: string;
  environment: string;
  encrypted: boolean;
  entries: KvmEntry[];
}

interface KvmDetailsProps {
  kvmName: string;
  env1Identifier: string;
  env2Identifier?: string;
  singleMode?: boolean;
}

export function KvmDetails({ kvmName, env1Identifier, env2Identifier, singleMode }: KvmDetailsProps) {
  const { data: env1Data, isLoading: loading1 } = useQuery({
    queryKey: ['kvm-entries', env1Identifier, kvmName],
    queryFn: async (): Promise<KvmEntriesResponse> => {
      const response = await api.get(`/entities/${env1Identifier}/kvms/${kvmName}/entries`);
      return response.data;
    },
    enabled: !!env1Identifier,
  });

  const { data: env2Data, isLoading: loading2 } = useQuery({
    queryKey: ['kvm-entries', env2Identifier, kvmName],
    queryFn: async (): Promise<KvmEntriesResponse> => {
      const response = await api.get(`/entities/${env2Identifier}/kvms/${kvmName}/entries`);
      return response.data;
    },
    enabled: !!env2Identifier && !singleMode,
  });

  if (loading1 || loading2) {
    return <div className="entity-details__loading">Loading KVM entries...</div>;
  }

  if (singleMode && env1Data) {
    return (
      <div className="entity-details">
        <div className="entity-details__section">
          <h4 className="entity-details__section-title">
            KVM Entries ({env1Data.entries.length})
            {env1Data.encrypted && ' (Encrypted)'}
          </h4>
          {env1Data.entries.map((entry) => (
            <SingleValue
              key={entry.name}
              label={entry.name}
              value={entry.value}
              isEnv1
            />
          ))}
        </div>
      </div>
    );
  }

  const allEntryNames = new Set([
    ...(env1Data?.entries.map((e) => e.name) || []),
    ...(env2Data?.entries.map((e) => e.name) || []),
  ]);

  const getEntryValue = (entries: KvmEntry[] | undefined, name: string): string | undefined => {
    return entries?.find((e) => e.name === name)?.value;
  };

  return (
    <div className="entity-details">
      <div className="entity-details__section">
        <h4 className="entity-details__section-title">
          KVM Entries ({allEntryNames.size})
        </h4>
        {Array.from(allEntryNames).map((entryName) => (
          <DiffHighlight
            key={entryName}
            label={entryName}
            env1Value={getEntryValue(env1Data?.entries, entryName)}
            env2Value={getEntryValue(env2Data?.entries, entryName)}
          />
        ))}
      </div>
    </div>
  );
}
