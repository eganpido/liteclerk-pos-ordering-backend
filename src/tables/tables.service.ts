import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table } from '../schemas/table.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<Table>,
  ) { }

  // ==========================
  // BULK DELETE
  // ==========================
  async removeMany(ids: number[]) {
    return await this.tableModel.deleteMany({
      posTableId: { $in: ids } // Siguroha nga 'posTableId' ang naa sa imong schema
    }).exec();
  }

  // ==========================
  // BULK CREATE
  // ==========================
  async createMany(createTableDtos: CreateTableDto[]): Promise<any> {
    const count = createTableDtos.length;

    // 1. Kuhaon ang pinakataas nga ID para sa auto-increment
    const lastTable = await this.tableModel
      .findOne()
      .sort({ tableId: -1 })
      .exec();

    let currentId = lastTable ? lastTable.tableId + 1 : 1;

    // 2. I-assign ang IDs sa matag table sa listahan
    const tablesWithIds = createTableDtos.map((dto) => {
      const newTable = {
        ...dto,
        tableId: currentId,
      };
      currentId++;
      return newTable;
    });

    try {
      // 3. I-execute ang bulk insert
      return await this.tableModel.insertMany(tablesWithIds);
    } catch (error) {
      throw new InternalServerErrorException('Bulk insert for tables failed: ' + error.message);
    }
  }

  // ==========================
  // EXISTING METHODS
  // ==========================
  async create(createTableDto: CreateTableDto): Promise<Table> {
    const lastTable = await this.tableModel.findOne().sort({ tableId: -1 }).exec();
    const nextId = lastTable ? lastTable.tableId + 1 : 1;

    const newTable = new this.tableModel({
      ...createTableDto,
      tableId: nextId,
    });

    return newTable.save();
  }

  async findAll(): Promise<Table[]> {
    return this.tableModel.find().sort({ sortNumber: 1 }).exec();
  }

  async findByGroup(tableGroupId: number): Promise<Table[]> {
    return this.tableModel.find({ tableGroupId }).sort({ sortNumber: 1 }).exec();
  }

  async findOne(tableId: number): Promise<Table> {
    const table = await this.tableModel.findOne({ tableId }).exec();
    if (!table) throw new NotFoundException(`Table with ID ${tableId} not found`);
    return table;
  }

  async update(tableId: number, updateTableDto: UpdateTableDto): Promise<Table> {
    const updatedTable = await this.tableModel
      .findOneAndUpdate({ tableId }, updateTableDto, { new: true })
      .exec();
    if (!updatedTable) throw new NotFoundException(`Table with ID ${tableId} not found`);
    return updatedTable;
  }

  async updateStatus(tableId: number, status: string) {
    const updatedTable = await this.tableModel.findOneAndUpdate(
      { tableId: tableId },
      { $set: { status: status } },
      { new: true }
    ).exec();
    if (!updatedTable) throw new NotFoundException(`Table #${tableId} not found.`);
    return updatedTable;
  }

  async remove(tableId: number) {
    const result = await this.tableModel.deleteOne({ tableId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`Table with ID ${tableId} not found`);
    return { deleted: true };
  }
}