import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class EntitiesService {
  constructor(
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

  async getEnvironmentByIdentifier(identifier: string): Promise<Environment> {
    const environment = await this.environmentRepository.findOne({
      where: { identifier },
    });

    if (!environment) {
      throw new NotFoundException(`Environment ${identifier} not found`);
    }

    return environment;
  }

  async getEntitiesByType(identifier: string, entityType: EntityType): Promise<any[]> {
    const environment = await this.getEnvironmentByIdentifier(identifier);

    const repositoryMap: Record<EntityType, Repository<any>> = {
      apps: this.appRepository,
      products: this.apiProductRepository,
      proxies: this.apiProxyRepository,
      caches: this.cacheRepository,
      kvms: this.kvmRepository,
      'target-servers': this.targetServerRepository,
      references: this.referenceRepository,
      keystores: this.keystoreRepository,
      'virtual-hosts': this.virtualHostRepository,
    };

    const repository = repositoryMap[entityType];
    if (!repository) {
      throw new NotFoundException(`Unknown entity type: ${entityType}`);
    }

    return repository.find({
      where: { environment_id: environment.id },
      order: { name: 'ASC' },
    });
  }

  async getLastRefreshed(identifier: string): Promise<Date | null> {
    const environment = await this.getEnvironmentByIdentifier(identifier);
    return environment.last_refreshed_at;
  }

  async getKvmEntries(identifier: string, kvmName: string): Promise<any> {
    const environment = await this.getEnvironmentByIdentifier(identifier);

    const kvm = await this.kvmRepository.findOne({
      where: { environment_id: environment.id, name: kvmName },
    });

    if (!kvm) {
      throw new NotFoundException(`KVM ${kvmName} not found in ${identifier}`);
    }

    return {
      kvmName: kvm.name,
      environment: identifier,
      encrypted: kvm.encrypted,
      entries: kvm.entries || [],
    };
  }

  async getKeystoreCertificates(identifier: string, keystoreName: string): Promise<any> {
    const environment = await this.getEnvironmentByIdentifier(identifier);

    const keystore = await this.keystoreRepository.findOne({
      where: { environment_id: environment.id, name: keystoreName },
    });

    if (!keystore) {
      throw new NotFoundException(`Keystore ${keystoreName} not found in ${identifier}`);
    }

    return {
      keystoreName: keystore.name,
      environment: identifier,
      certificates: keystore.certificates || [],
    };
  }
}
