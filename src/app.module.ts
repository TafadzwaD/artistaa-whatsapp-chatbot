import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [ConfigModule.forRoot(), WhatsappModule, OpenaiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
