import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Table extends Document {
    @Prop({ required: true, unique: true })
    tableId: number;

    @Prop({ required: true })
    tableCode: string;

    @Prop({ required: true })
    tableGroupId: number;

    @Prop({ default: false })
    isLocked: boolean;

    @Prop()
    sortNumber: number;

    @Prop({ default: 'Available' })
    status: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);