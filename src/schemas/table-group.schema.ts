import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TableGroup extends Document {
    @Prop({ required: true, unique: true })
    tableGroupId: number;

    @Prop({ required: true })
    posTableGroupId: number;

    @Prop({ required: true, unique: true })
    tableGroup: string;

    @Prop({ default: false })
    isLocked: boolean;
}

export const TableGroupSchema = SchemaFactory.createForClass(TableGroup);