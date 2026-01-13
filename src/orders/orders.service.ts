import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { OrderItem } from '../schemas/order-item.schema';
import { Counter } from '../schemas/counter.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
  ) { }

  async create(createOrderDto: any): Promise<any> {
    const { orderData, items } = createOrderDto;

    const orderCounter = await this.counterModel.findOneAndUpdate(
      { id: 'order_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec();

    const nextOrderId = orderCounter ? orderCounter.seq : 1;

    const newOrder = new this.orderModel({
      ...orderData,
      orderId: nextOrderId,
      orderDate: new Date()
    });
    const savedOrder = await newOrder.save();

    const savedItems: OrderItem[] = [];

    for (const item of items) {
      const itemCounter = await this.counterModel.findOneAndUpdate(
        { id: 'order_item_id' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      ).exec();

      const nextOrderItemId = itemCounter ? itemCounter.seq : 1;

      const newOrderItem = new this.orderItemModel({
        ...item,
        orderItemId: nextOrderItemId,
        orderId: nextOrderId
      });

      const savedItem = await newOrderItem.save();

      savedItems.push(savedItem as OrderItem);
    }

    return {
      message: 'Order placed successfully!',
      order: savedOrder,
      items: savedItems
    };
  }

  async update(id: number, updateOrderDto: any) {
    // Kini mo-update sa main Order record base sa orderId
    return this.orderModel.findOneAndUpdate(
      { orderId: id },
      { $set: updateOrderDto },
      { new: true }
    ).exec();
  }

  async findAll() {
    return this.orderModel.find().sort({ orderId: -1 }).exec();
  }

  async findOne(id: number) {
    const order = await this.orderModel.findOne({ orderId: id }).exec();
    const items = await this.orderItemModel.find({ orderId: id }).exec();
    return { order, items };
  }

  async remove(id: number) {
    await this.orderItemModel.deleteMany({ orderId: id }).exec();
    return this.orderModel.deleteOne({ orderId: id }).exec();
  }

  // Order Item
  async createOrderItem(orderId: number, itemData: any) {
    const itemCounter = await this.counterModel.findOneAndUpdate(
      { id: 'order_item_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec();

    const nextOrderItemId = itemCounter ? itemCounter.seq : 1;

    const newOrderItem = new this.orderItemModel({
      ...itemData,
      orderItemId: nextOrderItemId,
      orderId: orderId
    });

    return newOrderItem.save();
  }

  async updateOrderItem(orderId: number, updateOrderDto: any) {
    return this.orderModel.findOneAndUpdate(
      { orderId: orderId },
      { $set: updateOrderDto },
      { new: true }
    ).exec();
  }

  async removeOrderItem(orderId: number) {
    await this.orderItemModel.deleteMany({ orderId: orderId }).exec();

    const result = await this.orderModel.deleteOne({ orderId: orderId }).exec();

    return {
      message: `Order ${orderId} and its items have been deleted`,
      deletedCount: result.deletedCount
    };
  }
}