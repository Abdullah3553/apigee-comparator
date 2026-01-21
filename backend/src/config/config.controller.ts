import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getConfig() {
    const config = this.configService.getConfig();
    return {
      instances: config.instances.map((instance) => ({
        name: instance.name,
        org: instance.org,
        environments: instance.environments,
      })),
    };
  }

  @Get('environments')
  async getEnvironments() {
    const environments = await this.configService.getEnvironments();
    return {
      environments: environments.map((env) => env.identifier),
    };
  }

  @Get('environments/:identifier')
  async getEnvironmentDetails(@Param('identifier') identifier: string) {
    const environment = await this.configService.getEnvironmentByIdentifier(identifier);

    if (!environment) {
      throw new NotFoundException(`Environment ${identifier} not found`);
    }

    const [instanceName, orgName, envName] = identifier.split('-');

    return {
      identifier: environment.identifier,
      instance: instanceName,
      org: orgName,
      environment: envName,
      lastRefreshedAt: environment.last_refreshed_at,
      status: environment.refresh_status,
      error: environment.refresh_error,
    };
  }
}
