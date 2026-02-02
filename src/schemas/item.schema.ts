import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Item extends Document {
    @Prop({ required: true, unique: true })
    itemId: number;

    @Prop({ required: true })
    posItemId: number;

    @Prop({ required: true })
    itemDescription: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: true })
    isInventory: boolean;

    @Prop({ default: true })
    isLocked: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);