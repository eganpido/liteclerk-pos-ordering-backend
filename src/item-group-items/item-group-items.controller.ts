import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ItemGroupItemsService } from './item-group-items.service';
import { CreateItemGroupItemDto } from './dto/create-item-group-item.dto';
import { UpdateItemGroupItemDto } from './dto/update-item-group-item.dto';

@Controller('item-group-items')
export class ItemGroupItemsController {
  // Ginganlan nimo kini og 'service' sa constructor
  constructor(private readonly service: ItemGroupItemsService) { }

  // 1. BULK DELETE (I-una ang static routes)
  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }
    // USBA KINI: gikan sa 'itemGroupItemsService' ngadto sa 'service'
    return await this.service.removeMany(ids);
  }

  // 2. BULK CREATE
  @Post('bulk')
  async createMany(@Body() createDtos: CreateItemGroupItemDto[]) {
    if (!Array.isArray(createDtos) || createDtos.length === 0) {
      throw new BadRequestException('No data provided for creation');
    }
    // USBA KINI: gikan sa 'itemGroupItemsService' ngadto sa 'service'
    return await this.service.createMany(createDtos);
  }

  // 3. OTHER ROUTES
  @Post()
  create(@Body() createDto: CreateItemGroupItemDto) {
    return this.service.create(createDto);
  }

  @Get('by-group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.service.findByGroup(+groupId);
  }

  // 4. DYNAMIC ROUTES (I-uwahi kini pirme)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.service.remove(numericId);
  }
}