import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import * as process from 'node:process';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsAppService: WhatsappService) {}

  @Get('webhook')
  whatsappVerificationChallenge(@Req() request: Request) {
    const mode = request.query['hub.mode'];
    const challenge = request.query['hub.challenge'];
    const token = request.query['hub.verify_token'];

    const verificationToken =
      process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

    if (!mode || !token) {
      return 'Error verifying token';
    }

    if (mode === 'subscribe' && token === verificationToken) {
      return challenge?.toString();
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingWhatsappMessage(@Body() request: any) {
    const { messages } = request?.entry?.[0]?.changes?.[0].value ?? {};
    if (!messages) return;

    const message = messages[0];
    const messageSender = message.from;
    const messageID = message.id;

    switch (message.type) {
      case 'text':
        const text = message.text.body;

        await this.whatsAppService.sendWhatsAppMessage(messageSender, text);
        break;
    }

    return 'Message processed';
  }
}
