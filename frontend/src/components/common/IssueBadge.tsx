import type { Issue, IssueSeverity } from '../../types/entity.types';
import './IssueBadge.css';

interface IssueBadgeProps {
  issue: Issue;
  showDetails?: boolean;
}

export function IssueBadge({ issue, showDetails = false }: IssueBadgeProps) {
  const severityClass = `issue-badge--${issue.severity}`;

  return (
    <span className={`issue-badge ${severityClass}`} title={issue.message}>
      <span className="issue-badge__icon">{getSeverityIcon(issue.severity)}</span>
      {showDetails && <span className="issue-badge__label">{getIssueLabel(issue.type)}</span>}
    </span>
  );
}

interface IssueSummaryProps {
  issues: Issue[];
}

export function IssueSummary({ issues }: IssueSummaryProps) {
  if (issues.length === 0) {
    return null;
  }

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return (
    <div className="issue-summary">
      <span className="issue-summary__title">Issues:</span>
      {criticalCount > 0 && (
        <span className="issue-summary__count issue-summary__count--critical">
          {criticalCount} critical
        </span>
      )}
      {warningCount > 0 && (
        <span className="issue-summary__count issue-summary__count--warning">
          {warningCount} warning
        </span>
      )}
      {infoCount > 0 && (
        <span className="issue-summary__count issue-summary__count--info">
          {infoCount} info
        </span>
      )}
    </div>
  );
}

interface IssueListProps {
  issues: Issue[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="issue-list__empty">
        No issues detected
      </div>
    );
  }

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = [];
    }
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<IssueSeverity, Issue[]>);

  return (
    <div className="issue-list">
      {groupedIssues.critical && (
        <div className="issue-list__group">
          <h4 className="issue-list__group-title issue-list__group-title--critical">
            Critical ({groupedIssues.critical.length})
          </h4>
          <ul className="issue-list__items">
            {groupedIssues.critical.map((issue, idx) => (
              <li key={idx} className="issue-list__item issue-list__item--critical">
                <IssueBadge issue={issue} />
                <span className="issue-list__message">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {groupedIssues.warning && (
        <div className="issue-list__group">
          <h4 className="issue-list__group-title issue-list__group-title--warning">
            Warnings ({groupedIssues.warning.length})
          </h4>
          <ul className="issue-list__items">
            {groupedIssues.warning.map((issue, idx) => (
              <li key={idx} className="issue-list__item issue-list__item--warning">
                <IssueBadge issue={issue} />
                <span className="issue-list__message">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {groupedIssues.info && (
        <div className="issue-list__group">
          <h4 className="issue-list__group-title issue-list__group-title--info">
            Info ({groupedIssues.info.length})
          </h4>
          <ul className="issue-list__items">
            {groupedIssues.info.map((issue, idx) => (
              <li key={idx} className="issue-list__item issue-list__item--info">
                <IssueBadge issue={issue} />
                <span className="issue-list__message">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getSeverityIcon(severity: IssueSeverity): string {
  switch (severity) {
    case 'critical':
      return '!';
    case 'warning':
      return '!';
    case 'info':
      return 'i';
    default:
      return '?';
  }
}

function getIssueLabel(type: string): string {
  switch (type) {
    case 'expired-certificate':
      return 'Expired Cert';
    case 'expiring-soon':
      return 'Expiring Soon';
    case 'revoked-app':
      return 'Revoked';
    case 'revoked-credential':
      return 'Revoked Cred';
    case 'expired-credential':
      return 'Expired Cred';
    case 'undeployed-proxy':
      return 'Undeployed';
    default:
      return type;
  }
}
