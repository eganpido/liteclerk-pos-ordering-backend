import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../schemas/item.schema';
import { Counter } from '../schemas/counter.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
  ) { }

  async create(createItemDto: any): Promise<Item> {
    const counter = await this.counterModel.findOneAndUpdate(
      { id: 'item_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    createItemDto.itemId = counter.seq;

    const newItem = new this.itemModel(createItemDto);
    return newItem.save();
  }

  // Get All Items
  async findAll(): Promise<Item[]> {
    return this.itemModel.find().sort({ itemId: -1 }).exec();
  }
}