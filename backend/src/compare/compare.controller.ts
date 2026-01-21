import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { CompareService } from './compare.service';
import { EntityType } from '../entities/entities.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  async compareEnvironments(
    @Query('env1') env1: string,
    @Query('env2') env2: string,
    @Query('entityType') entityType: EntityType,
  ) {
    if (!env1 || !env2) {
      throw new BadRequestException('Both env1 and env2 query parameters are required');
    }

    if (!entityType) {
      throw new BadRequestException('entityType query parameter is required');
    }

    const validEntityTypes: EntityType[] = [
      'apps',
      'products',
      'proxies',
      'caches',
      'kvms',
      'target-servers',
      'references',
      'keystores',
      'virtual-hosts',
    ];

    if (!validEntityTypes.includes(entityType)) {
      throw new BadRequestException(
        `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`,
      );
    }

    const comparison = await this.compareService.compareEnvironments(env1, env2, entityType);

    return {
      env1,
      env2,
      entityType,
      comparison,
    };
  }
}
