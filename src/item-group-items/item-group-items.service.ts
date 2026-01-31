import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemGroupItem } from '../schemas/item-group-item.schema';
import { CreateItemGroupItemDto } from './dto/create-item-group-item.dto';

@Injectable()
export class ItemGroupItemsService {
  constructor(
    @InjectModel(ItemGroupItem.name) private mappingModel: Model<ItemGroupItem>,
    // Kung naggamit ka og Counter collection para sa IDs, i-inject diri. 
    // Kung wala, gamiton nato ang sort logic nimo sa ubos.
  ) { }

  // ==========================
  // BULK DELETE
  // ==========================
  async removeMany(ids: number[]) {
    return await this.mappingModel.deleteMany({
      posItemGroupItemId: { $in: ids }
    }).exec();
  }

  // ==========================
  // BULK CREATE (with auto-increment logic)
  // ==========================
  async createMany(createDtos: CreateItemGroupItemDto[]) {
    const count = createDtos.length;

    // 1. Kuhaon ang pinakataas nga ID karon sa DB
    const lastRecord = await this.mappingModel.findOne().sort({ itemGroupItemId: -1 });
    let currentId = lastRecord ? lastRecord.itemGroupItemId + 1 : 1;

    // 2. I-map ang mga DTOs ug dugangan og itemGroupItemId
    const dataWithIds = createDtos.map((dto) => {
      const newItem = {
        ...dto,
        itemGroupItemId: currentId,
      };
      currentId++;
      return newItem;
    });

    try {
      // 3. I-save tanan sa usa ka transaction/bulk insert
      return await this.mappingModel.insertMany(dataWithIds);
    } catch (error) {
      throw new InternalServerErrorException('Bulk insert failed: ' + error.message);
    }
  }

  // ==========================
  // EXISTING METHODS
  // ==========================
  async create(createDto: CreateItemGroupItemDto) {
    const lastRecord = await this.mappingModel.findOne().sort({ itemGroupItemId: -1 });
    const nextId = lastRecord ? lastRecord.itemGroupItemId + 1 : 1;

    const newMapping = new this.mappingModel({
      ...createDto,
      itemGroupItemId: nextId,
    });
    return newMapping.save();
  }

  async findByGroup(itemGroupId: number) {
    // 
    return this.mappingModel.aggregate([
      { $match: { itemGroupId: itemGroupId } },
      {
        $lookup: {
          from: 'items',
          localField: 'posItemId',
          foreignField: 'itemId',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: 0,
          itemGroupItemId: 1,
          itemGroupId: 1,
          itemId: 1,
          itemDescription: '$itemDetails.itemDescription',
          price: '$itemDetails.price',
          isLocked: '$itemDetails.isLocked'
        }
      }
    ]).exec();
  }

  async findAll() {
    return this.mappingModel.find().exec();
  }

  async remove(itemGroupItemId: number) {
    return this.mappingModel.deleteOne({ itemGroupItemId }).exec();
  }
}