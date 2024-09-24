import { Test, TestingModule } from '@nestjs/testing';
import { StabilityaiService } from './stabilityai.service';

describe('StabilityaiService', () => {
  let service: StabilityaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StabilityaiService],
    }).compile();

    service = module.get<StabilityaiService>(StabilityaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
