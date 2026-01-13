import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TableGroupsService } from './table-groups.service';
import { CreateTableGroupDto } from './dto/create-table-group.dto';
import { UpdateTableGroupDto } from './dto/update-table-group.dto';

@Controller('table-groups')
export class TableGroupsController {
  constructor(private readonly tableGroupsService: TableGroupsService) { }

  @Post()
  create(@Body() createTableGroupDto: CreateTableGroupDto) {
    return this.tableGroupsService.create(createTableGroupDto);
  }

  @Get()
  findAll() {
    return this.tableGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tableGroupsService.findOne(+id);
  }

  @Get('tables/:id')
  async getGroupWithTables(@Param('id') id: string) {
    return this.tableGroupsService.findWithTables(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableGroupDto: UpdateTableGroupDto) {
    return this.tableGroupsService.update(+id, updateTableGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableGroupsService.remove(+id);
  }
}
