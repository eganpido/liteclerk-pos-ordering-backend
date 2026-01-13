import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemGroupsService } from './item-groups.service';
import { ItemGroupsController } from './item-groups.controller';
import { ItemGroup, ItemGroupSchema } from '../schemas/item-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ItemGroup.name, schema: ItemGroupSchema }
    ])
  ],
  controllers: [ItemGroupsController],
  providers: [ItemGroupsService],
  exports: [ItemGroupsService]
})
export class ItemGroupsModule { }