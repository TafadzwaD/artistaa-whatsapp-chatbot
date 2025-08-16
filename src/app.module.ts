import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { OpenaiModule } from './openai/openai.module';
import { UserContextModule } from './user-context/user-context.module';
import { StabilityaiModule } from './stabilityai/stabilityai.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WhatsappModule,
    OpenaiModule,
    UserContextModule,
    StabilityaiModule,
    AudioModule,
  ],
})
export class AppModule {}
