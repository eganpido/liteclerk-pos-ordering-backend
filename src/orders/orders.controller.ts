import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // I-secure nato

@UseGuards(JwtAuthGuard) // Tanang orders kinahanglan naay login/token
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // 1. Tibuok Order
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Post('item')
  async addOrderItem(@Body() orderItemDto: any) {
    return this.ordersService.createOrderItem(orderItemDto);
  }

  @Get(':id/items')
  async getOrderItems(@Param('id') id: string) {
    return this.ordersService.findItemsByOrderId(+id);
  }

  @Patch('item/:orderItemId')
  updateItem(
    @Param('orderItemId') orderItemId: string,
    @Body() updateData: any
  ) {
    return this.ordersService.updateOrderItem(+orderItemId, updateData);
  }

  @Delete('item/:orderItemId')
  removeItem(@Param('orderItemId') orderItemId: string) {
    return this.ordersService.removeOrderItem(+orderItemId);
  }

  @Delete('items/:orderId')
  async removeAllItemsByOrder(@Param('orderId') orderId: string) {
    return this.ordersService.removeOrderItems(+orderId);
  }

  @Get('active/:tableId')
  async getActive(@Param('tableId') tableId: number) {
    return this.ordersService.findActiveByTable(tableId);
  }

  @Delete('reset-table/:orderId/:tableId')
  async resetTable(
    @Param('orderId') orderId: number,
    @Param('tableId') tableId: number
  ) {
    return this.ordersService.resetTable(+orderId, +tableId);
  }
}