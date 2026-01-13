import { Test, TestingModule } from '@nestjs/testing';
import { ItemGroupsService } from './item-groups.service';

describe('ItemGroupsService', () => {
  let service: ItemGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemGroupsService],
    }).compile();

    service = module.get<ItemGroupsService>(ItemGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
