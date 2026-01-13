import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from '../schemas/customer.schema';
import { Counter } from '../schemas/counter.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
  ) { }

  async create(createCustomerDto: any): Promise<Customer> {
    const counter = await this.counterModel.findOneAndUpdate(
      { id: 'customer_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    createCustomerDto.customerId = counter.seq;

    const newCustomer = new this.customerModel(createCustomerDto);
    return newCustomer.save();
  }

  // Get All Customers
  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().sort({ customerId: -1 }).exec();
  }
}