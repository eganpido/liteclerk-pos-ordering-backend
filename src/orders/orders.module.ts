import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderItem, OrderItemSchema } from '../schemas/order-item.schema';
import { Counter, CounterSchema } from '../schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Counter.name, schema: CounterSchema }
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }