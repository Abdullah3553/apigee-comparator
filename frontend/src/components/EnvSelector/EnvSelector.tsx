import { useState, useMemo } from 'react';
import { useConfig, useEnvironmentDetails } from '../../hooks/useEnvironments';
import type { InstanceConfig } from '../../types/environment.types';
import './EnvSelector.css';

interface EnvSelectorProps {
  value: string | null;
  onChange: (identifier: string | null) => void;
  label: string;
  disabled?: boolean;
}

function formatLastRefreshed(date: string | null): string {
  if (!date) return 'Never refreshed';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function EnvSelector({ value, onChange, label, disabled }: EnvSelectorProps) {
  const { data: config, isLoading, error } = useConfig();
  const { data: envDetails } = useEnvironmentDetails(value);

  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);

  // Parse current value to set initial selections
  useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length >= 3) {
        setSelectedInstance(parts[0]);
        setSelectedOrg(parts[1]);
        setSelectedEnv(parts.slice(2).join('-'));
      }
    } else {
      setSelectedInstance(null);
      setSelectedOrg(null);
      setSelectedEnv(null);
    }
  }, [value]);

  const instances = useMemo(() => {
    return config?.instances || [];
  }, [config]);

  const selectedInstanceConfig = useMemo(() => {
    return instances.find((i: InstanceConfig) => i.name === selectedInstance);
  }, [instances, selectedInstance]);

  const environments = useMemo(() => {
    return selectedInstanceConfig?.environments || [];
  }, [selectedInstanceConfig]);

  const handleInstanceChange = (instanceName: string) => {
    setSelectedInstance(instanceName || null);
    setSelectedOrg(null);
    setSelectedEnv(null);
    onChange(null);

    // Auto-select org if instance has one
    const inst = instances.find((i: InstanceConfig) => i.name === instanceName);
    if (inst) {
      setSelectedOrg(inst.org);
    }
  };

  const handleEnvChange = (envName: string) => {
    setSelectedEnv(envName || null);
    if (selectedInstance && selectedOrg && envName) {
      const identifier = `${selectedInstance}-${selectedOrg}-${envName}`;
      onChange(identifier);
    } else {
      onChange(null);
    }
  };

  if (isLoading) {
    return (
      <div className="env-selector env-selector--loading">
        <span className="env-selector__label">{label}</span>
        <span className="env-selector__loading">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="env-selector env-selector--error">
        <span className="env-selector__label">{label}</span>
        <span className="env-selector__error">Failed to load environments</span>
      </div>
    );
  }

  return (
    <div className={`env-selector ${disabled ? 'env-selector--disabled' : ''}`}>
      <span className="env-selector__label">{label}</span>
      <div className="env-selector__dropdowns">
        <select
          className="env-selector__select"
          value={selectedInstance || ''}
          onChange={(e) => handleInstanceChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select Instance</option>
          {instances.map((instance: InstanceConfig) => (
            <option key={instance.name} value={instance.name}>
              {instance.name}
            </option>
          ))}
        </select>

        <select
          className="env-selector__select"
          value={selectedEnv || ''}
          onChange={(e) => handleEnvChange(e.target.value)}
          disabled={disabled || !selectedInstance}
        >
          <option value="">Select Environment</option>
          {environments.map((env: string) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      </div>

      {value && (
        <div className="env-selector__info">
          <span className="env-selector__identifier">{value}</span>
          {envDetails && (
            <span className="env-selector__last-refreshed">
              {formatLastRefreshed(envDetails.lastRefreshedAt)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default EnvSelector;
