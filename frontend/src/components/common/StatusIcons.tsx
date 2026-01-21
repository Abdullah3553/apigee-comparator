import type { ComparisonStatus } from '../../types/comparison.types';
import './StatusIcons.css';

interface StatusIconProps {
  size?: number;
  className?: string;
}

export function MatchedIcon({ size = 16, className = '' }: StatusIconProps) {
  return (
    <svg
      className={`status-icon status-icon--matched ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function DifferentIcon({ size = 16, className = '' }: StatusIconProps) {
  return (
    <svg
      className={`status-icon status-icon--different ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function MissingIcon({ size = 16, className = '' }: StatusIconProps) {
  return (
    <svg
      className={`status-icon status-icon--missing ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

interface StatusIndicatorProps {
  status: ComparisonStatus;
  size?: number;
  showLabel?: boolean;
}

export function StatusIndicator({ status, size = 16, showLabel = false }: StatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'matched':
        return <MatchedIcon size={size} />;
      case 'different':
        return <DifferentIcon size={size} />;
      case 'only-in-env1':
      case 'only-in-env2':
        return <MissingIcon size={size} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'matched':
        return 'Matched';
      case 'different':
        return 'Different';
      case 'only-in-env1':
        return 'Only in Env 1';
      case 'only-in-env2':
        return 'Only in Env 2';
      default:
        return '';
    }
  };

  return (
    <span className={`status-indicator status-indicator--${status}`}>
      {getIcon()}
      {showLabel && <span className="status-indicator__label">{getLabel()}</span>}
    </span>
  );
}
