import { Test, TestingModule } from '@nestjs/testing';
import { UserContextService } from './user-context.service';

describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserContextService],
    }).compile();

    service = module.get<UserContextService>(UserContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
