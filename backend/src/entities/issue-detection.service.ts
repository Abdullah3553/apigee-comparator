import { Injectable } from '@nestjs/common';
import { EntityType } from './entities.service';

export type IssueType =
  | 'expired-certificate'
  | 'expiring-soon'
  | 'revoked-app'
  | 'revoked-credential'
  | 'expired-credential'
  | 'undeployed-proxy'
  | 'disabled-target-server';

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface Issue {
  entityName: string;
  type: IssueType;
  message: string;
  severity: IssueSeverity;
  details?: Record<string, any>;
}

@Injectable()
export class IssueDetectionService {
  private readonly EXPIRY_WARNING_DAYS = 30;

  detectIssues(entityType: EntityType, entities: any[]): Issue[] {
    const issues: Issue[] = [];

    for (const entity of entities) {
      switch (entityType) {
        case 'apps':
          issues.push(...this.detectAppIssues(entity));
          break;
        case 'proxies':
          issues.push(...this.detectProxyIssues(entity));
          break;
        case 'keystores':
          issues.push(...this.detectKeystoreIssues(entity));
          break;
        case 'target-servers':
          issues.push(...this.detectTargetServerIssues(entity));
          break;
      }
    }

    return issues;
  }

  private detectAppIssues(app: any): Issue[] {
    const issues: Issue[] = [];

    if (app.status === 'revoked') {
      issues.push({
        entityName: app.name,
        type: 'revoked-app',
        message: `App "${app.name}" is revoked`,
        severity: 'critical',
        details: { status: app.status },
      });
    }

    if (app.credentials && Array.isArray(app.credentials)) {
      for (const credential of app.credentials) {
        if (credential.status === 'revoked') {
          issues.push({
            entityName: app.name,
            type: 'revoked-credential',
            message: `Credential for app "${app.name}" is revoked`,
            severity: 'critical',
            details: {
              consumerKey: this.maskKey(credential.consumerKey),
              status: credential.status,
            },
          });
        }

        if (credential.expiresAt) {
          const expiresAt = new Date(credential.expiresAt);
          const now = new Date();

          if (expiresAt < now) {
            issues.push({
              entityName: app.name,
              type: 'expired-credential',
              message: `Credential for app "${app.name}" has expired`,
              severity: 'critical',
              details: {
                consumerKey: this.maskKey(credential.consumerKey),
                expiresAt: credential.expiresAt,
              },
            });
          } else if (this.isExpiringSoon(expiresAt)) {
            issues.push({
              entityName: app.name,
              type: 'expiring-soon',
              message: `Credential for app "${app.name}" expires in ${this.daysUntil(expiresAt)} days`,
              severity: 'warning',
              details: {
                consumerKey: this.maskKey(credential.consumerKey),
                expiresAt: credential.expiresAt,
                daysRemaining: this.daysUntil(expiresAt),
              },
            });
          }
        }
      }
    }

    return issues;
  }

  private detectProxyIssues(proxy: any): Issue[] {
    const issues: Issue[] = [];

    const deployedRevisions = proxy.deployed_revisions || proxy.deployedRevisions;
    if (!deployedRevisions || (Array.isArray(deployedRevisions) && deployedRevisions.length === 0)) {
      issues.push({
        entityName: proxy.name,
        type: 'undeployed-proxy',
        message: `Proxy "${proxy.name}" has no deployed revisions`,
        severity: 'info',
        details: {
          latestRevision: proxy.latest_revision || proxy.latestRevision,
        },
      });
    }

    return issues;
  }

  private detectKeystoreIssues(keystore: any): Issue[] {
    const issues: Issue[] = [];

    if (keystore.certificates && Array.isArray(keystore.certificates)) {
      for (const cert of keystore.certificates) {
        if (cert.expiresAt) {
          const expiresAt = new Date(cert.expiresAt);
          const now = new Date();

          if (expiresAt < now) {
            issues.push({
              entityName: keystore.name,
              type: 'expired-certificate',
              message: `Certificate "${cert.alias || 'unknown'}" in keystore "${keystore.name}" has expired`,
              severity: 'critical',
              details: {
                alias: cert.alias,
                subject: cert.subject,
                expiresAt: cert.expiresAt,
              },
            });
          } else if (this.isExpiringSoon(expiresAt)) {
            issues.push({
              entityName: keystore.name,
              type: 'expiring-soon',
              message: `Certificate "${cert.alias || 'unknown'}" in keystore "${keystore.name}" expires in ${this.daysUntil(expiresAt)} days`,
              severity: 'warning',
              details: {
                alias: cert.alias,
                subject: cert.subject,
                expiresAt: cert.expiresAt,
                daysRemaining: this.daysUntil(expiresAt),
              },
            });
          }
        }
      }
    }

    return issues;
  }

  private detectTargetServerIssues(targetServer: any): Issue[] {
    const issues: Issue[] = [];

    const isEnabled = targetServer.is_enabled ?? targetServer.isEnabled;
    if (isEnabled === false) {
      issues.push({
        entityName: targetServer.name,
        type: 'disabled-target-server',
        message: `Target server "${targetServer.name}" is disabled`,
        severity: 'info',
        details: {
          host: targetServer.host,
          port: targetServer.port,
        },
      });
    }

    return issues;
  }

  private isExpiringSoon(date: Date): boolean {
    const now = new Date();
    const warningDate = new Date(now.getTime() + this.EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
    return date > now && date <= warningDate;
  }

  private daysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private maskKey(key: string | undefined): string {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  }
}
