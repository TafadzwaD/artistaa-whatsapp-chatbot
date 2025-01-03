import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import * as process from 'node:process';
import { WhatsappService } from './whatsapp.service';
import { AudioService } from 'src/audio/audio.service';
import { StabilityaiService } from 'src/stabilityai/stabilityai.service';
import { OpenaiService } from 'src/openai/openai.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsAppService: WhatsappService,
    private readonly stabilityaiService: StabilityaiService,
    private readonly audioService: AudioService,
    private readonly openaiService: OpenaiService,
  ) {}

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

    await this.whatsAppService.markMessageAsRead(messageID);

    switch (message.type) {
      case 'text':
        const text = message.text.body;
        const imageGenerationCommand = '/imagine';
        if (text.toLowerCase().includes(imageGenerationCommand)) {
          const response = await this.stabilityaiService.textToImage(
            text.replaceAll(imageGenerationCommand, ''),
          );

          if (Array.isArray(response)) {
            await this.whatsAppService.sendImageByUrl(
              messageSender,
              response[0],
              messageID,
            );
          }
          return;
        }

        await this.whatsAppService.sendWhatsAppMessage(
          messageSender,
          text,
          messageID,
        );
        break;
      case 'audio':
        const audioID = message.audio.id;
        const response = await this.whatsAppService.downloadMedia(audioID);
        if (response.status === 'error') {
          return;
        }

        const transcribedSpeech = await this.audioService.convertAudioToText(
          response.data,
        );

        if (transcribedSpeech.status === 'error') {
          return;
        }

        const aiResponse = await this.openaiService.generateAIResponse(
          messageSender,
          transcribedSpeech.data,
        );

        const textToSpeech =
          await this.audioService.convertTextToSpeech(aiResponse);

        if (textToSpeech.status === 'error') {
          return;
        }

        await this.whatsAppService.sendAudioByUrl(
          messageSender,
          textToSpeech.data,
        );
    }

    return 'Message processed';
  }
}
