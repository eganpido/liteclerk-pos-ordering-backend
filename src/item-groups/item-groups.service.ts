import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemGroup } from '../schemas/item-group.schema';
import { CreateItemGroupDto } from './dto/create-item-group.dto';
import { UpdateItemGroupDto } from './dto/update-item-group.dto';

@Injectable()
export class ItemGroupsService {
  constructor(
    @InjectModel(ItemGroup.name) private itemGroupModel: Model<ItemGroup>,
  ) { }

  async create(createItemGroupDto: CreateItemGroupDto): Promise<ItemGroup> {
    const lastGroup = await this.itemGroupModel
      .findOne()
      .sort({ itemGroupId: -1 })
      .exec();

    const nextId = lastGroup ? lastGroup.itemGroupId + 1 : 1;

    const newGroup = new this.itemGroupModel({
      ...createItemGroupDto,
      itemGroupId: nextId,
    });

    return newGroup.save();
  }

  async createMany(createItemGroupDtos: CreateItemGroupDto[]): Promise<any> {
    const lastGroup = await this.itemGroupModel
      .findOne()
      .sort({ itemGroupId: -1 })
      .exec();

    let nextId = lastGroup ? lastGroup.itemGroupId + 1 : 1;

    const groupsWithIds = createItemGroupDtos.map((dto) => {
      const group = {
        ...dto,
        itemGroupId: nextId,
      };
      nextId++;
      return group;
    });

    return await this.itemGroupModel.insertMany(groupsWithIds);
  }

  async findAll(): Promise<ItemGroup[]> {
    return this.itemGroupModel.find({ isLocked: true }).sort({ sortNumber: 1 }).exec();
  }

  async findOne(itemGroupId: number): Promise<ItemGroup> {
    const group = await this.itemGroupModel.findOne({ itemGroupId }).exec();
    if (!group) {
      throw new NotFoundException(`Item Group with ID ${itemGroupId} not found`);
    }
    return group;
  }

  async update(itemGroupId: number, updateItemGroupDto: UpdateItemGroupDto): Promise<ItemGroup> {
    const updatedGroup = await this.itemGroupModel
      .findOneAndUpdate({ itemGroupId }, updateItemGroupDto, { new: true })
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException(`Item Group with ID ${itemGroupId} not found`);
    }
    return updatedGroup;
  }

  async remove(id: number): Promise<any> {
    if (isNaN(id)) {
      throw new BadRequestException("Cannot delete: ID is not a number (NaN)");
    }

    const result = await this.itemGroupModel.deleteOne({ itemGroupId: id }).exec();
    return result;
  }

  async removeMany(ids: number[]): Promise<any> {
    const result = await this.itemGroupModel.deleteMany({
      posItemGroupId: { $in: ids }
    }).exec();

    return {
      statusCode: 200,
      message: `Successfully deleted ${result.deletedCount} items`
    };
  }
}