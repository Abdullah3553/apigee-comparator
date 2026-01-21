import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService, ApigeeInstanceConfig } from '../config/config.service';
import { ApigeeService } from '../apigee/apigee.service';
import {
  Environment,
  App,
  ApiProduct,
  ApiProxy,
  Cache,
  Kvm,
  TargetServer,
  Reference,
  Keystore,
  VirtualHost,
} from '../database/entities';

export interface RefreshSummary {
  environmentsRefreshed: number;
  environmentsFailed: number;
  entitiesFetched: {
    apps: number;
    products: number;
    proxies: number;
    caches: number;
    kvms: number;
    targetServers: number;
    references: number;
    keystores: number;
    virtualHosts: number;
  };
}

export interface RefreshFailure {
  environment: string;
  error: string;
}

export interface RefreshResult {
  success: boolean;
  refreshedAt: Date;
  summary: RefreshSummary;
  failures: RefreshFailure[];
}

export interface EnvironmentRefreshResult {
  environment: string;
  success: boolean;
  refreshedAt: Date;
  entitiesFetched: Record<string, number>;
  error?: string;
}

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor(
    private configService: ConfigService,
    private apigeeService: ApigeeService,
    private dataSource: DataSource,
    @InjectRepository(Environment)
    private environmentRepository: Repository<Environment>,
    @InjectRepository(App)
    private appRepository: Repository<App>,
    @InjectRepository(ApiProduct)
    private apiProductRepository: Repository<ApiProduct>,
    @InjectRepository(ApiProxy)
    private apiProxyRepository: Repository<ApiProxy>,
    @InjectRepository(Cache)
    private cacheRepository: Repository<Cache>,
    @InjectRepository(Kvm)
    private kvmRepository: Repository<Kvm>,
    @InjectRepository(TargetServer)
    private targetServerRepository: Repository<TargetServer>,
    @InjectRepository(Reference)
    private referenceRepository: Repository<Reference>,
    @InjectRepository(Keystore)
    private keystoreRepository: Repository<Keystore>,
    @InjectRepository(VirtualHost)
    private virtualHostRepository: Repository<VirtualHost>,
  ) {}

  async refreshAll(): Promise<RefreshResult> {
    const environments = await this.environmentRepository.find({
      relations: ['instance'],
    });

    const results = await Promise.allSettled(
      environments.map((env) => this.refreshEnvironment(env.identifier)),
    );

    const summary: RefreshSummary = {
      environmentsRefreshed: 0,
      environmentsFailed: 0,
      entitiesFetched: {
        apps: 0,
        products: 0,
        proxies: 0,
        caches: 0,
        kvms: 0,
        targetServers: 0,
        references: 0,
        keystores: 0,
        virtualHosts: 0,
      },
    };

    const failures: RefreshFailure[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const env = environments[i];

      if (result.status === 'fulfilled' && result.value.success) {
        summary.environmentsRefreshed++;
        const fetched = result.value.entitiesFetched;
        summary.entitiesFetched.apps += fetched.apps || 0;
        summary.entitiesFetched.products += fetched.products || 0;
        summary.entitiesFetched.proxies += fetched.proxies || 0;
        summary.entitiesFetched.caches += fetched.caches || 0;
        summary.entitiesFetched.kvms += fetched.kvms || 0;
        summary.entitiesFetched.targetServers += fetched.targetServers || 0;
        summary.entitiesFetched.references += fetched.references || 0;
        summary.entitiesFetched.keystores += fetched.keystores || 0;
        summary.entitiesFetched.virtualHosts += fetched.virtualHosts || 0;
      } else {
        summary.environmentsFailed++;
        const errorMessage =
          result.status === 'rejected'
            ? result.reason?.message || 'Unknown error'
            : result.value.error || 'Unknown error';
        failures.push({
          environment: env.identifier,
          error: errorMessage,
        });
      }
    }

    return {
      success: summary.environmentsFailed === 0,
      refreshedAt: new Date(),
      summary,
      failures,
    };
  }

  async refreshEnvironment(identifier: string): Promise<EnvironmentRefreshResult> {
    const environment = await this.environmentRepository.findOne({
      where: { identifier },
      relations: ['instance'],
    });

    if (!environment) {
      throw new NotFoundException(`Environment ${identifier} not found`);
    }

    const [instanceName, orgName, envName] = identifier.split('-');
    const instanceConfig = this.configService.getInstanceConfig(instanceName);

    if (!instanceConfig) {
      throw new NotFoundException(`Instance ${instanceName} not found in configuration`);
    }

    await this.environmentRepository.update(environment.id, {
      refresh_status: 'refreshing',
      refresh_error: null,
    });

    try {
      const entitiesFetched = await this.fetchAllEntities(
        instanceConfig,
        orgName,
        envName,
        environment.id,
      );

      await this.environmentRepository.update(environment.id, {
        refresh_status: 'success',
        last_refreshed_at: new Date(),
        refresh_error: null,
      });

      return {
        environment: identifier,
        success: true,
        refreshedAt: new Date(),
        entitiesFetched,
      };
    } catch (error) {
      const errorMessage = error.message || 'Unknown error during refresh';

      await this.environmentRepository.update(environment.id, {
        refresh_status: 'failed',
        refresh_error: errorMessage,
      });

      return {
        environment: identifier,
        success: false,
        refreshedAt: new Date(),
        entitiesFetched: {},
        error: errorMessage,
      };
    }
  }

  private async fetchAllEntities(
    instanceConfig: ApigeeInstanceConfig,
    org: string,
    env: string,
    environmentId: string,
  ): Promise<Record<string, number>> {
    const client = this.apigeeService.createClient(instanceConfig);
    const fetched: Record<string, number> = {};

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clear existing entities for this environment
      await this.clearEntitiesForEnvironment(queryRunner, environmentId);

      // Fetch and store apps
      const apps = await this.apigeeService.fetchApps(client, org);
      fetched.apps = apps.length;
      await this.storeApps(queryRunner, apps, environmentId);

      // Fetch and store API products
      const products = await this.apigeeService.fetchApiProducts(client, org);
      fetched.products = products.length;
      await this.storeApiProducts(queryRunner, products, environmentId);

      // Fetch and store API proxies
      const proxyNames = await this.apigeeService.fetchApiProxies(client, org);
      fetched.proxies = proxyNames.length;
      await this.storeApiProxies(queryRunner, proxyNames, client, org, environmentId);

      // Fetch and store caches
      const caches = await this.apigeeService.fetchCaches(client, org, env);
      fetched.caches = caches.length;
      await this.storeCaches(queryRunner, caches, environmentId);

      // Fetch and store KVMs
      const kvmNames = await this.apigeeService.fetchKvms(client, org, env);
      fetched.kvms = kvmNames.length;
      await this.storeKvms(queryRunner, kvmNames, client, org, env, environmentId);

      // Fetch and store target servers
      const targetServers = await this.apigeeService.fetchTargetServers(client, org, env);
      fetched.targetServers = targetServers.length;
      await this.storeTargetServers(queryRunner, targetServers, environmentId);

      // Fetch and store references
      const references = await this.apigeeService.fetchReferences(client, org, env);
      fetched.references = references.length;
      await this.storeReferences(queryRunner, references, environmentId);

      // Fetch and store keystores
      const keystoreNames = await this.apigeeService.fetchKeystores(client, org, env);
      fetched.keystores = keystoreNames.length;
      await this.storeKeystores(queryRunner, keystoreNames, client, org, env, environmentId);

      // Fetch and store virtual hosts
      const virtualHosts = await this.apigeeService.fetchVirtualHosts(client, org, env);
      fetched.virtualHosts = virtualHosts.length;
      await this.storeVirtualHosts(queryRunner, virtualHosts, environmentId);

      await queryRunner.commitTransaction();
      return fetched;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async clearEntitiesForEnvironment(queryRunner: any, environmentId: string) {
    await queryRunner.manager.delete(App, { environment_id: environmentId });
    await queryRunner.manager.delete(ApiProduct, { environment_id: environmentId });
    await queryRunner.manager.delete(ApiProxy, { environment_id: environmentId });
    await queryRunner.manager.delete(Cache, { environment_id: environmentId });
    await queryRunner.manager.delete(Kvm, { environment_id: environmentId });
    await queryRunner.manager.delete(TargetServer, { environment_id: environmentId });
    await queryRunner.manager.delete(Reference, { environment_id: environmentId });
    await queryRunner.manager.delete(Keystore, { environment_id: environmentId });
    await queryRunner.manager.delete(VirtualHost, { environment_id: environmentId });
  }

  private async storeApps(queryRunner: any, apps: any[], environmentId: string) {
    for (const app of apps) {
      await queryRunner.manager.save(App, {
        environment_id: environmentId,
        name: app.name,
        developer_id: app.developerId,
        app_id: app.appId,
        status: app.status,
        credentials: app.credentials,
        raw_response: app,
      });
    }
  }

  private async storeApiProducts(queryRunner: any, products: any[], environmentId: string) {
    for (const product of products) {
      await queryRunner.manager.save(ApiProduct, {
        environment_id: environmentId,
        name: product.name,
        display_name: product.displayName,
        approval_type: product.approvalType,
        environments: product.environments,
        proxies: product.proxies,
        scopes: product.scopes,
        attributes: product.attributes,
        raw_response: product,
      });
    }
  }

  private async storeApiProxies(
    queryRunner: any,
    proxyNames: string[],
    client: any,
    org: string,
    environmentId: string,
  ) {
    for (const proxyName of proxyNames) {
      try {
        const deployments = await this.apigeeService.fetchApiProxyDeployments(client, org, proxyName);
        await queryRunner.manager.save(ApiProxy, {
          environment_id: environmentId,
          name: proxyName,
          deployed_revisions: deployments.environment || [],
          raw_response: deployments,
        });
      } catch (error) {
        this.logger.warn(`Failed to fetch deployments for proxy ${proxyName}: ${error.message}`);
        await queryRunner.manager.save(ApiProxy, {
          environment_id: environmentId,
          name: proxyName,
        });
      }
    }
  }

  private async storeCaches(queryRunner: any, cacheNames: string[], environmentId: string) {
    for (const name of cacheNames) {
      await queryRunner.manager.save(Cache, {
        environment_id: environmentId,
        name,
      });
    }
  }

  private async storeKvms(
    queryRunner: any,
    kvmNames: string[],
    client: any,
    org: string,
    env: string,
    environmentId: string,
  ) {
    for (const kvmName of kvmNames) {
      try {
        const kvmData = await this.apigeeService.fetchKvmEntries(client, org, env, kvmName);
        await queryRunner.manager.save(Kvm, {
          environment_id: environmentId,
          name: kvmName,
          encrypted: kvmData.encrypted || false,
          entries: kvmData.entry || [],
          raw_response: kvmData,
        });
      } catch (error) {
        this.logger.warn(`Failed to fetch KVM entries for ${kvmName}: ${error.message}`);
        await queryRunner.manager.save(Kvm, {
          environment_id: environmentId,
          name: kvmName,
        });
      }
    }
  }

  private async storeTargetServers(queryRunner: any, servers: any[], environmentId: string) {
    for (const server of servers) {
      await queryRunner.manager.save(TargetServer, {
        environment_id: environmentId,
        name: server.name || server,
        host: server.host,
        port: server.port,
        is_enabled: server.isEnabled,
        ssl_info: server.sSLInfo,
        raw_response: server,
      });
    }
  }

  private async storeReferences(queryRunner: any, references: any[], environmentId: string) {
    for (const ref of references) {
      await queryRunner.manager.save(Reference, {
        environment_id: environmentId,
        name: ref.name || ref,
        resource_type: ref.resourceType,
        refers: ref.refers,
        raw_response: ref,
      });
    }
  }

  private async storeKeystores(
    queryRunner: any,
    keystoreNames: string[],
    client: any,
    org: string,
    env: string,
    environmentId: string,
  ) {
    for (const keystoreName of keystoreNames) {
      try {
        const certs = await this.apigeeService.fetchKeystoreCertificates(client, org, env, keystoreName);
        await queryRunner.manager.save(Keystore, {
          environment_id: environmentId,
          name: keystoreName,
          certificates: certs.certs || certs || [],
          raw_response: certs,
        });
      } catch (error) {
        this.logger.warn(`Failed to fetch certs for keystore ${keystoreName}: ${error.message}`);
        await queryRunner.manager.save(Keystore, {
          environment_id: environmentId,
          name: keystoreName,
        });
      }
    }
  }

  private async storeVirtualHosts(queryRunner: any, virtualHosts: any[], environmentId: string) {
    for (const vhost of virtualHosts) {
      await queryRunner.manager.save(VirtualHost, {
        environment_id: environmentId,
        name: vhost.name || vhost,
        host_aliases: vhost.hostAliases,
        port: vhost.port,
        ssl_info: vhost.sSLInfo,
        raw_response: vhost,
      });
    }
  }
}
