import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'itemgroupitems' })
export class ItemGroupItem extends Document {
    @Prop({ required: true, unique: true })
    itemGroupItemId: number;

    @Prop({ required: true })
    posItemGroupItemId: number;

    @Prop({ required: true })
    itemGroupId: number;

    @Prop({ required: true })
    itemId: number;
}

export const ItemGroupItemSchema = SchemaFactory.createForClass(ItemGroupItem);

ItemGroupItemSchema.index({ itemGroupId: 1, itemId: 1 }, { unique: true });