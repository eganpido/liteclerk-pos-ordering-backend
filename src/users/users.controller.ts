import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // 1. BULK DELETE - Kinahanglan mauna para dili mo-trigger ang ParseIntPipe sa :id
  @Delete('bulk-delete')
  async removeMany(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No user IDs provided for deletion');
    }
    return await this.usersService.removeMany(ids);
  }

  // 2. BULK CREATE
  @Post('bulk')
  async createMany(@Body() createUserDtos: CreateUserDto[]) {
    if (!Array.isArray(createUserDtos) || createUserDtos.length === 0) {
      throw new BadRequestException('No users provided for creation');
    }
    return await this.usersService.createMany(createUserDtos);
  }

  // 3. SINGLE CREATE
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 4. FIND ALL
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 5. DYNAMIC ROUTES (Dapat naa sa ubos pirme)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}