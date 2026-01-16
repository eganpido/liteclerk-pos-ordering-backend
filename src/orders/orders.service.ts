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

      // 1. Pangitaon ang pinaka-ulahing Order base sa orderNumber (descending)
      const lastOrder = await this.orderModel
        .findOne({}, { orderNumber: 1 }) // Kuhaon ra ang orderNumber field
        .sort({ orderNumber: -1 })       // Sort: pinaka-dako/pinaka-ulahing number
        .exec();

      let nextNumber = 1; // Default sugod kung wala pay order sa DB

      if (lastOrder && lastOrder.orderNumber) {
        // I-convert ang string "0000000001" ngadto sa number 1, unya pun-an og 1
        nextNumber = parseInt(lastOrder.orderNumber, 10) + 1;
      }

      // 2. I-format balik ngadto sa 10-digit string nga naay leading zeros
      const formattedOrderNumber = nextNumber.toString().padStart(10, '0');

      // 3. I-save na ang bag-ong Order
      const nextOrderId = await this.getNextSequence('order_id');

      const newOrder = new this.orderModel({
        ...orderData,
        orderId: nextOrderId,
        orderNumber: formattedOrderNumber,
        orderDate: new Date(),
        totalAmount: 0
      });

      await newOrder.save();

      // --- Loop para sa items (pabilin gihapon ang imong karaan nga logic) ---
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

      // Update sa totalAmount sa Order
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

  // --- UPDATE ITEM LOGIC ---
  async createOrderItem(data: any): Promise<any> {
    // 1. I-check kon ang item (itemId) naa na ba sa cart (orderId)
    let existingItem = await this.orderItemModel.findOne({
      orderId: data.orderId,
      itemId: data.itemId
    }).exec();

    if (existingItem) {
      // KUNG NAA NA: Pun-an lang ang quantity ug i-update ang subtotal
      existingItem.quantity += data.quantity || 1;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
      await existingItem.save();

      // I-update ang main order total amount
      await this.updateOrderTotal(data.orderId);

      return { message: 'Item quantity updated', item: existingItem };
    } else {
      // KUNG WALA PA: Maghimo og bag-ong order item record
      const nextOrderItemId = await this.getNextSequence('order_item_id');
      const subtotal = data.price * (data.quantity || 1);

      const newOrderItem = new this.orderItemModel({
        ...data,
        orderItemId: nextOrderItemId,
        subtotal: subtotal
      });

      const savedItem = await newOrderItem.save();

      // I-update ang main order total amount
      await this.updateOrderTotal(data.orderId);

      return { message: 'Item added to order', item: savedItem };
    }
  }

  // I-add usab kini para makuha ang listahan sa items para sa UI
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

  // orders.service.ts
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
}