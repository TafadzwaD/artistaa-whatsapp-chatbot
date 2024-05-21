import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class UserContextService {
  private readonly redis: Redis = new Redis(process.env.REDIS_URL || '');
  private readonly logger: Logger = new Logger(UserContextService.name);

  async saveToContext(
    context: string,
    contextType: 'user' | 'system',
    userID: string,
  ) {
    try {
      const value = JSON.stringify({
        type: contextType,
        data: { content: context },
      });
      await this.redis.rpush(userID, value);

      return 'Context Saved!';
    } catch (error) {
      this.logger.error('Error Saving Context', error);
      return 'Error Saving Context';
    }
  }

  async getConversationHistory(userID: string) {
    try {
      const conversation = await this.redis.lrange(userID, 0, -1);
      const jsonList = conversation.map((jsonString: string) => {
        JSON.parse(jsonString);
      });

      return jsonList;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}