import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';
import { ConfigModule } from '../config/config.module';
import { ApigeeModule } from '../apigee/apigee.module';
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
    ConfigModule,
    ApigeeModule,
  ],
  controllers: [RefreshController],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RefreshModule {}
