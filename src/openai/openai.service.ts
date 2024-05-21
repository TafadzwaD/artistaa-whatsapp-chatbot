import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { UserContextService } from 'src/user-context/user-context.service';

@Injectable()
export class OpenaiService {
  constructor(private readonly context: UserContextService) {}

  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  private readonly logger = new Logger(OpenaiService.name);

  async generateAIResponse(userID: string, userInput: string) {
    try {
      await this.context.saveToContext(userInput, 'user', userID);
      const userContext = await this.context.getConversationHistory(userID);
      this.logger.log(userContext);

      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: userInput }],
        model: process.env.OPENAI_MODEL || 'gpt-4o-2024-05-13',
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error generating AI response', error);
      // Fail gracefully!!
      return 'Sorry, I am unable to process your request at the moment.';
    }
  }
}
