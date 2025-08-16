import { Injectable, Logger } from '@nestjs/common';
import { RedisProvider } from 'src/redis/redis.provider';
import * as crypto from 'crypto';

@Injectable()
export class UserContextService {
  private readonly logger: Logger = new Logger(UserContextService.name);
  private readonly salt = process.env.HASHING_SALT;
  private readonly contextExpirationTime = 10800; // Expiration Time In Seconds

  constructor(private readonly redisProvider: RedisProvider) {}

  private get redis() {
    return this.redisProvider.getClient();
  }

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
      await this.redis.rPush(hashedUserID, value);
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
      const value = JSON.stringify({
        role: contextType,
        content: context,
      });
      const hashedUserID = this.hashPhoneNumber(userID);

      const results = await this.redis
        .multi()
        .rPush(hashedUserID, value) // Adding to user context
        .lRange(hashedUserID, 0, -1) // Fetch user context
        .expire(hashedUserID, this.contextExpirationTime)
        .exec(); // We're executing both operations in a single round-trip

      const lRangeResult = results[1];
      if (Array.isArray(lRangeResult)) {
        const conversationContext = lRangeResult as string[];
        return conversationContext.map((item) => JSON.parse(item));
      }

      return [];
    } catch (error) {
      this.logger.error('Error Saving Context And Retrieving', error);
      return [];
    }
  }

  async getConversationHistory(userID: string) {
    try {
      const hashedUserID = this.hashPhoneNumber(userID);
      const conversation = await this.redis.lRange(hashedUserID, 0, -1);

      await this.redis.expire(hashedUserID, this.contextExpirationTime);

      return conversation.map((item) => JSON.parse(item));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
