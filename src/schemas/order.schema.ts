import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Order extends Document {
    @Prop({ required: true, unique: true })
    orderId: number;

    @Prop({ required: true })
    customerId: number;

    @Prop({ required: true })
    terminalId: number;

    @Prop({ required: true })
    tableId: number;

    @Prop({ required: true, default: Date.now })
    orderDate: Date;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ default: 'false' })
    isLocked: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);