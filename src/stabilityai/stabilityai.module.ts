import { Module } from '@nestjs/common';
import { StabilityaiService } from './stabilityai.service';

@Module({
  providers: [StabilityaiService],
})
export class StabilityaiModule {}
