import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp/whatsapp.controller';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { OpenaiService } from 'src/openai/openai.service';

@Module({
  controllers: [WhatsappController],
  providers: [OpenaiService, WhatsappService],
})
export class WhatsappModule {}
