import type { Entity, EntityType } from '../../types/entity.types';
import { KvmDetails } from './KvmDetails';
import { KeystoreDetails } from './KeystoreDetails';
import { AppDetails } from './AppDetails';
import { DiffHighlight, SingleValue } from '../common/DiffHighlight';
import './EntityDetails.css';

interface EntityDetailsProps {
  entityType: EntityType;
  name: string;
  env1Data?: Entity;
  env2Data?: Entity;
  env1Identifier?: string;
  env2Identifier?: string;
}

export function EntityDetails({
  entityType,
  name,
  env1Data,
  env2Data,
  env1Identifier,
  env2Identifier,
}: EntityDetailsProps) {
  const isBothEnvs = !!env1Data && !!env2Data;
  const singleData = env1Data || env2Data;
  const singleEnvId = env1Data ? env1Identifier : env2Identifier;

  switch (entityType) {
    case 'kvms':
      if (isBothEnvs) {
        return (
          <KvmDetails
            kvmName={name}
            env1Identifier={env1Identifier!}
            env2Identifier={env2Identifier!}
          />
        );
      }
      return (
        <KvmDetails
          kvmName={name}
          env1Identifier={singleEnvId!}
          singleMode
        />
      );

    case 'keystores':
      if (isBothEnvs) {
        return (
          <KeystoreDetails
            keystoreName={name}
            env1Identifier={env1Identifier!}
            env2Identifier={env2Identifier!}
          />
        );
      }
      return (
        <KeystoreDetails
          keystoreName={name}
          env1Identifier={singleEnvId!}
          singleMode
        />
      );

    case 'apps':
      return (
        <AppDetails
          env1Data={env1Data}
          env2Data={env2Data}
        />
      );

    default:
      return (
        <GenericDetails
          env1Data={env1Data}
          env2Data={env2Data}
        />
      );
  }
}

interface GenericDetailsProps {
  env1Data?: Entity;
  env2Data?: Entity;
}

function GenericDetails({ env1Data, env2Data }: GenericDetailsProps) {
  const isBothEnvs = !!env1Data && !!env2Data;

  if (!isBothEnvs) {
    const data = env1Data || env2Data;
    if (!data) return null;

    return (
      <div className="entity-details__generic">
        <SingleValue
          value={data}
          label="Entity Data"
          isEnv1={!!env1Data}
        />
      </div>
    );
  }

  const allKeys = new Set([
    ...Object.keys(env1Data || {}),
    ...Object.keys(env2Data || {}),
  ]);

  const keysToIgnore = ['name', 'fetchedAt'];

  return (
    <div className="entity-details__generic">
      {Array.from(allKeys)
        .filter((key) => !keysToIgnore.includes(key))
        .map((key) => (
          <DiffHighlight
            key={key}
            label={key}
            env1Value={env1Data?.[key]}
            env2Value={env2Data?.[key]}
          />
        ))}
    </div>
  );
}
