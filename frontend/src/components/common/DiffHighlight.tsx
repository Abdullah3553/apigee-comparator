import './DiffHighlight.css';

interface DiffHighlightProps {
  env1Value: any;
  env2Value: any;
  label?: string;
}

export function DiffHighlight({ env1Value, env2Value, label }: DiffHighlightProps) {
  const isDifferent = JSON.stringify(env1Value) !== JSON.stringify(env2Value);
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '(none)';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className={`diff-highlight ${isDifferent ? 'diff-highlight--different' : ''}`}>
      {label && <div className="diff-highlight__label">{label}</div>}
      <div className="diff-highlight__values">
        <div className="diff-highlight__value diff-highlight__value--env1">
          <span className="diff-highlight__env-label">Env 1</span>
          <pre>{formatValue(env1Value)}</pre>
        </div>
        <div className="diff-highlight__value diff-highlight__value--env2">
          <span className="diff-highlight__env-label">Env 2</span>
          <pre>{formatValue(env2Value)}</pre>
        </div>
      </div>
    </div>
  );
}

interface SingleValueProps {
  value: any;
  label?: string;
  isEnv1?: boolean;
}

export function SingleValue({ value, label, isEnv1 = true }: SingleValueProps) {
  const formatValue = (val: any): string => {
    if (val === undefined || val === null) return '(none)';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <div className={`single-value ${isEnv1 ? 'single-value--env1' : 'single-value--env2'}`}>
      {label && <div className="single-value__label">{label}</div>}
      <pre className="single-value__content">{formatValue(value)}</pre>
    </div>
  );
}
