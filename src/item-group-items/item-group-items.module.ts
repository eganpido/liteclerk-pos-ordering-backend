import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemGroupItemsService } from './item-group-items.service';
import { ItemGroupItemsController } from './item-group-items.controller';
import { ItemGroupItem, ItemGroupItemSchema } from '../schemas/item-group-item.schema';

@Module({
  imports: [
    // 3. I-register ang mapping schema
    MongooseModule.forFeature([
      { name: ItemGroupItem.name, schema: ItemGroupItemSchema }
    ])
  ],
  controllers: [ItemGroupItemsController],
  providers: [ItemGroupItemsService],
  exports: [ItemGroupItemsService],
})
export class ItemGroupItemsModule { }