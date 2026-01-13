import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Customer extends Document {
    @Prop({ required: true, unique: true })
    customerId: number;

    @Prop({ required: true })
    customerName: string;

    @Prop()
    phone: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);