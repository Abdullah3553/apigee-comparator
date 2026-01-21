import { EnvironmentProvider, useEnvironment } from './contexts/EnvironmentContext';
import { NavBar } from './components/NavBar/NavBar';
import { ComparisonView } from './components/ComparisonView/ComparisonView';
import { SingleEnvView } from './components/SingleEnvView/SingleEnvView';
import './App.css';

function AppContent() {
  const { env1, env2, viewMode } = useEnvironment();

  return (
    <div className="app">
      <NavBar />

      <main className="app__main">
        {!env1 && (
          <div className="app__placeholder">
            <h2 className="app__placeholder-title">
              Welcome to Apigee Monitor Dashboard
            </h2>
            <p className="app__placeholder-text">
              Select an environment above to get started.
            </p>
          </div>
        )}

        {env1 && viewMode === 'comparison' && !env2 && (
          <div className="app__placeholder">
            <h2 className="app__placeholder-title">
              Environment 1 Selected: {env1}
            </h2>
            <p className="app__placeholder-text">
              Select a second environment to compare.
            </p>
          </div>
        )}

        {env1 && env2 && viewMode === 'comparison' && (
          <ComparisonView />
        )}

        {env1 && viewMode === 'single' && (
          <SingleEnvView />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <EnvironmentProvider>
      <AppContent />
    </EnvironmentProvider>
  );
}

export default App;
