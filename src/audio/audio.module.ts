import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';

@Module({
  providers: [AudioService]
})
export class AudioModule {}
