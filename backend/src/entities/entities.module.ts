import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
