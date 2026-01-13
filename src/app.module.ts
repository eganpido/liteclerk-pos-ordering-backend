import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsModule } from './items/items.module';
import { CustomersModule } from './customers/customers.module';
import { TerminalsModule } from './terminals/terminals.module';
import { OrdersModule } from './orders/orders.module';
import { TableGroupsModule } from './table-groups/table-groups.module';
import { TablesModule } from './tables/tables.module';
import { ItemGroupsModule } from './item-groups/item-groups.module';
import { ItemGroupItemsModule } from './item-group-items/item-group-items.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/pos_ordering'),
    ItemsModule,
    CustomersModule,
    TerminalsModule,
    OrdersModule,
    TableGroupsModule,
    TablesModule,
    ItemGroupsModule,
    ItemGroupItemsModule,
  ],
})
export class AppModule { }