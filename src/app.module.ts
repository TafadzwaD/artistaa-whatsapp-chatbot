import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { OpenaiModule } from './openai/openai.module';
import { UserContextModule } from './user-context/user-context.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WhatsappModule,
    OpenaiModule,
    UserContextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
