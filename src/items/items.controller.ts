import { Controller, Get, Post, Body, Delete, BadRequestException } from '@nestjs/common';
import { ItemsService } from './items.service';
// 1. I-import ang DTO (siguroha nga husto ang path sa imong file)
import { CreateItemDto } from './dto/create-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }

  // 2. BULK DELETE - Kinahanglan mag-una sa bisan unsang :id route
  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No item IDs provided for deletion');
    }
    console.log('Bulk delete items hit! IDs:', ids);
    return await this.itemsService.removeMany(ids);
  }

  // 3. BULK CREATE
  @Post('bulk')
  async createMany(@Body() createItemDtos: CreateItemDto[]) {
    if (!Array.isArray(createItemDtos) || createItemDtos.length === 0) {
      throw new BadRequestException('No items provided for creation');
    }
    return await this.itemsService.createMany(createItemDtos);
  }

  // 4. SINGLE CREATE
  @Post()
  create(@Body() createItemDto: CreateItemDto) { // Gigamit na ang DTO diri para sa intellisense
    return this.itemsService.create(createItemDto);
  }

  // 5. FIND ALL
  @Get()
  findAll() {
    return this.itemsService.findAll();
  }
}