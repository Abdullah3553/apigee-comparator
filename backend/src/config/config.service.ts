import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Instance, Environment } from '../database/entities';

export interface ApigeeInstanceConfig {
  name: string;
  management_url: string;
  org: string;
  credentials: {
    username: string;
    password: string;
  };
  environments: string[];
}

export interface ApigeeConfig {
  instances: ApigeeInstanceConfig[];
}

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name);
  private config: ApigeeConfig;

  constructor(
    private nestConfigService: NestConfigService,
    @InjectRepository(Instance)
    private instanceRepository: Repository<Instance>,
    @InjectRepository(Environment)
    private environmentRepository: Repository<Environment>,
  ) {}

  async onModuleInit() {
    await this.loadConfig();
    await this.seedEnvironments();
  }

  private loadConfig() {
    const configPath = this.nestConfigService.get<string>(
      'CONFIG_PATH',
      'config/apigee-config.yaml',
    );

    try {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      const interpolatedContents = this.interpolateEnvVars(fileContents);
      this.config = yaml.load(interpolatedContents) as ApigeeConfig;
      this.logger.log(`Loaded configuration from ${configPath}`);
    } catch (error) {
      this.logger.error(`Failed to load config from ${configPath}:`, error);
      throw error;
    }
  }

  private interpolateEnvVars(content: string): string {
    return content.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const value = process.env[varName];
      if (value === undefined) {
        this.logger.warn(`Environment variable ${varName} is not set`);
        return match;
      }
      return value;
    });
  }

  private async seedEnvironments() {
    try {
      for (const instanceConfig of this.config.instances) {
        let instance = await this.instanceRepository.findOne({
          where: { name: instanceConfig.name },
        });

        if (!instance) {
          instance = this.instanceRepository.create({
            name: instanceConfig.name,
            management_url: instanceConfig.management_url,
            org_name: instanceConfig.org,
          });
          instance = await this.instanceRepository.save(instance);
          this.logger.log(`Created instance: ${instance.name}`);
        }

        for (const envName of instanceConfig.environments) {
          const identifier = `${instanceConfig.name}-${instanceConfig.org}-${envName}`;
          let environment = await this.environmentRepository.findOne({
            where: { identifier },
          });

          if (!environment) {
            environment = this.environmentRepository.create({
              instance_id: instance.id,
              name: envName,
              identifier,
              refresh_status: 'pending',
            });
            await this.environmentRepository.save(environment);
            this.logger.log(`Created environment: ${identifier}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to seed environments:', error);
      throw error;
    }
  }

  getConfig(): ApigeeConfig {
    return this.config;
  }

  getInstanceConfig(instanceName: string): ApigeeInstanceConfig | undefined {
    return this.config.instances.find((i) => i.name === instanceName);
  }

  async getEnvironments(): Promise<Environment[]> {
    return this.environmentRepository.find({
      relations: ['instance'],
    });
  }

  async getEnvironmentByIdentifier(identifier: string): Promise<Environment | null> {
    return this.environmentRepository.findOne({
      where: { identifier },
      relations: ['instance'],
    });
  }
}
