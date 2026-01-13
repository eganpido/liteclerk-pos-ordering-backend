import { Controller, Get, Post, Body } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }

  @Post()
  create(@Body() createItemDto: any) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }
}