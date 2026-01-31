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

  async removeMany(ids: number[]): Promise<any> {
    const result = await this.itemModel.deleteMany({
      posItemId: { $in: ids }
    }).exec();

    return {
      statusCode: 200,
      message: `Successfully deleted ${result.deletedCount} items from cloud`
    };
  }
  async createMany(createItemDtos: any[]): Promise<any> {
    const itemCount = createItemDtos.length;

    // 1. I-increment ang counter base sa kadaghanon sa items (e.g., +10)
    const counter = await this.counterModel.findOneAndUpdate(
      { id: 'item_id' },
      { $inc: { seq: itemCount } }, // I-jump ang sequence depende sa array length
      { new: true, upsert: true }
    );

    // 2. Kalkulahon ang sugod nga ID (Starting ID)
    // Pananglitan: kung ang bag-ong seq kay 20 ug naay 5 ka items, ang sugod kay 16.
    let currentId = counter.seq - itemCount + 1;

    // 3. I-assign ang sequence sa matag item
    const itemsWithIds = createItemDtos.map((dto) => {
      const newItem = {
        ...dto,
        itemId: currentId,
      };
      currentId++; // Increment local counter
      return newItem;
    });

    // 4. I-save tanan sa usa ka bagsakan
    return await this.itemModel.insertMany(itemsWithIds);
  }
}