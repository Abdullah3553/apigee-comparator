import { useEnvironment } from '../../contexts/EnvironmentContext';
import type { EntityType } from '../../types/entity.types';
import './EntityTypeSelector.css';

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'proxies', label: 'API Proxies' },
  { value: 'products', label: 'API Products' },
  { value: 'apps', label: 'Apps' },
  { value: 'kvms', label: 'KVMs' },
  { value: 'caches', label: 'Caches' },
  { value: 'target-servers', label: 'Target Servers' },
  { value: 'keystores', label: 'Keystores' },
  { value: 'references', label: 'References' },
  { value: 'virtual-hosts', label: 'Virtual Hosts' },
];

export function EntityTypeSelector() {
  const { entityType, setEntityType } = useEnvironment();

  return (
    <div className="entity-type-selector">
      <span className="entity-type-selector__label">Entity Type</span>
      <select
        className="entity-type-selector__select"
        value={entityType}
        onChange={(e) => setEntityType(e.target.value as EntityType)}
      >
        {ENTITY_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EntityTypeSelector;
