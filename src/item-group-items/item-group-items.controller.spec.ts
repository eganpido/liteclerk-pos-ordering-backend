import { Test, TestingModule } from '@nestjs/testing';
import { ItemGroupItemsController } from './item-group-items.controller';
import { ItemGroupItemsService } from './item-group-items.service';

describe('ItemGroupItemsController', () => {
  let controller: ItemGroupItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemGroupItemsController],
      providers: [ItemGroupItemsService],
    }).compile();

    controller = module.get<ItemGroupItemsController>(ItemGroupItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
