import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true, index: true })
    userId: number;

    @Prop({ required: true, unique: true, trim: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ default: true })
    isLocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);