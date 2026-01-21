import { Module } from '@nestjs/common';
import { CompareController } from './compare.controller';
import { CompareService } from './compare.service';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [EntitiesModule],
  controllers: [CompareController],
  providers: [CompareService],
  exports: [CompareService],
})
export class CompareModule {}
