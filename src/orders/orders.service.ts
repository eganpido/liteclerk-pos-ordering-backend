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

  private async getNextSequence(id: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { id: id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec();
    return counter.seq;
  }

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
      const lastOrder = await this.orderModel
        .findOne({}, { orderNumber: 1 })
        .sort({ orderNumber: -1 })
        .exec();
      let nextNumber = 1;
      if (lastOrder && lastOrder.orderNumber) {
        nextNumber = parseInt(lastOrder.orderNumber, 10) + 1;
      }
      const formattedOrderNumber = nextNumber.toString().padStart(10, '0');
      const nextOrderId = await this.getNextSequence('order_id');
      const newOrder = new this.orderModel({
        ...orderData,
        orderId: nextOrderId,
        orderNumber: formattedOrderNumber,
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
      console.error("ERROR SA CREATE ORDER:", error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createOrderItem(data: any): Promise<any> {
    let existingItem = await this.orderItemModel.findOne({
      orderId: data.orderId,
      itemId: data.itemId
    }).exec();
    if (existingItem) {
      existingItem.quantity += data.quantity || 1;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
      await existingItem.save();
      await this.updateOrderTotal(data.orderId);
      return { message: 'Item quantity updated', item: existingItem };
    } else {
      const nextOrderItemId = await this.getNextSequence('order_item_id');
      const newOrderItem = new this.orderItemModel({
        orderItemId: nextOrderItemId,
        orderId: data.orderId,
        itemId: data.itemId,
        itemDescription: data.itemDescription || 'No Description', // Siguradua nga naay sulod
        price: data.price || 0,
        quantity: data.quantity || 1,
        subtotal: (data.price || 0) * (data.quantity || 1)
      });

      const savedItem = await newOrderItem.save();
      await this.updateOrderTotal(data.orderId);

      return { message: 'Item added to order', item: savedItem };
    }
  }

  async findItemsByOrderId(orderId: number) {
    return this.orderItemModel.find({ orderId }).exec();
  }

  async updateOrderItem(orderItemId: number, updateData: any) {
    const item = await this.orderItemModel.findOneAndUpdate(
      { orderItemId },
      { $set: updateData },
      { new: true }
    ).exec();
    if (!item) throw new NotFoundException('Item not found');
    item.subtotal = item.quantity * item.price;
    await item.save();
    const newOrderTotal = await this.updateOrderTotal(item.orderId);
    return { message: 'Item updated', item, newOrderTotal };
  }

  async removeOrderItem(orderItemId: number) {
    const item = await this.orderItemModel.findOne({ orderItemId }).exec();
    if (!item) throw new NotFoundException('Item not found');
    const orderId = item.orderId;
    await this.orderItemModel.deleteOne({ orderItemId }).exec();
    const newOrderTotal = await this.updateOrderTotal(orderId);
    return { message: 'Item removed', newOrderTotal };
  }

  async removeOrderItems(id: number) {
    const order = await this.orderModel.findOne({ orderId: id }).exec();
    if (!order) {
      throw new NotFoundException(`Order #${id} not found.`);
    }
    const deleteResult = await this.orderItemModel.deleteMany({ orderId: id }).exec();
    await this.orderModel.updateOne(
      { orderId: id },
      { $set: { totalAmount: 0 } }
    ).exec();
    return {
      message: `All items for Order #${id} have been cleared.`,
      deletedCount: deleteResult.deletedCount
    };
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
    const order = await this.orderModel.findOne({ orderId: id }).exec();
    if (!order) {
      throw new NotFoundException(`Order #${id} not found.`);
    }
    await this.orderItemModel.deleteMany({ orderId: id }).exec();
    const deleteResult = await this.orderModel.deleteOne({ orderId: id }).exec();
    if (order.tableId) {
      await this.tablesService.updateStatus(order.tableId, 'Available');
      console.log(`Table #${order.tableId} is now Available.`);
    }
    return deleteResult;
  }

  async findActiveByTable(tableId: number): Promise<any> {
    const order = await this.orderModel.findOne({
      tableId: Number(tableId),
      isBilledOut: false
    }).exec();

    if (!order) {
      throw new NotFoundException('No active order found for this table');
    }
    return order;
  }

  async resetTable(orderId: number, tableId: number) {
    await this.orderItemModel.deleteMany({ orderId }).exec();
    await this.orderModel.deleteOne({ orderId }).exec();
    return await this.tablesService.updateStatus(tableId, 'Vacant');
  }
}