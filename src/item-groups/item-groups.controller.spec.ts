import { Test, TestingModule } from '@nestjs/testing';
import { ItemGroupsController } from './item-groups.controller';
import { ItemGroupsService } from './item-groups.service';

describe('ItemGroupsController', () => {
  let controller: ItemGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemGroupsController],
      providers: [ItemGroupsService],
    }).compile();

    controller = module.get<ItemGroupsController>(ItemGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
