import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  // 1. BULK DELETE (Static route - must be first)
  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No table IDs provided for deletion');
    }
    return await this.tablesService.removeMany(ids);
  }

  // 2. BULK CREATE
  @Post('bulk')
  async createMany(@Body() createTableDtos: CreateTableDto[]) {
    if (!Array.isArray(createTableDtos) || createTableDtos.length === 0) {
      throw new BadRequestException('No tables provided for creation');
    }
    return await this.tablesService.createMany(createTableDtos);
  }

  // 3. SINGLE CREATE
  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  // 4. FIND ALL
  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  // 5. FIND BY GROUP
  @Get('by-group/:tableGroupId')
  findByGroup(@Param('tableGroupId') tableGroupId: string) {
    return this.tablesService.findByGroup(+tableGroupId);
  }

  // 6. DYNAMIC ROUTES (Must be at the bottom)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tablesService.findOne(numericId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tablesService.update(numericId, updateTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tablesService.remove(numericId);
  }
}