import { Controller, Get, Param } from '@nestjs/common';
import { EntitiesService, EntityType } from './entities.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get(':identifier/:entityType')
  async getEntities(
    @Param('identifier') identifier: string,
    @Param('entityType') entityType: EntityType,
  ) {
    const entities = await this.entitiesService.getEntitiesByType(identifier, entityType);
    const lastRefreshed = await this.entitiesService.getLastRefreshed(identifier);

    return {
      environment: identifier,
      entityType,
      lastRefreshed,
      data: entities.map((entity) => ({
        name: entity.name,
        status: entity.status,
        fetchedAt: entity.fetched_at,
        ...this.getEntitySpecificFields(entityType, entity),
      })),
    };
  }

  @Get(':identifier/kvms/:kvmName/entries')
  async getKvmEntries(
    @Param('identifier') identifier: string,
    @Param('kvmName') kvmName: string,
  ) {
    return this.entitiesService.getKvmEntries(identifier, kvmName);
  }

  @Get(':identifier/keystores/:keystoreName/certificates')
  async getKeystoreCertificates(
    @Param('identifier') identifier: string,
    @Param('keystoreName') keystoreName: string,
  ) {
    return this.entitiesService.getKeystoreCertificates(identifier, keystoreName);
  }

  private getEntitySpecificFields(entityType: EntityType, entity: any): Record<string, any> {
    switch (entityType) {
      case 'apps':
        return {
          developerId: entity.developer_id,
          appId: entity.app_id,
          status: entity.status,
          credentials: entity.credentials,
        };
      case 'products':
        return {
          displayName: entity.display_name,
          approvalType: entity.approval_type,
          environments: entity.environments,
          proxies: entity.proxies,
          scopes: entity.scopes,
          attributes: entity.attributes,
        };
      case 'proxies':
        return {
          latestRevision: entity.latest_revision,
          deployedRevisions: entity.deployed_revisions,
          metadata: entity.metadata,
        };
      case 'caches':
        return {
          description: entity.description,
          expirySettings: entity.expiry_settings,
        };
      case 'kvms':
        return {
          encrypted: entity.encrypted,
          entryCount: entity.entries?.length || 0,
        };
      case 'target-servers':
        return {
          host: entity.host,
          port: entity.port,
          isEnabled: entity.is_enabled,
          sslInfo: entity.ssl_info,
        };
      case 'references':
        return {
          resourceType: entity.resource_type,
          refers: entity.refers,
        };
      case 'keystores':
        return {
          certCount: entity.certificates?.length || 0,
        };
      case 'virtual-hosts':
        return {
          hostAliases: entity.host_aliases,
          port: entity.port,
          sslInfo: entity.ssl_info,
        };
      default:
        return {};
    }
  }
}
