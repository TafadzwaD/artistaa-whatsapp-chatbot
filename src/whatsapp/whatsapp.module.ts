import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { OpenaiService } from 'src/openai/openai.service';
import { UserContextService } from 'src/user-context/user-context.service';
import { StabilityaiService } from 'src/stabilityai/stabilityai.service';
import { AudioService } from 'src/audio/audio.service';

@Module({
  controllers: [WhatsappController],
  providers: [
    OpenaiService,
    WhatsappService,
    UserContextService,
    StabilityaiService,
    AudioService,
  ],
})
export class WhatsappModule {}
