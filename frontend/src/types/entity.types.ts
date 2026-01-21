export type EntityType =
  | 'apps'
  | 'products'
  | 'proxies'
  | 'caches'
  | 'kvms'
  | 'target-servers'
  | 'references'
  | 'keystores'
  | 'virtual-hosts';

export type IssueType =
  | 'expired-certificate'
  | 'expiring-soon'
  | 'revoked-app'
  | 'revoked-credential'
  | 'expired-credential'
  | 'undeployed-proxy';

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface Entity {
  name: string;
  status?: string;
  fetchedAt: string;
  [key: string]: any;
}

export interface Issue {
  entityName: string;
  type: IssueType;
  message: string;
  severity: IssueSeverity;
  details?: Record<string, any>;
}

export interface EntitiesResponse {
  environment: string;
  entityType: EntityType;
  lastRefreshed: string | null;
  data: Entity[];
  issues?: Issue[];
}
