import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: 'search' | 'folder' | 'alert' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  message,
  icon = 'folder',
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon === 'search' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        )}
        {icon === 'folder' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {icon === 'alert' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
        {icon === 'info' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        )}
      </div>
      {title && <h3 className="empty-state__title">{title}</h3>}
      <p className="empty-state__message">{message}</p>
      {action && (
        <button className="empty-state__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
