import { Global, Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';
import { RedisProvider } from 'src/redis/redis.provider';

@Global()
@Module({
  providers: [UserContextService, RedisProvider],
  exports: [RedisProvider],
})
export class UserContextModule {}
