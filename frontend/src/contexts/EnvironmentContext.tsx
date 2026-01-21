import { createContext, useContext, useState, ReactNode } from 'react';
import type { EntityType } from '../types/entity.types';

type ViewMode = 'comparison' | 'single';

interface EnvironmentContextType {
  env1: string | null;
  env2: string | null;
  setEnv1: (env: string | null) => void;
  setEnv2: (env: string | null) => void;
  entityType: EntityType;
  setEntityType: (type: EntityType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

interface EnvironmentProviderProps {
  children: ReactNode;
}

export function EnvironmentProvider({ children }: EnvironmentProviderProps) {
  const [env1, setEnv1] = useState<string | null>(null);
  const [env2, setEnv2] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<EntityType>('proxies');
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');

  return (
    <EnvironmentContext.Provider
      value={{
        env1,
        env2,
        setEnv1,
        setEnv2,
        entityType,
        setEntityType,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
