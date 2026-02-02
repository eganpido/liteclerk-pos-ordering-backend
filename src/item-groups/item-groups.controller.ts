import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ItemGroupsService } from './item-groups.service';
import { CreateItemGroupDto } from './dto/create-item-group.dto';
import { UpdateItemGroupDto } from './dto/update-item-group.dto';

@Controller('item-groups')
export class ItemGroupsController {
  constructor(private readonly itemGroupsService: ItemGroupsService) { }

  @Post()
  create(@Body() createItemGroupDto: CreateItemGroupDto) {
    return this.itemGroupsService.create(createItemGroupDto);
  }

  @Post('bulk')
  createMany(@Body() createItemGroupDtos: CreateItemGroupDto[]) { // Dapat naay []
    return this.itemGroupsService.createMany(createItemGroupDtos);
  }

  @Get()
  findAll() {
    return this.itemGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemGroupDto: UpdateItemGroupDto) {
    return this.itemGroupsService.update(+id, updateItemGroupDto);
  }

  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    console.log('Bulk delete hit! IDs:', ids);
    return await this.itemGroupsService.removeMany(ids);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.itemGroupsService.remove(numericId);
  }
}
