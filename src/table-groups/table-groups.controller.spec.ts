import { Test, TestingModule } from '@nestjs/testing';
import { TableGroupsController } from './table-groups.controller';
import { TableGroupsService } from './table-groups.service';

describe('TableGroupsController', () => {
  let controller: TableGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableGroupsController],
      providers: [TableGroupsService],
    }).compile();

    controller = module.get<TableGroupsController>(TableGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
