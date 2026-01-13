import { Injectable, NotFoundException } from '@nestjs/common';
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

  async remove(itemGroupId: number) {
    const result = await this.itemGroupModel.deleteOne({ itemGroupId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Item Group with ID ${itemGroupId} not found`);
    }
    return { deleted: true };
  }
}