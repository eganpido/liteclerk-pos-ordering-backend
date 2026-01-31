import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { TableGroupsService } from './table-groups.service';
import { CreateTableGroupDto } from './dto/create-table-group.dto';
import { UpdateTableGroupDto } from './dto/update-table-group.dto';

@Controller('table-groups')
export class TableGroupsController {
  constructor(private readonly tableGroupsService: TableGroupsService) { }

  // 1. BULK DELETE - I-una kini para dili ma-intercept sa :id
  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No table group IDs provided for deletion');
    }
    return await this.tableGroupsService.removeMany(ids);
  }

  // 2. BULK CREATE
  @Post('bulk')
  async createMany(@Body() createDtos: CreateTableGroupDto[]) {
    if (!Array.isArray(createDtos) || createDtos.length === 0) {
      throw new BadRequestException('No table groups provided for creation');
    }
    return await this.tableGroupsService.createMany(createDtos);
  }

  // 3. SINGLE CREATE
  @Post()
  create(@Body() createTableGroupDto: CreateTableGroupDto) {
    return this.tableGroupsService.create(createTableGroupDto);
  }

  // 4. FIND ALL
  @Get()
  findAll() {
    return this.tableGroupsService.findAll();
  }

  // 5. GET GROUP WITH TABLES
  @Get('tables/:id')
  async getGroupWithTables(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tableGroupsService.findWithTables(numericId);
  }

  // 6. DYNAMIC ROUTES (Dapat naa sa pinaka-ubos)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tableGroupsService.findOne(numericId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableGroupDto: UpdateTableGroupDto) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tableGroupsService.update(numericId, updateTableGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('Invalid ID format');
    return this.tableGroupsService.remove(numericId);
  }
}