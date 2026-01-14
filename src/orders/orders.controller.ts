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

  // 2. Specific Order Items (Diri nato i-adjust ang paths)

  @Patch('item/:orderItemId') // Gigamitan og 'item/' prefix para dili mag-conflict sa Order update
  updateItem(
    @Param('orderItemId') orderItemId: string,
    @Body() updateData: any
  ) {
    return this.ordersService.updateOrderItem(+orderItemId, updateData);
  }

  @Delete('item/:orderItemId') // Gigamitan og 'item/' prefix
  removeItem(@Param('orderItemId') orderItemId: string) {
    return this.ordersService.removeOrderItem(+orderItemId);
  }
}