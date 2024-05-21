import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Module({
  providers: [OpenaiService]
})
export class OpenaiModule {}
