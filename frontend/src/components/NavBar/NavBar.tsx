import { EnvSelector } from '../EnvSelector/EnvSelector';
import { EntityTypeSelector } from '../EntityTypeSelector/EntityTypeSelector';
import { RefreshButton } from './RefreshButton';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import './NavBar.css';

export function NavBar() {
  const { env1, env2, setEnv1, setEnv2, viewMode } = useEnvironment();

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <h1 className="navbar__title">Apigee Monitor</h1>
      </div>

      <div className="navbar__controls">
        <EnvSelector
          value={env1}
          onChange={setEnv1}
          label="Environment 1"
        />

        {viewMode === 'comparison' && (
          <EnvSelector
            value={env2}
            onChange={setEnv2}
            label="Environment 2"
          />
        )}

        <EntityTypeSelector />
      </div>

      <div className="navbar__actions">
        <RefreshButton />
      </div>
    </nav>
  );
}

export default NavBar;
