import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableGroupsService } from './table-groups.service';
import { TableGroupsController } from './table-groups.controller';
import { TableGroup, TableGroupSchema } from '../schemas/table-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TableGroup.name, schema: TableGroupSchema }
    ])
  ],
  controllers: [TableGroupsController],
  providers: [TableGroupsService],
  exports: [TableGroupsService]
})
export class TableGroupsModule { }