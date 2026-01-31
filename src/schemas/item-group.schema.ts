import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ItemGroup extends Document {
    @Prop({ required: true, unique: true })
    itemGroupId: number;

    @Prop({ required: true, unique: true })
    posItemGroupId: number;

    @Prop({ required: true, unique: true })
    itemGroup: string;

    @Prop({ default: true })
    isLocked: boolean;

    @Prop()
    imagePath: string;
}

export const ItemGroupSchema = SchemaFactory.createForClass(ItemGroup);