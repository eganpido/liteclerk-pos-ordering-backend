import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item, ItemSchema } from '../schemas/item.schema';
import { Counter, CounterSchema } from '../schemas/counter.schema'; // Import kini

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Counter.name, schema: CounterSchema }, // <--- IMPORTANTE NI NGA LINYA
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule { }