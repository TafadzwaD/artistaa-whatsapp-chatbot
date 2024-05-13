import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('whatsapp')
export class WhatsappController {

  @Get('webhook')
  whatsappVerificationChallenge(@Req() request: Request){
    const mode = request.query['hub.mode'];
    const challenge = request.query['hub.challenge'];
    const token = request.query['hub.verify_token'];

    const verificationToken = process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

    if(!mode || !token){
      return 'Error verifying token';
    }

    if(mode === 'subscribe' && token === verificationToken){
      return challenge?.toString();
    }


  }
}
