import { Test, TestingModule } from '@nestjs/testing';
import { RedisProvider } from './redis.provider';

describe('Redis', () => {
  let provider: RedisProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisProvider],
    }).compile();

    provider = module.get<RedisProvider>(RedisProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
