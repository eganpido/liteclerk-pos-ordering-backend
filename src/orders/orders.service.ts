import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { OrderItem } from '../schemas/order-item.schema';
import { Counter } from '../schemas/counter.schema';
import { TablesService } from '../tables/tables.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    private tablesService: TablesService,
  ) { }

  // Private helper para sa Auto-increment
  private async getNextSequence(id: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { id: id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec();
    return counter.seq;
  }

  // Private helper para i-recalculate ang Total Amount sa Order
  private async updateOrderTotal(orderId: number) {
    const items = await this.orderItemModel.find({ orderId }).exec();
    const newTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    await this.orderModel.findOneAndUpdate(
      { orderId: orderId },
      { $set: { totalAmount: newTotal } }
    );
    return newTotal;
  }

  async create(createOrderDto: any): Promise<any> {
    try {
      const { orderData, items } = createOrderDto;

      const nextOrderId = await this.getNextSequence('order_id');

      const newOrder = new this.orderModel({
        ...orderData,
        orderId: nextOrderId,
        orderDate: new Date(),
        totalAmount: 0
      });

      await newOrder.save();

      let calculatedTotal = 0;
      for (const item of items) {
        const nextOrderItemId = await this.getNextSequence('order_item_id');
        const subtotal = item.price * item.quantity;

        const newOrderItem = new this.orderItemModel({
          ...item,
          orderItemId: nextOrderItemId,
          orderId: nextOrderId,
          subtotal: subtotal
        });

        await newOrderItem.save();
        calculatedTotal += subtotal;
      }

      const savedOrder = await this.orderModel.findOneAndUpdate(
        { orderId: nextOrderId },
        { $set: { totalAmount: calculatedTotal } },
        { new: true }
      );

      if (orderData.tableId) {
        await this.tablesService.updateStatus(orderData.tableId, 'Occupied');
      }

      return { message: 'Order created!', order: savedOrder };

    } catch (error) {
      console.error("ERROR SA CREATE ORDER:", error.message); // Mo-gawas ni sa terminal
      throw new InternalServerErrorException(error.message); // Mo-gawas ni sa Thunder Client
    }
  }

  // --- UPDATE ITEM LOGIC ---
  async updateOrderItem(orderItemId: number, updateData: any) {
    const item = await this.orderItemModel.findOneAndUpdate(
      { orderItemId },
      { $set: updateData },
      { new: true }
    ).exec();

    if (!item) throw new NotFoundException('Item not found');

    // Recalculate subtotal (quantity * price)
    item.subtotal = item.quantity * item.price;
    await item.save();

    // Importante: I-update ang total sa tibuok Order
    const newOrderTotal = await this.updateOrderTotal(item.orderId);

    return { message: 'Item updated', item, newOrderTotal };
  }

  // --- DELETE ITEM LOGIC ---
  async removeOrderItem(orderItemId: number) {
    const item = await this.orderItemModel.findOne({ orderItemId }).exec();
    if (!item) throw new NotFoundException('Item not found');

    const orderId = item.orderId;
    await this.orderItemModel.deleteOne({ orderItemId }).exec();

    // Recalculate total pagkahuman og delete
    const newOrderTotal = await this.updateOrderTotal(orderId);

    return { message: 'Item removed', newOrderTotal };
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
    // 1. Pangitaa una ang order sa database aron makuha nato ang tableId niini
    const order = await this.orderModel.findOne({ orderId: id }).exec();

    if (!order) {
      throw new NotFoundException(`Order #${id} not found.`);
    }

    // 2. I-delete ang tanang items nga sakop niini nga orderId
    await this.orderItemModel.deleteMany({ orderId: id }).exec();

    // 3. I-delete ang main order record
    const deleteResult = await this.orderModel.deleteOne({ orderId: id }).exec();

    // 4. Kon naay tableId ang order, i-release nato ang table
    if (order.tableId) {
      await this.tablesService.updateStatus(order.tableId, 'Available');
      console.log(`Table #${order.tableId} is now Available.`);
    }

    return deleteResult;
  }
}