import { Test, TestingModule } from '@nestjs/testing';
import { ItemGroupItemsService } from './item-group-items.service';

describe('ItemGroupItemsService', () => {
  let service: ItemGroupItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemGroupItemsService],
    }).compile();

    service = module.get<ItemGroupItemsService>(ItemGroupItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
