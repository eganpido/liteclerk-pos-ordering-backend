import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TableGroup } from '../schemas/table-group.schema';
import { CreateTableGroupDto } from './dto/create-table-group.dto';
import { UpdateTableGroupDto } from './dto/update-table-group.dto';

@Injectable()
export class TableGroupsService {
  constructor(
    @InjectModel(TableGroup.name) private tableGroupModel: Model<TableGroup>,
  ) { }

  async create(createTableGroupDto: CreateTableGroupDto) {
    const lastGroup = await this.tableGroupModel.findOne().sort({ tableGroupId: -1 });
    const nextId = lastGroup ? lastGroup.tableGroupId + 1 : 1;

    const newGroup = new this.tableGroupModel({
      ...createTableGroupDto,
      tableGroupId: nextId
    });

    return await newGroup.save();
  }

  async findAll(): Promise<TableGroup[]> {
    return this.tableGroupModel.find().sort({ sortNumber: 1 }).exec();
  }

  async findOne(tableGroupId: number): Promise<TableGroup> {
    const tableGroup = await this.tableGroupModel
      .findOne({ tableGroupId })
      .exec();

    if (!tableGroup) {
      throw new NotFoundException(`Table Group with ID ${tableGroupId} not found`);
    }
    return tableGroup;
  }

  async findWithTables(tableGroupId: number) {
    return this.tableGroupModel.aggregate([
      { $match: { tableGroupId: tableGroupId } },

      {
        $lookup: {
          from: 'tables',
          localField: 'tableGroupId',
          foreignField: 'tableGroupId',
          as: 'tables'
        }
      },

      {
        $addFields: {
          tables: {
            $sortArray: { input: "$tables", sortBy: { sortNumber: 1 } }
          }
        }
      }
    ]).exec();
  }

  async update(tableGroupId: number, updateTableGroupDto: UpdateTableGroupDto): Promise<TableGroup> {
    const updatedTableGroup = await this.tableGroupModel
      .findOneAndUpdate({ tableGroupId }, updateTableGroupDto, { new: true })
      .exec();

    if (!updatedTableGroup) {
      throw new NotFoundException(`Table Group with ID ${tableGroupId} not found`);
    }
    return updatedTableGroup;
  }

  async remove(tableGroupId: number) {
    const result = await this.tableGroupModel
      .deleteOne({ tableGroupId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Table Group with ID ${tableGroupId} not found`);
    }
    return { deleted: true };
  }
}