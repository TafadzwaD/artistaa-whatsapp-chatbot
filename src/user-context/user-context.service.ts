import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class UserContextService {
  private readonly redis: Redis = new Redis(process.env.REDIS_URL || '');
  private readonly logger: Logger = new Logger(UserContextService.name);

  async saveToContext(
    context: string,
    contextType: 'user' | 'assistant',
    userID: string,
  ) {
    try {
      const value = JSON.stringify({
        role: contextType,
        content: context,
      });
      await this.redis.rpush(userID, value);

      return 'Context Saved!';
    } catch (error) {
      this.logger.error('Error Saving Context', error);
      return 'Error Saving Context';
    }
  }

  async saveAndFetchContext(
    context: string,
    contextType: 'user' | 'assistant',
    userID: string,
  ) {
    try {
      const pipeline = this.redis.pipeline();
      const value = JSON.stringify({
        role: contextType,
        content: context,
      });
      // Add context saving to pipeline
      pipeline.rpush(userID, value);

      pipeline.lrange(userID, 0, -1);

      // Execute both operations in a single round-trip

      const results = await pipeline.exec();
      const conversationContext = results[1][1] as string[];

      return conversationContext.map((item) => JSON.parse(item));
    } catch (error) {
      this.logger.error('Error Saving Context And Retrieving', error);
      return [];
    }
  }

  async getConversationHistory(userID: string) {
    try {
      const conversation = await this.redis.lrange(userID, 0, -1);

      return conversation.map((item) => JSON.parse(item));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
