import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemGroupItemsService } from './item-group-items.service';
import { CreateItemGroupItemDto } from './dto/create-item-group-item.dto';
import { UpdateItemGroupItemDto } from './dto/update-item-group-item.dto';

@Controller('item-group-items')
export class ItemGroupItemsController {
  constructor(private readonly service: ItemGroupItemsService) { }

  @Post()
  create(@Body() createDto: CreateItemGroupItemDto) {
    return this.service.create(createDto);
  }

  @Get('by-group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.service.findByGroup(+groupId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
