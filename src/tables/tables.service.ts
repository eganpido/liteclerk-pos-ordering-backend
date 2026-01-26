import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table } from '../schemas/table.schema'; // Siguroha ang husto nga path
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<Table>,
  ) { }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    // Logic para sa Auto-increment sa tableId
    const lastTable = await this.tableModel
      .findOne()
      .sort({ tableId: -1 })
      .exec();

    const nextId = lastTable ? lastTable.tableId + 1 : 1;

    const newTable = new this.tableModel({
      ...createTableDto,
      tableId: nextId,
    });

    return newTable.save();
  }

  // Kuhaon tanang tables
  async findAll(): Promise<Table[]> {
    return this.tableModel.find().sort({ sortNumber: 1 }).exec();
  }

  // Filter tables base sa Table Group (Importante ni para sa imong POS Grid)
  async findByGroup(tableGroupId: number): Promise<Table[]> {
    return this.tableModel
      .find({ tableGroupId })
      .sort({ sortNumber: 1 })
      .exec();
  }

  async findOne(tableId: number): Promise<Table> {
    const table = await this.tableModel.findOne({ tableId }).exec();
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }
    return table;
  }

  async update(tableId: number, updateTableDto: UpdateTableDto): Promise<Table> {
    const updatedTable = await this.tableModel
      .findOneAndUpdate({ tableId }, updateTableDto, { new: true })
      .exec();

    if (!updatedTable) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }
    return updatedTable;
  }

  async updateStatus(tableId: number, status: string) {
    const updatedTable = await this.tableModel.findOneAndUpdate(
      { tableId: tableId },
      { $set: { status: status } },
      { new: true }
    ).exec();

    if (!updatedTable) {
      throw new NotFoundException(`Table #${tableId} not found.`);
    }

    return updatedTable;
  }

  async remove(tableId: number) {
    const result = await this.tableModel.deleteOne({ tableId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }
    return { deleted: true };
  }
}