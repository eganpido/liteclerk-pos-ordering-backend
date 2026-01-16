import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemGroupItem } from '../schemas/item-group-item.schema';
import { CreateItemGroupItemDto } from './dto/create-item-group-item.dto';

@Injectable()
export class ItemGroupItemsService {
  constructor(
    @InjectModel(ItemGroupItem.name) private mappingModel: Model<ItemGroupItem>,
  ) { }

  async create(createDto: CreateItemGroupItemDto) {
    const lastRecord = await this.mappingModel.findOne().sort({ itemGroupItemId: -1 });
    const nextId = lastRecord ? lastRecord.itemGroupItemId + 1 : 1;

    const newMapping = new this.mappingModel({
      ...createDto,
      itemGroupItemId: nextId,
    });
    return newMapping.save();
  }

  // Importante: Kuhaon tanang items nga sakop sa usa ka Category
  async findByGroup(itemGroupId: number) {
    return this.mappingModel.aggregate([
      // 1. I-filter lang ang mga items ubos niini nga Group
      { $match: { itemGroupId: itemGroupId } },

      // 2. I-join ang 'items' collection
      {
        $lookup: {
          from: 'items',           // Ang ngalan sa collection sa DB (kasagaran lowercase plural)
          localField: 'itemId',    // Field sa ItemGroupItem
          foreignField: 'itemId',  // Field sa Items collection
          as: 'itemDetails'        // Ngalan sa array nga sudlanan sa info
        }
      },

      // 3. I-flatten ang array (kay ang $lookup mohatag og array bisag usa ra ang match)
      { $unwind: '$itemDetails' },

      // 4. (Optional) Pilia lang ang mga fields nga imong gusto i-return
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