import { Controller, Post, Param } from '@nestjs/common';
import { RefreshService } from './refresh.service';

@Controller('refresh')
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @Post()
  async refreshAll() {
    return this.refreshService.refreshAll();
  }

  @Post(':identifier')
  async refreshEnvironment(@Param('identifier') identifier: string) {
    return this.refreshService.refreshEnvironment(identifier);
  }
}
