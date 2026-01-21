import { Module } from '@nestjs/common';
import { ApigeeService } from './apigee.service';

@Module({
  providers: [ApigeeService],
  exports: [ApigeeService],
})
export class ApigeeModule {}
