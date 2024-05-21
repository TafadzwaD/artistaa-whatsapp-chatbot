import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class WhatsappService {
  constructor(private readonly openaiService: OpenaiService) {}

  private readonly httpService = new HttpService();
  private readonly logger = new Logger(WhatsappService.name);

  async sendWhatsAppMessage(messageSender: string, userInput: string) {
    const aiResponse = await this.openaiService.generateAIResponse(userInput);

    const url = `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID}/messages`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
      },
    };
    const data = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: messageSender,
      type: 'text',
      text: {
        preview_url: false,
        body: aiResponse,
      },
    });

    try {
      const response = this.httpService
        .post(url, data, config)
        .pipe(
          map((res) => {
            return res.data;
          }),
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException(
              'Error Posting To WhatsApp Cloud API',
            );
          }),
        );

      const messageSendingStatus = await lastValueFrom(response);
      this.logger.log('Message Sent. Status:', messageSendingStatus);
    } catch (error) {
      this.logger.error(error);
      return 'Axle broke!! Abort mission!!';
    }
  }
}
