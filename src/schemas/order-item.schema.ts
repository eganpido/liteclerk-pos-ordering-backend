import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OrderItem extends Document {
    @Prop({ required: true, unique: true })
    orderItemId: number;

    @Prop({ required: true })
    orderId: number;

    @Prop({ required: true })
    itemId: number;

    @Prop({ required: true })
    itemDescription: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    subtotal: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
