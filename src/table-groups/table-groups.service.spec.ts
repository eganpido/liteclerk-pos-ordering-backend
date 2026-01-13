import { Test, TestingModule } from '@nestjs/testing';
import { TableGroupsService } from './table-groups.service';

describe('TableGroupsService', () => {
  let service: TableGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableGroupsService],
    }).compile();

    service = module.get<TableGroupsService>(TableGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
