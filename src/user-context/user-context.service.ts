import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class UserContextService {
  private readonly redis: Redis = new Redis(process.env.REDIS_URL || '');
  private readonly logger: Logger = new Logger(UserContextService.name);
  private readonly salt = process.env.HASHING_SALT;
  private readonly contextExpirationTime = 10800; // Expiration Time In Seconds

  // Phone Numbers shouldn't be said as plain text values
  // in the DB
  hashPhoneNumber(phoneNumber: string) {
    const hashedPhoneNumber = crypto
      .createHmac('sha256', this.salt)
      .update(phoneNumber)
      .digest('hex');
    return hashedPhoneNumber;
  }

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
      const hashedUserID = this.hashPhoneNumber(userID);
      await this.redis.rpush(hashedUserID, value);
      await this.redis.expire(hashedUserID, this.contextExpirationTime);

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
      const hashedUserID = this.hashPhoneNumber(userID);

      // Add context saving to pipeline
      pipeline.rpush(hashedUserID, value);

      pipeline.lrange(hashedUserID, 0, -1);

      pipeline.expire(hashedUserID, this.contextExpirationTime);

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
      const hashedUserID = this.hashPhoneNumber(userID);
      const conversation = await this.redis.lrange(hashedUserID, 0, -1);

      await this.redis.expire(hashedUserID, this.contextExpirationTime);

      return conversation.map((item) => JSON.parse(item));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
