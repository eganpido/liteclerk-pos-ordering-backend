import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { Counter, CounterSchema } from '../schemas/counter.schema'; // Import kini

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Counter.name, schema: CounterSchema }, // <--- AYAW NI KALIMTI
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule { }