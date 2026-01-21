import { useEnvironment } from '../../contexts/EnvironmentContext';
import './ViewModeToggle.css';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useEnvironment();

  return (
    <div className="view-mode-toggle">
      <button
        className={`view-mode-toggle__button ${viewMode === 'comparison' ? 'view-mode-toggle__button--active' : ''}`}
        onClick={() => setViewMode('comparison')}
        title="Compare two environments side by side"
      >
        <svg className="view-mode-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="8" height="18" rx="1" />
          <rect x="13" y="3" width="8" height="18" rx="1" />
        </svg>
        <span className="view-mode-toggle__label">Compare</span>
      </button>
      <button
        className={`view-mode-toggle__button ${viewMode === 'single' ? 'view-mode-toggle__button--active' : ''}`}
        onClick={() => setViewMode('single')}
        title="View single environment in full width"
      >
        <svg className="view-mode-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
        <span className="view-mode-toggle__label">Single</span>
      </button>
    </div>
  );
}

export default ViewModeToggle;
