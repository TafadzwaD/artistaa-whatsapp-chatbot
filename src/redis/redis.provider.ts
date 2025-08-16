import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisProvider implements OnModuleInit {
  private readonly logger = new Logger(RedisProvider.name);
  private readonly redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 40) {
            this.logger.error(
              'Too many retries, Redis connection will be terminated',
            );
            return new Error('Too many retries.');
          }
          return Math.min(retries * 500, 5000);
        },
        connectTimeout: 10000,
      },
    });

    this.redisClient.on('error', (error) => {
      this.logger.error(`Redis client error: ${error.message}`, error);
    });
  }

  async onModuleInit() {
    await this.redisClient.connect();
    this.logger.log('Connected to Redis');
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }
}
